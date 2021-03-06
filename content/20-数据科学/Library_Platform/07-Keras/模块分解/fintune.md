---
title: "Keras finetune"
layout: page
date: 2099-06-02 00:00
---

[TOC]

Keras的applications模块中就提供了带有预训练权重的深度学习模型。

该模块会根据参数设置，自动检查本地的~/.keras/models/目录下是否含有所需要的权重，没有时会自动下载，在notebook上下载会占用notebook线程资源，不太方便，因此也可以手动wget。

keras应用模块applications，以MobileNet为例说明：

#-----------------------------------构建模型------------------------------------
```python
from keras.applications.mobilenet import MobileNet
from keras.layers import Input, Reshape, AvgPool2D,\
        Dropout, Conv2D, Softmax, BatchNormalization, Activation
from keras import Model

## 加载预训练权重，输入大小可以设定，include_top表示是否包括顶层的全连接层
base_model = MobileNet(input_shape=(128,128,3), include_top=False)

## 添加新层，get_layer方法可以根据层名返回该层，output用于返回该层的输出张量tensor
with tf.name_scope("output"):
    x = base_model.get_layer("conv_dw_6_relu").output
    x = Conv2D(256,kernel_size=(3,3))(x)
    x = Activation("relu")(x)
    x = AvgPool2D(pool_size=(5,5))(x)
    x = Dropout(rate=0.5)(x)
    x = Conv2D(10,kernel_size=(1,1),)(x)
    predictions = Reshape((10,))(x)

## finetune模型
model = Model(inputs=base_model.input, outputs=predictions)

#-------------------------------------训练新层-----------------------------------
## 冻结原始层位，在编译后生效
for layer in base_model.layers:
    layer.trainable = False

## 设定优化方法，并编译
sgd = keras.optimizers.SGD(lr=0.01)
model.compile(optimizer=sgd,loss="categorical_crossentropy")
‘’‘可选：记录模型训练过程、数据写入tensorboard
callback = [keras.callbacks.ModelCheckpoint(filepath="./vibration_keras/checkpoints",monitor="val_loss"),
           keras.callbacks.TensorBoard(log_dir="./vibration_keras/logs",histogram_freq=1,write_grads=True)]
’‘’

## 训练
model.fit(...)

#--------------------------------------全局微调-----------------------------------
## 设定各层是否用于训练，编译后生效
for layer in model.layers[:80]:
    layer.trainable = False
for layer in model.layers[80:]:
    layer.trainable = True

# 设定优化方法，并编译
sgd = keras.optimizer.SGD(lr=0.0001)
model.compile(optimizer=sgd, loss="categorical_crossentropy")

## 训练
model.fit(...)
获取各层名称的方法：
```