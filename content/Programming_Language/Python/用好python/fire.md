---
title: "Python--Fire"
layout: page
date: 2099-06-02 00:00
---

[TOC]

Fire是google开发的一个python第三方库，其作用是可以将python组件(函数调用，类调用)转换成命令行的形式去调用。

# 安装
可以直接使用pip来安装

pip install fire
1
或者可以从Fire源码安装，clole如下源码https://github.com/google/python-fire.git, 然后进入目录，运行如下命令

python setup.py install
1
使用方法
Hello world
version1: fire.Fire()
使用Fire最简单的方法是在python程序结束时调用fire.Fire(), 这会将程序的全部内容暴露给命令行。例如有如下一个程序text.py

import fire

def hello(name):
  return 'Hello {name}!'.format(name=name)

if __name__ == '__main__':
  fire.Fire(hello)
1
2
3
4
5
6
7
我们可以通过如下命令运行程序

$python test.py hello world
Hello world!
1
2
version2: fire.Fire(<fn>)
稍微改动程序，仅将hello函数暴露给命令行

import fire

def hello(name):
  return 'Hello {name}!'.format(name=name)

if __name__ == '__main__':
  fire.Fire(hello)
1
2
3
4
5
6
7
通过如下命令运行程序

$ python test.py World
Hello World!
1
2
现在我们不需要在指定hello函数，因为我们是通过fire.Fire(hello)调用的

version3: using a main
我们也可以这样来写这个程序

import fire

def hello(name):
  return 'Hello {name}!'.format(name=name)

def main():
  fire.Fire(hello)

if __name__ == '__main__':
  main()
1
2
3
4
5
6
7
8
9
10
Exposing Multiple Commands
在前面的例子中，我们向命令行暴露了一个函数。现在我们来看看如何将多个函数暴露给命令行。

version1: fire.Fire()
暴露多个命令最简单的方法是编写多个函数，然后调用Fire。 例如有如下文件example.py

import fire

def add(x, y):
  return x + y

def multiply(x, y):
  return x * y

if __name__ == '__main__':
  fire.Fire()
1
2
3
4
5
6
7
8
9
10
运行如下命令得到结果

$ python example.py add 10 20
30
$ python example.py multiply 10 20
200
1
2
3
4
注意到Fire正确地将10和20解析为数字，而不是字符串。更多关于参数解析的例子，参考https://github.com/google/python-fire/blob/master/docs/guide.md#argument-parsing

Version 2: fire.Fire()
在Version 1中，我们将所有程序的功能暴露给命令行。 而通过使用字典，我们可以有选择性地将一些函数暴露给命令行。

import fire

def add(x, y):
  return x + y

def multiply(x, y):
  return x * y

if __name__ == '__main__':
  fire.Fire({
      'add': add,
      'multiply': multiply,
  })
1
2
3
4
5
6
7
8
9
10
11
12
13
运行如下命令得到结果

$ python example.py add 10 20
30
$ python example.py multiply 10 20
200
1
2
3
4
Version 3: fire.Fire()
Fire也适用于对象，这是暴露多个命令行的一个好做法

import fire

class Calculator(object):

  def __init__(self, value):
    self.value = value

  def add(self, x, y):
    return x + y + self.value

  def multiply(self, x, y):
    return x * y + self.value

if __name__ == '__main__':
  calculator = Calculator()
  fire.Fire(calculator)
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
运行如下命令得到结果

$ python example.py add 10 20
35
$ python example.py multiply 10 20
205
1
2
3
4
Version 4: fire.Fire()
Fire也适用于类。 这是暴露多个命令的另一个好的做法。

import fire

class Calculator(object):

  def __init__(self, value):
    self.value = value

  def add(self, x, y):
    return x + y + self.value

  def multiply(self, x, y):
    return x * y + self.value

if __name__ == '__main__':
  fire.Fire(Calculator)
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
运行如下命令得到结果

$ python example.py add 10 20 --value 5
35
$ python example.py multiply 10 20 --value 5
205
1
2
3
4
与调用普通函数不同，它可以通过位置参数和命名参数（–flag语法）完成
，这里的–value 5就是将__init__中的🈯️设为5

