---
title: "05-TensorRT-PyTorch-Quantization"
layout: page
date: 2099-06-02 00:00
---
[TOC]

TensorRT-PyTorch-Quantization
TensorRT官方提出的在PyTorch层面做量化支持的工具，支持量化参数的导出以写入TensorRT engine中。不禁想起了当年的TensorRT对齐经历，做PyTorch模拟量化在不确定很多硬件底层实现细节的情况下，是非常非常难做到对齐的。包括后来的NNIE量化对齐，让我养成了对齐虐我千百遍，我待对齐如初恋的良好工具人意识。这里抛出一个小问题，如下的计算图局部，TensorRT是如何插入量化节点的？欢迎知道的在评论区留言～