---
title: "00-Python高性能编程101"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 优秀的参考资料


[电子书：Python高性能编程](https://readbook.readthedocs.io/zh_CN/readbook/book/Python%E9%AB%98%E6%80%A7%E8%83%BD%E7%BC%96%E7%A8%8B.html)



第1章　理解高性能Python　1
第2章　通过性能分析找到瓶颈　15
第3章　列表和元组　58
第4章　字典和集合　69
第5章　迭代器和生成器　84
第6章　矩阵和矢量计算　94
第7章　编译成C　126
第8章　并发　171
第9章　multiprocessing模块　193
第10章　集群和工作队列　251
第11章　使用更少的RAM　273
第12章　现场教训　311

# 2. Python 的性能
## 2.1. Python 有多慢

2–10x slower than another language, 

## 2.2. Python为什么慢


首先，语言实现具有速度，Python作为一种语言是一组规则（其语法和语义），因此没有“速度”。只有特定的语言实现可以具有可衡量的速度，然后我们才可以将性能与另一种语言的特定实现进行比较。通常，您无法将一种语言与另一种语言的速度进行比较-您只能比较实现。

使用Python时，有几种实现-CPython（带有或不带有Psyco，一个专门用于CPython的编译器），IronPython，Jython，PyPy-加上几个实现Python子集（Tinypy）甚至可以将Python子集编译为C ++的部分实现。

（Shedskin）。如果您说Python运行缓慢，那么您在谈论哪种具体实现？

话虽这么说，作为一种动态语言，Python对于某些特定的基准测试通常比某些其他语言的标准实现要慢（尽管它比其他许多语言要快）。作为一种动态语言，只能在运行时确定有关程序的许多信息。这意味着许多依赖于在编译时了解对象类型的常见编译器技巧无法正常工作。尽管如此，仍然可以做很多事情来提高动态语言的性能（许多人相信，除了静态类型语言的性能之外），其中一些已经在像Strongtalk这样的虚拟机中完成过，并且正在在Python中进行探索。在PyPy JIT编译器跟踪。 最后，使用执行概要分析器（例如Python概要文件或cprofile模块）提供了加快执行速度的关键信息。大多数程序将大部分执行时间花费在对操作系统库的调用上，并且执行权衡不太直观。例如，跨网络的许多小型数据请求比一个较大的单个请求要慢得多。实际上，Python代码执行速度足够快。


### 2.2.1. GIL
> It’s the GIL (Global Interpreter Lock)


“It’s because its interpreted and not compiled”
“It’s because its a dynamically typed language”

在进行代码的性能优化之前，我们先简单分析Python性能较低的原因：

### 2.2.2. 过于强大的动态
Python是一个非常动态的语言，而这使得为Python提供JIT(Just in Time Compiler)异常困难。

### 2.2.3. 内存分布不紧凑
由于python数据内存分布不紧凑，导致没有很好的利用L1/L2 缓存进行加速。

由于硬件技术的限制，我们可以制造出容量很小但很快的存储器，也可以制造出容量很大但很慢的存储器，但不可能两边的好处都占着，不可能制造出访问速度又快容量又大的存储器。因此，现代计算机都把存储器分成若干级，称为Memory Hierarchy，按照离CPU由近到远的顺序依次是CPU寄存器、Cache、内存、硬盘，越靠近CPU的存储器容量越小但访问速度越快。

大多数程序的行为都具有局部性（Locality）的特点：它们会花费大量的时间反复执行一小段代码（例如循环），或者反复访问一个很小的地址范围中的数据（例如访问一个数组）。所以预读缓存可以有效的提高程序的运行效率：CPU取一条指令，我把和它相邻的指令也都缓存起来，CPU很可能马上就会取到；CPU访问一个数据，我把和它相邻的数据也都缓存起来，CPU很可能马上就会访问到。

但由于python的数据缺乏局部性的特点，导致于都缓存的失效，以下显示了一个列表内部元素的地址分布情况





# 3. 怎么提升

## 3.1. 基础 


## 3.2. 密集型任务
I/O 密集型：异步编程
Gevent
Tornado
Asyncio
## 3.3. CPU 密集型：

多核 CPU 进行多进程
Multiprocessing
multiprocessing.Pool
内存共享
multiprocessing.Manager()
redis等中间件
mmap



