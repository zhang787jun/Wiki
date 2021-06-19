---
title: "Python中特有数据结构及特性"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. python 实现经典数据结构
参考：https://github.com/TheAlgorithms/Python/tree/master/data_structures


# 2. dict 字典
字典的数据结构本质是hash table[^2]


冲突处理，当key的集合很大的时候，根据生日问题（birthday problem）原理，哈希冲突实际上是不可避免的，所以几乎所有的哈希表都会有对于冲突的解决策略，常见的方法有三种;
    1）拉链法（separate chaining）：也被称为开放散列法（open hashing）或封闭定址法（closed addressing）
    2）开放定址法（open addressing），也被称为封闭散列（closed hashing）
    3）建立公共溢出区（building a public overflow area）
4）其他方法：
        ①联合哈希法（coalesced hashing）
        ②疯狂哈希法（cuckoo hashing）
        ③跳房子哈希法（hopscotch hashing）
        ④罗宾汉哈希法（robin hood hashing）
        ⑤二选哈希法（2-choice hashing）

```python

a = {'a':-1,'b':-1,'c':-1}
#python>=3.6 ： key有序,按输入顺序
a
>>> 
{'a':-1,'b':-1,'c':-1}
#python<=3.6 ：key无序
a
>>> 
{'a': -1, 'c': -1, 'b': -1}

#python 任意版本 set 无序

set(a)
>>>
{'b', 'c', 'a'}
```


Python3.6 之前的Hash实现是基于Open Addressing（开放定址法）的。类似C++中的unordered_map, 当你搜索所有的key的时候，实际上就是遍历整个表，寻找那些value不为null的entry，然后把它们的key放到一个list里面，这个 过程自然是不保证顺序的。

Python 3.6改写了dict的内部算法，因此3.6的dict是有序的，在此版本之前皆是无序（写答案当前最新版为3.6）可参考阅读PEP 468根据PEP 468，此项改进降低了dict的内存消耗大概20%-25%（对比Python 3.5）。



Python 3.6改写了dict的内部算法，因此3.6的dict是有序的，在此版本之前皆是无序（写答案当前最新版为3.6）可参考阅读PEP 468根据PEP 468，此项改进降低了dict的内存消耗大概20%-25%（对比Python 3.5）注意3.6的dict遵循的顺序是Key的插入顺序。

也就是说需要用一定顺序插入才能获得排好的结果，否则依然需要sort。另外，同样是Hash表实现的set在3.6里也依然是无序状态，这个没改最后，低版本希望有序dict可以用`collections.OrderedDict`。这是早在2.7就实装了的容器。它同样是遵循插入顺序。

```python

#!/usr/bin/python3
 
dict = {'Name': 'Runoob', 'Age': 7}
dict2 = {'Sex': 'female' }
 
dict.update(dict2)
print ("更新字典 dict : ", dict)

>>>
更新字典 dict :  {'Name': 'Runoob', 'Age': 7, 'Sex': 'female'}
```
# 3. set 集合 

基于hash表构建的，


总数 50000 （5万）： List 检索 5W次 耗时 23秒， HashSet 检索 5W次 耗时 0.01秒。

总数 5000   （5千）： List 检索 5K次 耗时 0.16秒， HashSet 检索 5K次 耗时 0.001秒。

总数 500     （5百）： List 检索 500次 耗时 0.004秒， HashSet 检索 500次 耗时 0.000秒。

总数 50                    ： List 检索 50次  耗时 0.002秒， HashSet 检索 500次 耗时 0.000秒。

 

 

集合查找元素，

当总数超过 10 时，       HashSet<T>  的检索性能 就会比 List<T> 快。

当总数超过 1000 时，   List<T> 的检索性能 会 急速下降。

当总数超过 10000 时， List<T> 将会以 秒 为单位 的损失性能。

换言之：

> 无论怎样的数据量， HashSet<T> 的检索速度 都要比 List<T> 快。（不存在那种： 多少数据量以下，List 有优势，多少数据量以上，HashSet 有优势）

> Hastable 的查找性能 == HashSet 的查找性能，用不了 HashSet 可以用 Hashtable 替换

# 4. with 上下文管理器
```python 
with 上下文管理器对象：
    　语句体

dir(上下文管理器对象)
>>>
...
__enter__
__exit__
...
```
　　当with遇到上下文管理器对象，就会在执行语句体之前，先执行上下文管理器对象的`__enter__`方法，然后再执行语句体，执行完语句体后，最后执行`__exit__`方法


# 5. 高阶函数

