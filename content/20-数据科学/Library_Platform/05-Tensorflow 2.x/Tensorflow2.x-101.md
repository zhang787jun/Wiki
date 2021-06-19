---
title: "01-Tensorflow 2.X-101"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 关闭 Tensorflow 2.X
学习Tensorflow 2.X 的第一步就是关闭Tensorflow 2.X

```python
import tensorflow.compat.v1 as tf
tf.compat.v1.disable_eager_execution()
```