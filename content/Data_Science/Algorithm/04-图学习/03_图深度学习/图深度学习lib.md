---
title: "02.图神经网络模型Lib"
layout: page
date: 2019-06-17 00:00
---
[TOC]

常见图学习包的依赖关系
```dot

digraph a{
    numpy->PyTorch
    PyTorch->"PyTorch_Geometric"
    "PyTorch_Geometric"->GraphSage
    numpy->networkx
    "networkx"->GraphSage
}
```