什么是**高阶函数**？（不是高级函数）
把函数名当做参数传给另外一个函数，在另外一个函数中通过参数调用执行

```python 
#!/usr/bin/python3

def func_x(x):
    return x * 2

def func_y(y):
    return y * 3

def func_z(x, y):
    # 等价于 return func_x(5) + func_y(3)
    return x(5) + y(3)

if __name__ == '__main__':
    # 把函数当做参数，本质上是把函数的内存地址当做参数传递过去，
    result = func_z(func_x, func_y)
    print(result)
``` 
### 5.0.1. map

### 5.0.2. sorted


# 7. Class 类

```python
obj = 12 
# obj can be an object from any class, even object.__new__(object)

class returnExistedObj(object):
    def __new__(cls):
        print("__new__ is called")
        return obj

    def __init(self):
        print("__init__ is called")

returnExistedObj()

执行结果如下：
__new__ is called
12

同时另一个需要注意的点是：
如果我们在__new__函数中不返回任何对象，则__init__函数也不会被调用。
如下面代码所示：
class notReturnObj(object):
    def __new__(cls):
        print("__new__ is called")

    def __init__(self):
        print("__init__ is called")

print(notReturnObj())

执行结果如下：
__new__ is called
None

可见如果__new__函数不返回对象的话，不会有任何对象被创建，__init__函数也不会被调用来初始化对象。
总结几个点

__init__不能有返回值
__new__函数直接上可以返回别的类的实例。如上面例子中的returnExistedObj类的__new__函数返回了一个int值。
只有在__new__返回一个新创建属于该类的实例时当前类的__init__才会被调用。如下面例子所示：
```


# 8. 魔方方法

什么是Python魔法方法?
魔法方法就如同它的名字一样神奇，总能在你需要的时候为你提供某种方法来让你的想法实现。魔法方法是指Python内部已经包含的，被双下划线所包围的方法，这些方法在进行特定的操作时会自动被调用，它们是Python面向对象下智慧的结晶。初学者掌握Python的魔法方法也就变得尤为重要了。

为什么要使用Python魔法方法?

使用Python的魔法方法可以使Python的自由度变得更高，当不需要重写时魔法方法也可以在规定的默认情况下生效，在需要重写时也可以让使用者根据自己的需求来重写部分方法来达到自己的期待。而且众所周知Python是支持面向对象的语言Python的基本魔法方法就使得Python在面对对象方面做得更好。

```python
基础魔法方法（较为常用）

__new__(cls[, ...]) 才是实例化对象调用的第一个方法，它只取下 cls 参数，并把其他参数传给 __init__。 __new__很少使用，但是也有它适合的场景(单例模式)，尤其是当类继承自一个像元组或者字符串这样不经常改变的类型的时候。

__init__(self[, ...])构造方法，初始化类的时候被调用

__del__(self)析构方法，当实例化对象被彻底销毁时被调用（实例化对象的所有指针都被销毁时被调用）

__call__(self[, args...])允许一个类的实例像函数一样被调用：x(a, b) 调用 x.__call__(a, b)

__len__(self)定义当被 len() 调用时的行为__repr__(self)定义当被 repr() 调用时的行为

__str__(self)定义当被 str() 调用时的行为__bytes__(self)定义当被 bytes() 调用时的行为

__hash__(self)定义当被 hash() 调用时的行为

__bool__(self)定义当被 bool() 调用时的行为，应该返回 True 或 False

__format__(self, format_spec)定义当被 format() 调用时的行为



属性相关的方法

__getattr__(self, name)定义当用户试图获取一个不存在的属性时的行为

__getattribute__(self, name)定义当该类的属性被访问时的行为

__setattr__(self, name, value)定义当一个属性被设置时的行为

__delattr__(self, name)定义当一个属性被删除时的行为

__dir__(self)定义当 dir() 被调用时的行为

__get__(self, instance, owner)定义当描述符的值被取得时的行为

__set__(self, instance, value)定义当描述符的值被改变时的行为

__delete__(self, instance)定义当描述符的值被删除时的行为



比较操作符

__lt__(self, other)定义小于号的行为：x < y 调用 x.__lt__(y)

__le__(self, other)定义小于等于号的行为：x <= y 调用 x.__le__(y)

__eq__(self, other)定义等于号的行为：x == y 调用 x.__eq__(y)

__ne__(self, other)定义不等号的行为：x != y 调用 x.__ne__(y)

__gt__(self, other)定义大于号的行为：x > y 调用 x.__gt__(y)

__ge__(self, other)定义大于等于号的行为：x >= y 调用 x.__ge__(y)



类型转换

__complex__(self)定义当被 complex() 调用时的行为（需要返回恰当的值）

__int__(self)定义当被 int() 调用时的行为（需要返回恰当的值）

__float__(self)定义当被 float() 调用时的行为（需要返回恰当的值）__round__(self[, n])定义当被 round() 调用时的行为（需要返回恰当的值）



容器类型（一般用于操作容器类）

__len__(self)定义当被 len() 调用时的行为（一般返回容器类的长度）

__getitem__(self, key)定义获取容器中指定元素的行为，相当于 self[key]

__setitem__(self, key, value)定义设置容器中指定元素的行为，相当于 self[key] = value

__delitem__(self, key)定义删除容器中指定元素的行为，相当于 del self[key]

__iter__(self)定义当迭代容器中的元素的行为

__reversed__(self)定义当被 reversed() 调用时的行为

__contains__(self, item)定义当使用成员测试运算符（in 或 not in）时的行为
```


