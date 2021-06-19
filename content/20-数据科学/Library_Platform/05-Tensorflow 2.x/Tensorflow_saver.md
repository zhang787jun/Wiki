---
title: "Tensorflow 2.0 模型的保存与加载"
date: 2019-06-12 00:00
render: True 
tag: Tensorflow,框架,AI,
---

[TOC]

# 保存什么


## 1.2. 理论上需要保存什么

主要是：

| 编号 | 项目                   |
| ---- | ---------------------- |
| 1    | 图信息                 |
| 2    | 变量信息               |
| 3    | 其他信息（服务器信息） |

#### 1.2.1. 图信息
图被定义为 “一些 Operation（Node节点） 和 Tensor（Edge边缘） 的集合”。

**图信息的主要内容包括： 1.Node节点信息;2.边信息（Tensor）**

##### 1.2.1.1. Node节点信息--operation
   图中的节点又称为算子，它代表一个操作（operation，OP），一般用来表示施加的数学运算，也可以表示数据输入（feed in）的起点以及输出（push out）的终点，或者是读取/写入持久 变量（persistent variable）的终点。

Operation包含OpDef和NodeDef两个主要成员变量。
1. OpDef描述了op的静态属性信息，例如op入参列表，出参列表等。
2. NodeDef则描述op的动态属性信息，例如op运行的设备信息，用户给op设置的name等。包括placeholder,placeholder 是tensor 

```python
[op.values() for op in tf.get_default_graph().get_operations()]
```
##### 1.2.1.2. Edge边缘信息--Tensor
边用来表示计算的数据，它经过上游节点计算后得到，然后传递给下游节点进行运算。

Tensor中主要包含两类信息：
1. 是Graph结构信息，如边的源节点和目标节点(有向图)。
2. 它所保存的数据信息，例如数据类型，shape等（tensor.shape/tensor.dytpe）。


#### 1.2.2. 参数信息

tf.Varibel 


