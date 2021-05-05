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