# 9. collections 集合

collections是Python内建的一个集合模块，提供了许多有用的集合类。



OrderedDict 也是 dict 的子类，其最大特征是，它可以“维护”添加 key-value 对的顺序。简单来说，就是先添加的 key-value 对排在前面，后添加的 key-value 对排在后面。


```python
namedtuple
我们知道tuple可以表示不变集合，例如，一个点的二维坐标就可以表示成：

>>> p = (1, 2)
但是，看到(1, 2)，很难看出这个tuple是用来表示一个坐标的。

定义一个class又小题大做了，这时，namedtuple就派上了用场：

>>> from collections import namedtuple
>>> Point = namedtuple('Point', ['x', 'y'])
>>> p = Point(1, 2)
>>> p.x
1
>>> p.y
2
namedtuple是一个函数，它用来创建一个自定义的tuple对象，并且规定了tuple元素的个数，并可以用属性而不是索引来引用tuple的某个元素。

这样一来，我们用namedtuple可以很方便地定义一种数据类型，它具备tuple的不变性，又可以根据属性来引用，使用十分方便。

可以验证创建的Point对象是tuple的一种子类：

>>> isinstance(p, Point)
True
>>> isinstance(p, tuple)
True
类似的，如果要用坐标和半径表示一个圆，也可以用namedtuple定义：

# 2. namedtuple('名称', [属性list]):
Circle = namedtuple('Circle', ['x', 'y', 'r'])
deque
使用list存储数据时，按索引访问元素很快，但是插入和删除元素就很慢了，因为list是线性存储，数据量大的时候，插入和删除效率很低。

deque是为了高效实现插入和删除操作的双向列表，适合用于队列和栈：

>>> from collections import deque
>>> q = deque(['a', 'b', 'c'])
>>> q.append('x')
>>> q.appendleft('y')
>>> q
deque(['y', 'a', 'b', 'c', 'x'])
deque除了实现list的append()和pop()外，还支持appendleft()和popleft()，这样就可以非常高效地往头部添加或删除元素。

defaultdict
使用dict时，如果引用的Key不存在，就会抛出KeyError。如果希望key不存在时，返回一个默认值，就可以用defaultdict：

>>> from collections import defaultdict
>>> dd = defaultdict(lambda: 'N/A')
>>> dd['key1'] = 'abc'
>>> dd['key1'] # key1存在
'abc'
>>> dd['key2'] # key2不存在，返回默认值
'N/A'
注意默认值是调用函数返回的，而函数在创建defaultdict对象时传入。

除了在Key不存在时返回默认值，defaultdict的其他行为跟dict是完全一样的。

OrderedDict
使用dict时，Key是无序的。在对dict做迭代时，我们无法确定Key的顺序。

如果要保持Key的顺序，可以用OrderedDict：

>>> from collections import OrderedDict
>>> d = dict([('a', 1), ('b', 2), ('c', 3)])
>>> d # dict的Key是无序的
{'a': 1, 'c': 3, 'b': 2}
>>> od = OrderedDict([('a', 1), ('b', 2), ('c', 3)])
>>> od # OrderedDict的Key是有序的
OrderedDict([('a', 1), ('b', 2), ('c', 3)])
注意，OrderedDict的Key会按照插入的顺序排列，不是Key本身排序：

>>> od = OrderedDict()
>>> od['z'] = 1
>>> od['y'] = 2
>>> od['x'] = 3
>>> list(od.keys()) # 按照插入的Key的顺序返回
['z', 'y', 'x']
OrderedDict可以实现一个FIFO（先进先出）的dict，当容量超出限制时，先删除最早添加的Key：

from collections import OrderedDict

class LastUpdatedOrderedDict(OrderedDict):

    def __init__(self, capacity):
        super(LastUpdatedOrderedDict, self).__init__()
        self._capacity = capacity

    def __setitem__(self, key, value):
        containsKey = 1 if key in self else 0
        if len(self) - containsKey >= self._capacity:
            last = self.popitem(last=False)
            print('remove:', last)
        if containsKey:
            del self[key]
            print('set:', (key, value))
        else:
            print('add:', (key, value))
        OrderedDict.__setitem__(self, key, value)

ChainMap
ChainMap可以把一组dict串起来并组成一个逻辑上的dict。ChainMap本身也是一个dict，但是查找的时候，会按照顺序在内部的dict依次查找。

什么时候使用ChainMap最合适？举个例子：应用程序往往都需要传入参数，参数可以通过命令行传入，可以通过环境变量传入，还可以有默认参数。我们可以用ChainMap实现参数的优先级查找，即先查命令行参数，如果没有传入，再查环境变量，如果没有，就使用默认参数。

下面的代码演示了如何查找user和color这两个参数：

from collections import ChainMap
import os, argparse

# 3. 构造缺省参数:
defaults = {
    'color': 'red',
    'user': 'guest'
}

# 4. 构造命令行参数:
parser = argparse.ArgumentParser()
parser.add_argument('-u', '--user')
parser.add_argument('-c', '--color')
namespace = parser.parse_args()
command_line_args = { k: v for k, v in vars(namespace).items() if v }

# 5. 组合成ChainMap:
combined = ChainMap(command_line_args, os.environ, defaults)

# 6. 打印参数:
print('color=%s' % combined['color'])
print('user=%s' % combined['user'])
没有任何参数时，打印出默认参数：

$ python3 use_chainmap.py 
color=red
user=guest
当传入命令行参数时，优先使用命令行参数：

$ python3 use_chainmap.py -u bob
color=red
user=bob
同时传入命令行参数和环境变量，命令行参数的优先级较高：

$ user=admin color=green python3 use_chainmap.py -u bob
color=green
user=bob
Counter
Counter是一个简单的计数器，例如，统计字符出现的个数：

>>> from collections import Counter
>>> c = Counter()
>>> for ch in 'programming':
...     c[ch] = c[ch] + 1
...
>>> c
Counter({'g': 2, 'm': 2, 'r': 2, 'a': 1, 'i': 1, 'o': 1, 'n': 1, 'p': 1})
Counter实际上也是dict的一个子类，上面的结果可以看出，字符'g'、'm'、'r'各出现了两次，其他字符各出现了一次。
```
小结
collections模块提供了一些有用的集合类，可以根据需要选用。

