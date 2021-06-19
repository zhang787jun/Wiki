---
title: "TensorFlow中的多线程"
date: 2019-06-12 00:00
render: True 
tag: Tensorflow,框架,AI,
---

[TOC]

TensorFlow提供两个类帮助实现多线程：
1. 是tf.train.Coordinator，
2. 是tf.train.QueueRunner。

Coordinator主要用来实现多个线程同时停止，QueueRunner用来创建一系列线程。

# Coordinator
根据官方文档，Coordinator主要有三个方法：

tf.train.Coordinator.should_stop: returns True if the threads should stop.
tf.train.Coordinator.request_stop: requests that threads should stop.
tf.train.Coordinator.join: waits until the specified threads have stopped.
接下来我们实验Coordinator，下面的代码主要实现每个线程独立计数，当某个线程达到指定值的时候，所有线程终止：
```python

#encoding=utf-8
import threading
import numpy as np
import tensorflow as tf
#创建一个函数实现多线程，参数为Coordinater和线程号
def func(coord, t_id):
    count = 0
    while not coord.should_stop(): #不应该停止时计数
        print('thread ID:',t_id, 'count =', count)
        count += 1
        if(count == 5): #计到5时请求终止
            coord.request_stop()
coord = tf.train.Coordinator()
threads = [threading.Thread(target=func, args=(coord, i)) for i in range(4)]
#开始所有线程
for t in threads:
    t.start()
coord.join(threads) #等待所有线程结束
```
运行结果如下，当0号线程打印出4时，其他线程不再计数，程序终止。


# QueueRunner
QueueRunner的作用是创建一些重复进行enqueue操作的线程，它们通过coordinator同时结束。
```python

#encoding=utf-8
import numpy as np
import tensorflow as tf
batch_size = 2
#随机产生一个2*2的张量
example = tf.random_normal([2,2])
#创建一个RandomShuffleQueue，参数意义参见API
q = tf.RandomShuffleQueue(
    capacity=1000, 
    min_after_dequeue=0,
    dtypes=tf.float32,
    shapes=[2,2])
#enqueue op，每次push一个张量
enq_op = q.enqueue(example)
#dequeue op, 每次取出batch_size个张量
xs = q.dequeue_many(batch_size)
#创建QueueRunner，包含4个enqueue op线程
qr = tf.train.QueueRunner(q, [enq_op]*4)
coord = tf.train.Coordinator()
sess = tf.Session()
#启动QueueRuner，开始线程
enq_threads = qr.create_threads(sess, coord=coord, start=True)
for i in range(10):
    if coord.should_stop():
        break
    print('step:', i, sess.run(xs)) #打印结果
coord.request_stop()
coord.join(enq_threads)

```