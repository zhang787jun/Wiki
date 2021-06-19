---
title: "为了更快的Tensorflow"
date: 2019-06-12 00:00
render: True 
tag: Tensorflow,框架,AI,
---

# 最关键--理解算法

# 最好--好的硬件

```python

import tensorflow as tf
tf.test.is_gpu_available()
tf.test.is_built_with_cuda()

```




# 最佳实践
在您的 TensorFlow 模型中根据以下建议（如适用）操作以实现最佳性能。

通常，请在设备上执行所有转换，并确保在平台上使用 cuDNN 和 Intel MKL 等库的最新兼容版本。

## 优化输入数据流水线
高效的数据输入流水线可以通过缩短设备空闲时间显著提高模型执行速度。考虑结合使用以下最佳做法（此处进行了详细说明），以提高数据输入流水线的效率：

预提取数据
并行处理数据执行
并行处理数据转换
在内存中缓存数据
将用户自定义函数向量化
减少应用转换时的内存用量
此外，尝试使用合成数据运行您的模型以了解输入流水线是否为性能瓶颈。

## 提升设备性能
增加训练 mini-batch 大小（每个设备在训练循环的一次迭代中使用的训练样本数量）
使用 TF Stats 了解设备端运算的运行效率
使用 tf.function 执行计算并启用 experimental_compile 标志（可选）
最大程度减少步骤之间的主机 Python 运算并减少回调。每几步（而不是每一步）计算指标
使设备计算单元保持忙碌状态
将数据同时发送到多个设备
优化数据布局以优先选择通道（例如，NCHW 优于 NHWC）。某些 GPU（例如 NVIDIA® V100）在 NHWC 数据布局下性能更好。
考虑使用 16 位数字表示，例如 fp16（IEEE 指定的半精度浮点格式）或者大脑浮点 bfloat16 格式
考虑使用 Keras 混合精度 API
在 GPU 上训练时，充分利用 TensorCore。当精度为 fp16 且输入/输出维度可被 8 或 16 整除（对于 int8）时，GPU 内核将使用 TensorCore。
其他资源
请参阅端到端 TensorBoard Profiler 教程，了解如何实现本指南中的建议。
观看 2020 TensorFlow 开发者峰会上的 TF 2 中的性能分析演讲。
# 测试

```python

import tensorflow as tf
tf.test.is_gpu_available()
tf.test.is_built_with_cuda()


import numpy as np
import tensorflow as tf
from datetime import datetime

if tf.__version__ >= "2.0.0":
    import tensorflow.compat.v1 as tf
    tf.disable_v2_behavior()

device_name = "/cpu:0"
shape = (5000, 5)
with tf.device(device_name):
    random_matrix = tf.random_uniform(shape=shape, minval=0, maxval=1)
    dot_operation = tf.matmul(random_matrix, tf.transpose(random_matrix))
    sum_operation = tf.reduce_sum(dot_operation)


startTime = datetime.now()
with tf.Session(config=tf.ConfigProto(log_device_placement=True)) as session:
    result = session.run(sum_operation)
    print(result)

# It can be hard to see the results on the terminal with lots of output -- add some newlines to improve readability.
print("\n" * 5)
print("Shape:", shape, "Device:", device_name)
print("Time taken:", datetime.now() - startTime)
print("\n" * 5)


# Time taken: 0:00:00.240356
```