Grouping Commands 分组命令
下面是一个如何使用分组命令创建命令行界面的示例。

class IngestionStage(object):

  def run(self):
    return 'Ingesting! Nom nom nom...'

class DigestionStage(object):

  def run(self, volume=1):
    return ' '.join(['Burp!'] * volume)

  def status(self):
    return 'Satiated.'

class Pipeline(object):

  def __init__(self):
    self.ingestion = IngestionStage()
    self.digestion = DigestionStage()

  def run(self):
    self.ingestion.run()
    self.digestion.run()

if __name__ == '__main__':
  fire.Fire(Pipeline)
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
运行如下命令

$ python example.py run
Ingesting! Nom nom nom...
Burp!
$ python example.py ingestion run
Ingesting! Nom nom nom...
$ python example.py digestion run
Burp!
$ python example.py digestion status
Satiated.
1
2
3
4
5
6
7
8
9
Accessing Properties 属性访问
Chaining Function Calls 链式函数调用
如果你想设置你的函数链式调用，你只需要设置类方法返回self。下面通过一个例子说明：

import fire

class BinaryCanvas(object):
  """A canvas with which to make binary art, one bit at a time."""

  def __init__(self, size=10):
    self.pixels = [[0] * size for _ in range(size)]
    self._size = size
    self._row = 0  # The row of the cursor.
    self._col = 0  # The column of the cursor.

  def __str__(self):
    return '\n'.join(' '.join(str(pixel) for pixel in row) for row in self.pixels)

  def show(self):
    print(self)
    return self

  def move(self, row, col):
    self._row = row % self._size
    self._col = col % self._size
    return self

  def on(self):
    return self.set(1)

  def off(self):
    return self.set(0)

  def set(self, value):
    self.pixels[self._row][self._col] = value
    return self

if __name__ == '__main__':
  fire.Fire(BinaryCanvas)
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
运行如下命令

$ python example.py move 3 3 on move 3 6 on move 6 3 on move 6 6 on move 7 4 on move 7 5 on
0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 0
0 0 0 1 0 0 1 0 0 0
0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 0
0 0 0 1 0 0 1 0 0 0
0 0 0 0 1 1 0 0 0 0
0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 0
1
2
3
4
5
6
7
8
9
10
11
我们可以看到一系列的0 1打印在了屏幕上，可以通过定义类的__str_方法来定义一个类如何输出的。
如果类存在自定义的__str_方法，则序列化并打印该对象。如果没有自定义的__str__方法，则显示对象的帮助屏幕。

more simpler way
import fire
english = 'Hello World'
spanish = 'Hola Mundo'
fire.Fire()
1
2
3
4
使用如下命令

$ python example.py english
Hello World
$ python example.py spanish
Hola Mundo
1
2
3
4
函数调用
构造函数的参数可以使用–flag语法–name = value传递。
例如，考虑如下一个简单的类

import fire

class Building(object):

  def __init__(self, name, stories=1):
    self.name = name
    self.stories = stories

  def climb_stairs(self, stairs_per_story=10):
    for story in range(self.stories):
      for stair in range(1, stairs_per_story):
        yield stair
      yield 'Phew!'
    yield 'Done!'

if __name__ == '__main__':
  fire.Fire(Building)
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
我们可以通过这种方式实例化它：python example.py --name =“Sherrerd Hall”
其他函数的参数同样可以使用–flag语法来传递。
要实例化一个Building，然后运行climb_stairs函数，以下命令都是有效的：

$ python example.py --name="Sherrerd Hall" --stories=3 climb_stairs 10
$ python example.py --name="Sherrerd Hall" climb_stairs --stairs_per_story=10
$ python example.py --name="Sherrerd Hall" climb_stairs --stairs-per-story 10
$ python example.py climb-stairs --stairs-per-story 10 --name="Sherrerd Hall"
1
2
3
4
你会注意到连字符和下划线（ -和_）在成员名称和标志名称中是可以互换的。
你还会注意到构造函数的参数可以在其他函数的参数之后或函数之前。
你还会注意到，标志名称和其值之间的等号是可选的。

