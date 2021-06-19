---
title: "02_CMake 基础"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# 1. CMake 是什么
CMake(Cross platform MAke)是个一个<**开源**>的<**跨平台**>自动化<**建构(build)**>系统，用来管理软件建置的程序，并不相依于某特定编译器。

并可支持多层目录、多个应用程序与多个库。 

它用配置文件控制建构过程（build process）的方式和Unix的make相似，只是CMake的配置文件取名为CMakeLists.txt。

CMake并不直接建构出最终的软件，而是产生标准的建构档（如Unix的Makefile或Windows Visual C++的projects/workspaces），然后再依一般的建构方式使用。

这使得熟悉某个集成开发环境（IDE）的开发者可以用标准的方式建构他的软件，这种可以使用各平台的原生建构系统的能力是CMake和SCons等其他类似系统的区别之处。

它首先允许开发者编写一种平台无关的CMakeList.txt 文件来定制整个编译流程，然后再根据目标用户的平台进一步生成所需的本地化 Makefile 和工程文件，如 Unix的 Makefile 或 Windows 的 Visual Studio 工程。从而做到“Write once, run everywhere”。显然，CMake 是一个比上述几种 make 更高级的编译配置工具。
# 2. 安装
## 2.1. 源码
在linux下安装cmake
首先下载源码包
```shell 
http://www.cmake.org/cmake/resources/software.html

```
这里下载的是cmake-2.6.4.tar.gz

随便找个目录解压缩

```shell
tar -xzvf cmake-2.6.4.tar.gz
cd cmake-2.6.4
```
依次执行：

```shell
./bootstrap
make
make install
```
cmakef

 会默认安装在 `/usr/local/bin` 下面


# 3. 使用 

大家都知道，写程序大体步骤为：

1. 用编辑器编写源代码，如.c文件。
2. 用编译器编译代码生成目标文件，如.o。
3. 用链接器连接目标代码生成可执行文件，如.exe。

但如果源文件太多，一个一个编译时就会特别麻烦，于是人们想到，为什么不设计一种类似批处理的程序，来批处理编译源文件呢，于是就有了make工具，它是一个自动化编译工具，你可以使用一条命令实现完全编译。但是你需要编写一个规则文件，make依据它来批处理编译，这个文件就是makefile，所以编写makefile文件也是一个程序员所必备的技能。

对于一个大工程，编写makefile实在是件复杂的事，于是人们又想，为什么不设计一个工具，读入所有源文件之后，自动生成makefile呢，于是就出现了cmake工具，它能够输出各种各样的makefile或者project文件,从而帮助程序员减轻负担。但是随之而来也就是编写cmakelist文件，它是cmake所依据的规则。所以在编程的世界里没有捷径可走，还是要脚踏实地的。

## 3.1. 流程
CMake编译流程
1. 编写文件`CMakeLists.txt`
2. 执行命令`cmake <PATH>`或者`ccmake PATH` 生成`Makefile`(PATH是CMakeLists.txt所在的目录)
3. 使用`make`命令进行编译源码生成可执行程序或共享库（so(shared object)）


## 3.2. CMakeLists.txt 语法

## 3.3. cmake CTL 语法
```shell
cmake(选项)(参数)
```

**选项**

`-G` (generator-name) 指定makefile生成器的名字。例如：cmake -G "MinGW Makefiles";注意generator是大小写敏感的，即使是在windows下。generator所用的命令(gcc,cl等)最好已经设置在环境变量PATH中。有个例外就是生成visual studio的工程不必设置环境变量，只要安装了对应的vs，cmake可以自动找到。
`-D <var>:<type>=<value>`
添加变量及值到CMakeCache.txt中。注意-D后面不能有空格，type为string时可省略。例如：cmake -DCMAKE_BUILD_TYPE:STRING=Debug。MinGW Generator默认生成CMAKE_BUILD_TYPE为空，即release；NMake Generator默认生成CMAKE_BUILD_TYPE为Debug。

`-U` <globbing_expr> 删除CMakeCache.txt中的变量。
注意-U后面不能有空格,支持globbing表达式，比如*,?等。例如：cmake -UCMAKE_BUILD_TYPE。

**参数**
<path-to-source>  指向含有顶级CMakeLists.txt (或CMakeCache.txt)的那个目录