Python作为一个“内置电池”的编程语言，标准库里面拥有非常多好用的模块。比如今天想给大家 介绍的 collections 就是一个非常好的例子。
基本介绍

我们都知道，Python拥有一些内置的数据类型，比如str, int, list, tuple, dict等， collections模块在这些内置数据类型的基础上，提供了几个额外的数据类型：

    namedtuple(): 生成可以使用名字来访问元素内容的tuple子类
    deque: 双端队列，可以快速的从另外一侧追加和推出对象
    Counter: 计数器，主要用来计数
    OrderedDict: 有序字典
    defaultdict: 带有默认值的字典

namedtuple()

namedtuple主要用来产生可以使用名称来访问元素的数据对象，通常用来增强代码的可读性， 在访问一些tuple类型的数据时尤其好用。
举个栗子


# 10. abc

abc --- 抽象基类
源代码： Lib/abc.py

该模块提供了在 Python 中定义 抽象基类 (ABC) 的组件，在 PEP 3119 中已有概述。查看 PEP 文档了解为什么需要在 Python 中增加这个模块。（也可查看 PEP 3141 以及 numbers 模块了解基于 ABC 的数字类型继承关系。）

collections 模块中有一些派生自 ABC 的具体类；当然这些类还可以进一步被派生。此外，collections.abc 子模块中有一些 ABC 可被用于测试一个类或实例是否提供特定的接口，例如它是否可哈希或它是否为映射等。

该模块提供了一个元类 ABCMeta，可以用来定义抽象类，另外还提供一个工具类 ABC，可以用它以继承的方式定义抽象基类。

class abc.ABC
一个使用 ABCMeta 作为元类的工具类。抽象基类可


# 11. 参考资料
[^1]:理解 Python 装饰器看这一篇就够了
https://foofish.net/python-decorator.html
[^2]:wiki 哈希表 https://en.wikipedia.org/wiki/Hash_table