---
title: "[开发] Tensorflow中张量形状变换"
date: 2019-06-12 00:00
render: True 
tag: Tensorflow,框架,AI
---

[TOC]

# Tensorflow中张量形状变换




tf.reduce_sum(Tensor) : 降维加和，比如一个数组是333大小的，那么经过这个操作之后会变为一个数字，即所有元素的加和。
tf.reduce_mean(Tensor)：降维平均，和上面的reduce_sum一样，将高维的数组变为一个数，该数是数组中所有元素的均值。


tf.one_hot


字符串转为数字：
tf.string_to_number
(string_tensor, out_type=None, name=None)
1
2
3
转为64位浮点类型–float64：
tf.to_double(x, name=’ToDouble’)
1
2
转为32位浮点类型–float32：
tf.to_float(x, name=’ToFloat’)
1
2
转为32位整型–int32：
tf.to_int32(x, name=’ToInt32’)
1
2
转为64位整型–int64：
tf.to_int64(x, name=’ToInt64’)
1
2
将x或者x.values转换为dtype
# tensor a is [1.8, 2.2], dtype=tf.float
# tf.cast(a, tf.int32) ==> [1, 2]，dtype=tf.int32
tf.cast(x, dtype, name=None)