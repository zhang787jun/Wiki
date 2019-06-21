---
title: "swig--Tensorflow等框架背后的Python/C++ 混合编程技术"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# swig--Tensorflow等框架背后的Python/C++ 混合编程技术

参考：
https://github.com/swig/swig
http://www.swig.org/

## 1. 简介 

SWIG (Simplified Wrapper and Interface Generator) ，即简化包以及接口生成器，为脚本语言(avascript, Perl, PHP, Python,tcl，perl，python等)提供了C和C++的接口。

SWIG在1995年在Los Alamos National Laborator为开发一个用户接口应运而生。SWIG把科学家从繁杂的编写接口的工作中解脱出来，使他们把更多的时间投入到更加重要的部分上去。Google App Enginer ,Tensorflow 也在用SWIG。同样的功能可以用C API ，CTypes，和C++的Boost库实现.

SWIG是一个编译器，可以处理C++的声明等。

### python如何利用SWIG
python 可以现实以下功能：
1. 用Python调用C/C++库
2. 用Python继承C++类，并在Python中使用该继承类
3. C++使用Python扩展

## 2. 配置与安装

### 2.1 安装前准备 
1. python 
2. C/C++编译器

For Linux:
大部分版本的Linux自带python，但通过python调用c++需要python-dev版本

以下是需要python-dev的情况：

1. 你需要自己安装一个源外的python类库, 而这个类库内含需要编译的调用python api的c/c++文件  //如：安装使用WiringpisPi库需要python-dev
2. 你自己写的一个程序编译需要链接libpythonXX.(a|so)
(注:以上不含使用ctypes/ffi或者裸dlsym方式直接调用libpython.so)

其他正常使用python或者通过安装源内的python类库的不需要python-dev.

```shell
sudo apt-get install python3-dev 
sudo apt-get install python-dev 
```

### 2.2 安装
For Windows 
下载地址：http://www.swig.org/download.html

For Lunix
```shell
sudo apt install swig
```


python和python-dev

linux发行版通常会把类库的头文件和相关的pkg-config分拆成一个单独的xxx-dev(el)包.    //pkg=package,包裹

以python为例,

gcc # C编译器


## 3. 示例

### 1. 准备文件
清单：
1.  C++/C文件（包括：.h头文件和cpp文件）
2.  接口文件(.i文件)

#### 1.  C++/C文件
c++头文件(example.h )
```c++
#include <iostream>
using namespace std;
class Example{
    public:
    void say_hello();
};
```
c++文件 (example.cpp)
```C++
#include "example.h"

void Example::say_hello(){
    cout<<"hello"<<endl;
}
```
#### 2.  接口文件
新建接口文件 example.i 文件
```c++

%module example
%{
#include "example.h"
%}
%include "example.h"
```
#####　　语法及结构 

SWIG接口文件的结构
1. 模块名称声明
```c++
% module <module-name>
```
2. 接口声明
声明接口中要暴露哪些内容(Example类)
```c++
%include "example.h"
```
3. 内容声明
内容声明里面的内容xxx 将复制到swig生成的封装文件代码中(如：本例的`example_wrap.cxx`，如果`example_wrap.cxx` line 1 中没有 #include "example.h" ,则`example_wrap.cxx` 无法完成编译。
```c++
%{ xxx %}
//xxx 代表内容
```



```shell
tree
>>>
├── swig_example
│   ├── example.cpp
│   ├── example.h
│   └── example.i
```
### 2. 构建python模块
1. 运行swig,生成封装的C++源文件和python脚本文件，
2. 将C/C++源文件放到C扩展库编译，构建python模块

#### 1. 生成封装的C++源文件和python脚本文件
```shell
swig [ options ] filename
swig -help # 参考帮助文件
```
参考文档： 5.1 Running SWIG
http://www.swig.org/Doc1.3/SWIGDocumentation.html#Preface

```shell
swig -c\+\+ -python example.i
# 生成`example_wrap.cxx`,`example.py` 文件

tree
>>>
├── swig_example
│   ├── example.cpp
│   ├── example.h
│   ├── example.i
│   ├── example.py
│   └── example_wrap.cxx
```

swig -c++ -python example.i 命令生成了两个文件：example_wrap.cxx, example.py。example_wrap.cxx里会对Example类提供类使以下的扁平接口:
```c+++
Example* new_Example();
void say_hello(Example* example);
viod delete_Example(Example *example);
```
这个接口被编译到_example.so里，_example可以做为一个 Python module 直接加载到 Python 解释器中。 example.py 利用 _example 里提供的接口，将扁平的接口还原为 Python 的 Example 类，这个类做为 C++ Example 类的代理类型，这样使用方式就更加自然了。

.so（shared object）的文件是Linux下的程序函数库,即编译好的可以供其他程序使用的代码和数据
#### 2. 编译模块 

1. gcc 直接编译
```shell
# 编译模块，构建example module
gcc -fPIC -I/usr/include/python3.6/ -lstdc\+\+ -shared -o _example.so example_wrap.cxx example.cpp
```
这里有一个-fPIC参数 
PIC就是position independent code 
PIC使.so文件的代码段变为真正意义上的共享 
如果不加-fPIC,则加载.so文件的代码段时,代码段引用的数据对象需要重定位, 重定位会修改代码段的内容,这就造成每个使用这个.so文件代码段的进程在内核里都会生成这个.so文件代码段的copy.每个copy都不一样,取决于 这个.so文件代码段和数据段内存映射的位置. 

2 . python distutils 编译

编译过程也可以通过python 的distutils库 实现，新建 `setup.py` 文件 完成编译工作
```python
#!/usr/bin/env python

from distutils.core import setup, Extension

example_module = Extension('_example',
    sources=['example.cpp', 'example_wrap.cxx',],
)

setup (
    name = 'example',
    version = '0.1',
    author = "zhang787jun",
    description = """Simple swig C\+\+/Python example""",
    ext_modules = [example_module],
    py_modules = ["example"],
)
```
`setup.py` 文件的核心是distutils库， Distutils可以用来在Python环境中构建和安装额外的模块。新的模块可以是纯Python的，也可以是用C/C++写的扩展模块，或者可以是Python包，包中包含了由C和Python编写的模块。



```shell
python setup.py build_ext --inplace
#python setup.py [global_opts] cmd1 [cmd1_opts] [cmd2 [cmd2_opts] ...]
```

```python
>>> import example
# 1 .从本文件夹下的example.py导入 example 库
>>> example.Example().say_hello()
hello

#2.example.py 中实例化 Example类，并调用Example类的say_hello()函数

#say_hello()函数返回的 是 _example.Example_say_hello(self)
```

## Tensorflow 中的应用

Tensorflow框架开放python作为其前端调用程序语言，后台依然是C++在运行,基于python的内存/运算管理 均不能反应在TF程序中。

<img src="/attach/images/python/tensorflow_structure.png">
<img src="/attach/images/python/tensorflow_swig.png">
<img src="/attach/images/python/tensorflow_structure2.png">







