---
title: "TensorFlow Transform--数据预处理"
date: 2019-06-17 00:00
---
[TOC]

TensorFlow Transform是一个用于使用TensorFlow预处理数据的库。 tf.Transform对于需要完全通过的数据很有用，例如：

1. 通过平均值和标准偏差对输入值进行归一化。
2. 通过在所有输入值上生成词汇表，将字符串转换为整数。
  
通过根据观察到的数据分布将浮点数分配给存储桶，将浮点数转换为整数。
TensorFlow内置了对单个示例或一批示例进行操作的支持。`tf.Transform`扩展了这些功能，以支持对示例数据的全传递。

# 1. 使用步骤 

1. 定义一个 `preprocessing` 函数，即对管道的逻辑描述，该管道将原始数据转换为用于训练机器学习模型的数据。
2. 通过将预处理功能转换为Beam管道，展示用于转换数据的Apache Beam实现。
3. 显示其他用法示例。

```python

import tensorflow as tf
import tensorflow_transform as tft
import tensorflow_transform.beam as tft_beam

def preprocessing_fn(inputs):
  x = inputs['x']
  y = inputs['y']
  s = inputs['s']
  x_centered = x - tft.mean(x)
  y_normalized = tft.scale_to_0_1(y)
  s_integerized = tft.compute_and_apply_vocabulary(s)
  x_centered_times_y_normalized = x_centered * y_normalized
  return {
      'x_centered': x_centered,
      'y_normalized': y_normalized,
      'x_centered_times_y_normalized': x_centered_times_y_normalized,
      's_integerized': s_integerized
  }
  ```
