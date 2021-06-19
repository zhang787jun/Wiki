---
title: "YAML--Yet Another Markup Language"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 概述
YAML 是一种适合人阅读（可读性强）的**数据序列化**语言。通常用于配置文件、数据存储与传送。

YAML 是 "YAML Ain't a Markup Language"（YAML 不是一种标记语言）的递归缩写。在开发的这种语言时，YAML 的意思其实是："Yet Another Markup Language"（仍是一种标记语言）。

YAML 的语法和其他高级语言类似，并且可以简单表达清单、散列表，标量等数据形态。它使用空白符号缩进和大量依赖外观的特色，特别适合用来表达或编辑数据结构、各种配置文件、倾印调试内容、文件大纲（例如：许多电子邮件标题格式和YAML非常接近）。

YAML 的配置文件后缀为 `.yml`，如：runoob.yml 。
# 2. 语法
## 2.1. 基本语法
1. 大小写敏感
2. 使用缩进表示层级关系
3. 缩进不允许使用tab，只允许空格
4. 缩进的空格数不重要，只要相同层级的元素左对齐即可
5. `#`表示注释

### 2.1.1. 引用
`& `锚点和`*`别名，可以用来引用:
```yml
# &+<object_name>
&<对象名>
*<对象名>
```


```yml
defaults: &defaults
  adapter:  postgres
  host:     localhost

development:
  database: myapp_development
  <<: *defaults

test:
  database: myapp_test
  <<: *defaults
```
相当于:
```yml
defaults:
  adapter:  postgres
  host:     localhost

development:
  database: myapp_development
  adapter:  postgres
  host:     localhost

test:
  database: myapp_test
  adapter:  postgres
  host:     localhost
# & 用来建立锚点（defaults），<< 表示合并到当前数据，* 用来引用锚点。
```

下面是另一个例子:
```yml
- &showell Steve 
- Clark 
- Brian 
- Oren 
- *showell 
```
转为 JavaScript 代码如下:

[ 'Steve', 'Clark', 'Brian', 'Oren', 'Steve' ]




# 3. 数据类型
YAML 支持以下几种数据类型：

1. `对象` ：键值对的集合，又称为映射（mapping）/ 哈希（hashes） / 字典（dictionary）
2. `数组`：一组按次序排列的值，又称为序列（sequence） / 列表（list）
3. `纯量`（scalars）：单个的、不可再分的值
## 3.1. YAML 对象 (key value 字典)
对象键值对使用冒号结构表示 key: value，冒号后面要加一个空格。

也可以使用 key:{key1: value1, key2: value2, ...}。

还可以使用缩进表示层级关系；
```yml
key: 
    child-key: value
    child-key2: value2
```
较为复杂的对象格式，可以使用问号加一个空格(`?<blank>`-`? `  )代表一个复杂的 key，配合一个冒号加一个空格(`:<blank>`-`: `  )代表一个 value：
```yml
?  
    - complexkey1
    - complexkey2
:
    - complexvalue1
    - complexvalue2
```
意思即对象的key是一个数组 [complexkey1,complexkey2]，对应的值也是一个数组 [complexvalue1,complexvalue2]


## 3.2. YAML 数组 (list)
以 - 开头的行表示构成一个数组：
```yml
- A
- B
- C
```
上面类似python中的
```python
[A,B,C]
```
YAML 支持多维数组，可以使用行内表示：
```yml
key: [value1, value2, ...]
```
数据结构的子成员是一个数组，则可以在该项下面缩进一个空格。
```yml
 - A
 - B
 - C
```
一个相对复杂的例子：
```yml
companies:
    -
        id: 1
        name: company1
        price: 200W
    -
        id: 2
        name: company2
        price: 500W
```
意思是 companies 属性是一个数组，每一个数组元素又是由 id、name、price 三个属性构成。

数组也可以使用流式(flow)的方式表示：
```yml
companies: [{id: 1,name: company1,price: 200W},{id: 2,name: company2,price: 500W}]
```
复合结构
数组和对象可以构成复合结构，例：

```yml
languages:
  - Ruby
  - Perl
  - Python 
websites:
  YAML: yaml.org 
  Ruby: ruby-lang.org 
  Python: python.org 
  Perl: use.perl.org
```
转换为 json 为：
```js
{ 
  languages: [ 'Ruby', 'Perl', 'Python'],
  websites: {
    YAML: 'yaml.org',
    Ruby: 'ruby-lang.org',
    Python: 'python.org',
    Perl: 'use.perl.org' 
  } 
}
```
## 3.3. 纯量(基本量)
纯量是最基本的，不可再分的值，包括：
1. 字符串
2. 布尔值
3. 整数
4. 浮点数
5. Null
6. 时间
7. 日期

使用一个例子来快速了解纯量的基本使用：
```yml
boolean: 
    - TRUE  #true,True都可以
    - FALSE  #false，False都可以
float:
    - 3.14
    - 6.8523015e+5  #可以使用科学计数法
int:
    - 123
    - 0b1010_0111_0100_1010_1110    #二进制表示
null:
    nodeName: 'node'
    parent: ~  #使用~表示null
string:
    - 哈哈 # 字符串默认不使用引号表示。
    - 'Hello world'  #可以使用双引号或者单引号包裹特殊字符
    - newline 
      newline2    #字符串可以拆成多行，每一行会被转化成一个空格
date:
    - 2018-02-17    #日期必须使用ISO 8601格式，即yyyy-MM-dd
datetime: 
    -  2018-02-17T15:02:31+08:00    #时间使用ISO 8601格式，时间和日期之间使用T连接，最后使用+代表时区
```

# 4. 到底是 `.yaml` 还是 `.yml`

文件扩展名对文件内容没有任何影响或影响。您可以将YAML内容保存为具有任何扩展名的文件：.yml，.yaml或其他任何内容。 （相当稀疏）YAML FAQ recommends您使用.yaml优先于.yml，但由于历史原因，许多Windows程序员仍然害怕使用超过三个字符的扩展名，因此选择使用.yml代替。

因此，真正重要的是文件内部的内容，而不是其扩展名。

# 5. 参考资料

[^1]: yaml 官网 https://yaml.org/