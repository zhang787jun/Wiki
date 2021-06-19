---
title: "TensorFlow中的数据类型"
date: 2019-06-12 00:00
render: True 
tag: Tensorflow,框架,AI,
---

[TOC]
# 1. Tensor 的基本格式
```python

tf.constant([[1,2],[3,4]])
```


# 2. 格式转换

## 2.1. numpy->tensor
```python
tf.convert_to_tensor(
    value, dtype=None, dtype_hint=None, name=None
)
```
## 2.2. tensor->numpy

```python
# tensorflow 1.x 
with tf.Session() as sess:
    data_numpy = data_tensor.eval()

# tensorflow 2.x 
data_numpy = data_tensor.numpy()
```
# 3. shape 转换

## 3.1. NHWC <–> NCHW：
```python
import tensorflow as tf

x = tf.reshape(tf.range(24), [1, 3, 4, 2])
out = tf.transpose(x, [0, 3, 1, 2])

print x.shape
print out.shape
(1, 3, 4, 2)
(1, 2, 3, 4)
NCHW –> NHWC：
import tensorflow as tf

x = tf.reshape(tf.range(24), [1, 2, 3, 4])
out = tf.transpose(x, [0, 2, 3, 1])

print x.shape
print out.shape
(1, 2, 3, 4)
(1, 3, 4, 2)
```