带有*args和**kwargs的函数
Fire支持带*args或** kwargs的函数。 这是一个例子：

import fire

def order_by_length(*items):
  """Orders items by length, breaking ties alphabetically."""
  sorted_items = sorted(items, key=lambda item: (len(str(item)), str(item)))
  return ' '.join(sorted_items)

if __name__ == '__main__':
  fire.Fire(order_by_length)
1
2
3
4
5
6
7
8
9
运行命令

$ python example.py dog cat elephant
cat dog elephant
1
2
可以使用分隔符给函数提供参数。分隔符后的所有参数将用于处理函数的结果，而不是传递给函数本身。 默认分隔符是连字符 -。

$ python example.py dog cat elephant - upper
CAT DOG ELEPHANT
1
2
如果没有分隔符，upper会被认为是一个参数

$ python example.py dog cat elephant upper
cat dog upper elephant
1
2
你可以使用–separator标志更改分隔符。通过–将标志与你的Fire指令隔开 。 以下是我们更改分隔符的示例。

$ python example.py dog cat elephant X upper -- --separator=X
CAT DOG ELEPHANT
1
2
当函数接受*args，**kwargs或你不想指定的默认值时，分隔符会很有用。当想把"-"作为分隔符时，改变分隔符也很重要

Argument Parsing 参数解析
参数的类型取决于它们的值，而不是使用它们的函数签名。 您可以从命令行传递任何Python文本：数字，字符串，元组，列表，字典（仅在某些版本的Python中支持集合）。您也可以任意嵌套这些类型。

为了演示这个，我们将制作一个小程序，通过这个小程序告诉我们传给它的参数类型：

import fire
fire.Fire(lambda obj: type(obj).__name__)
1
2
我们可以得到如下结果

$ python example.py 10
int
$ python example.py 10.0
float
$ python example.py hello
str
$ python example.py '(1,2)'
tuple
$ python example.py [1,2]
list
$ python example.py True
bool
$ python example.py {name: David}
dict
1
2
3
4
5
6
7
8
9
10
11
12
13
14
在最后一个例子中，你会注意到裸词会自动替换为字符串。
要注意！ 如果你想传递字符串"10"而不是int 10，你需要转义或者引用你的引号。 否则，Bash将会把你的引用取消并将一个没有引号的10传递给你的Python程序，在那里Fire将把它解释为一个数字。

$ python example.py 10
int
$ python example.py "10"
int
$ python example.py '"10"'
str
$ python example.py "'10'"
str
$ python example.py \"10\"
str
1
2
3
4
5
6
7
8
9
10
要注意！ 记住Bash首先处理你的参数，然后Fire解析结果。 如果你想将dict {“name”：“David Bieber”}传递给你的程序，你可以试试这个：

$ python example.py '{"name": "David Bieber"}'  # Good! Do this.
dict
$ python example.py {"name":'"David Bieber"'}  # Okay.
dict
$ python example.py {"name":"David Bieber"}  # Wrong. This is parsed as a string.
str
$ python example.py {"name": "David Bieber"}  # Wrong. This isn't even treated as a single argument.
<error>
$ python example.py '{"name": "Justin Bieber"}'  # Wrong. This is not the Bieber you're looking for. (The syntax is fine though :))
dict
1
2
3
4
5
6
7
8
9
10
Boolean Arguments 布尔类型的参数
True和False被解析为布尔值。
你也可以通过–flag语法–name和–noname来指定布尔值，它们分别将名称设置为True和False。
继续前面的例子，我们可以运行以下任何一个：

$ python example.py --obj=True
bool
$ python example.py --obj=False
bool
$ python example.py --obj
bool
$ python example.py --noobj
bool
1
2
3
4
5
6
7
8
要注意！ 如果除另一个标志之外的标志紧跟在应该是布尔值的标志之后，该标志将取代该标志的值而不是布尔值。 您可以解决这个问题：通过在最后一个标志之后放置一个分隔符，明确指出布尔标志的值（如–obj = True），或者确保在布尔标志参数后面有另一个标志。