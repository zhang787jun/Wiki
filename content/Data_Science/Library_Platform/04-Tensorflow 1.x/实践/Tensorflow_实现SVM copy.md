---
title: "Tensorflow 实现SVM"
date: 2019-06-12 00:00
render: True 
tag: Tensorflow,框架,AI,
---

[TOC]

# Tensorflow 实现SVM

## 1. 线性SVM

```python

import tensorflow as tf
import numpy as np
#from matplotlib import pyplot as plt


class Line_SVM(object):
    def __init__(self):
        self.x = tf.placeholder("float", shape=[None, 2], name="x_batch")
        self.y = tf.placeholder("float", shape=[None, 1], name="y_batch")
        self.sess = tf.Session()

    def creat_databases(self, size, n_dim=2, center=0, dis=2, scale=1, one_hot=False):
        center1 = (np.random.random(n_dim) + center - 0.5)*scale+dis
        center2 = (np.random.random(n_dim) + center + 0.5) * scale + dis
        cluster1 = (np.random.randn(size, n_dim) + center1) * scale
        cluster2 = (np.random.randn(size, n_dim) + center2) * scale
        x_data = np.vstack((cluster1, cluster2)).astype(np.float32)
        y_data = np.array([1] * size + [-1] * size)
        indices = np.random.permutation(size * 2)
        x_data, y_data = x_data[indices], y_data[indices]
        y_data = np.reshape(y_data, (y_data.shape[0], 1))
        if not one_hot:
            return x_data, y_data
        else:
            y_data = np.array([[0, 1] if label == 1 else [1, 0]
                               for label in y_data])
            return x_data, y_data

    def get_base(self, _nx, _ny):
        """获取基
        """
        _xf = np.linspace(self.x_min, self.x_max, _nx)
        _yf = np.linspace(self.y_min, self.y_max, _ny)
        n_xf, x_yf = np.meshgrid(_xf, _yf)
        c = np.c_[n_xf.revel(), n_yf.revel()]
        return _xf, _xf, c

    def train(self, steps, x_data, y_data):
        w = tf.Variable(np.ones([2, 1]), dtype=tf.float32, name="w_v")
        b = tf.Variable(0., dtype=tf.float32, name="b_v")

        self.y_pred = tf.matmul(self.x, w) + b

        cost = tf.nn.l2_loss(
            w) + tf.reduce_sum(tf.maximum(1-self.y*self.y_pred, 0))
        train_step = tf.train.AdamOptimizer(0.01).minimize(cost)

        self.y_predict = tf.sign(tf.matmul(self.x, w) + b)
        self.sess.run(tf.global_variables_initializer())
        for step in range(steps):
            index = np.random.permutation(y_data.shape[0])
            x_data1, y_data1 = x_data[index], y_data[index]
            self.sess.run(train_step, feed_dict={
                          self.x: x_data[0:50], self.y: y_data1[0:50]})
            self.y_predict_value, self.w_value, self.b_value, cost_value = self.sess.run(
                [self.y_predict, w, b, cost], feed_dict={self.x: x_data, self.y: y_data})
            if step % 1000 == 0:
                print("step={}/{}，cost={}".format(step, steps, cost_value))

    def predict(self, y_data):
        correct = tf.equal(self.y_predict_value, y_data)
        precision = tf.reduce_mean(tf.cast(correct, tf.float32))
        precision_value = self.sess.run(precision)
        return precision_value, self.y_predict_value



def main():
    svm = Line_SVM()
    x_data, y_data = svm.creat_databases(size=200, n_dim=2, center=0, dis=4)
    svm.train(5000, x_data,
    )
    precision_value, y_predict_value = svm.predict(y_data)
    print(" precision_value={}, y_predict_value={}".format(
        precision_value, y_predict_value))


if __name__ == "__main__":
    main()

```