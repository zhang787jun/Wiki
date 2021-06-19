---
title: "Keras基础简介"
layout: page
date: 2099-06-02 00:00
---

[TOC]


# 1. 基本概念

**版本1**

Keras is a high-level neural networks API, written in Python and capable of running on top of Tensorflow, Theano or CNTK. 

**版本2**
Keras is a deep learning API written in Python, running on top of the machine learning platform TensorFlow.

**重点**
1. 是一个API，计算有基础框架执行
2. written in Python


**设计宗旨**
Keras is an API designed for human beings, not machines.



## 1.1. 与 TensorFlow 区别
TensorFlow is a free and open-source software library for data flow and differentiable programming across a range of tasks


# 2. 编程模式

三步法：
1. 选择模型
2. 构建网络层
3. 编译


```python 
from tensorflow.keras.models import Sequential  
from tensorflow.keras.layers import Dense, Dropout, Activation
from tensorflow.keras.optimizers import SGD  

# 第一步：选择模型
model = Sequential()

# 第二步：构建网络层

model.add(Dense(500,input_shape=(784,))) # 输入层，28*28=784  
model.add(Activation('tanh')) # 激活函数是tanh  
model.add(Dropout(0.5)) # 采用50%的dropout

model.add(Dense(500)) # 隐藏层节点500个  
model.add(Activation('tanh'))  
model.add(Dropout(0.5))

model.add(Dense(10)) # 输出结果是10个类别，所以维度是10  
model.add(Activation('softmax')) # 最后一层用softmax作为激活函数

# 第三步：编译

## 优化方法
sgd = SGD(lr=0.01, decay=1e-6, momentum=0.9, nesterov=True) # 优化函数，设定学习率（lr）等参数  
## 编译（损失函数、优化方法）
model.compile(loss='categorical_crossentropy', optimizer=sgd, class_mode='categorical') # 使用交叉熵作为loss函数


# 第四步：训练
# .fit的一些参数
# batch_size：对总的样本数进行分组，每组包含的样本数量
# epochs ：训练次数
# shuffle：是否把数据随机打乱之后再进行训练
# validation_split：拿出百分之多少用来做交叉验证
# verbose：屏显模式 0：不输出  1：输出进度  2：输出每次的训练结果

(X_train, y_train), (X_test, y_test) = mnist.load_data() # 使用Keras自带的mnist工具读取数据（第一次需要联网）
# 由于mist的输入数据维度是(num, 28, 28)，这里需要把后面的维度直接拼起来变成784维  
X_train = X_train.reshape(X_train.shape[0], X_train.shape[1] * X_train.shape[2]) 
X_test = X_test.reshape(X_test.shape[0], X_test.shape[1] * X_test.shape[2])  
Y_train = (numpy.arange(10) == y_train[:, None]).astype(int) 
Y_test = (numpy.arange(10) == y_test[:, None]).astype(int)

model.fit(X_train,Y_train,batch_size=200,epochs=50,shuffle=True,verbose=0,validation_split=0.3)
model.evaluate(X_test, Y_test, batch_size=200, verbose=0)
```

其中构建模型可以使用加法模式。

# 3. 构建模型的方式

## 3.1. 函数式编程 (Torch 模式)

```python 
import tensorflow as tf
 
inputs = tf.keras.Input(shape=(3,))
x = tf.keras.layers.Dense(4, activation=tf.nn.relu)(inputs)
outputs = tf.keras.layers.Dense(5, activation=tf.nn.softmax)(x)
model = tf.keras.Model(inputs=inputs, outputs=outputs)

```
## 3.2. 序列模型（加法模式）

```python
model = Sequential()

# 第二步：构建网络层

model.add(Dense(500,input_shape=(784,))) # 输入层，28*28=784  
model.add(Activation('tanh')) # 激活函数是tanh  
mod
el.add(Dropout(0.5)) # 采用50%的dropout

model.add(Dense(500)) # 隐藏层节点500个  
model.add(Activation('tanh'))  
model.add(Dropout(0.5))

model.add(Dense(10)) # 输出结果是10个类别，所以维度是10  
model.add(Activation('softmax')) # 最后一层用softmax作为激活函数

```