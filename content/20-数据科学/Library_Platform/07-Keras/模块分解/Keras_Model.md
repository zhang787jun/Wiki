---
title: "Keras Model--模型层"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 构建模型

## 1.1. 函数式编程 (Torch 模式)
本文代码基于 tensorflow2.0 python 3.7
`tf.keras.Sequential` 模型是层的简单堆叠，无法表示任意模型。


```python 
import tensorflow as tf
 
inputs = tf.keras.Input(shape=(128,))  # 构建一个输入张量
x = layers.Dense(256, activation='relu')(inputs)
x = layers.Dense(512, activation='relu')(x)
x = layers.Dense(128, activation='relu')(x)
x = layers.Dense(64, activation='relu')(x)
predictions = tf.nn.layers.Dense(10, activation='softmax')(x)
model = tf.keras.Model(inputs=inputs, outputs=predictions)

model = tf.keras.Model(inputs=inputs, outputs=outputs)

```
## 1.2. 序列模型（加法模式）


## 1.3. 模型子类化—实现自定义模型

"模型子类化"就是自己实现一个类来继承Model类，构建一个Model类的子类，

需要实现两个方法，即：

```python
__init__()
call(）
```

通过对 `tf.keras.Model` 进行子类化并定义自己的前向传播来构建完全可自定义的模型。

在 __init__ 方法中创建层并将它们设置为类实例的属性
在 call 方法中定义前向传播
下面给出典型的ResNet网络代码:
```python
import os
import tensorflow as tf
import numpy as np
from tensorflow import keras

def conv3x3(channels, stride=1, kernel=(3, 3)):
    return keras.layers.Conv2D(channels, kernel, strides=stride, padding='same',
                               use_bias=False,
                               kernel_initializer=tf.random_normal_initializer())

class ResnetBlock(keras.Model):

    def __init__(self, channels, strides=1, residual_path=False):
        super().__init__()

        self.channels = channels
        self.strides = strides
        self.residual_path = residual_path

        self.conv1 = conv3x3(channels, strides)
        self.bn1 = keras.layers.BatchNormalization()
        self.conv2 = conv3x3(channels)
        self.bn2 = keras.layers.BatchNormalization()

        if residual_path:
            self.down_conv = conv3x3(channels, strides, kernel=(1, 1))
            self.down_bn = tf.keras.layers.BatchNormalization()

    def call(self, inputs, training=None):
        residual = inputs

        x = self.bn1(inputs, training=training)
        x = tf.nn.relu(x)
        x = self.conv1(x)
        x = self.bn2(x, training=training)
        x = tf.nn.relu(x)
        x = self.conv2(x)

        if self.residual_path:
            residual = self.down_bn(inputs, training=training)
            residual = tf.nn.relu(residual)
            residual = self.down_conv(residual)

        x = x + residual
        return x

class ResNet(keras.Model):

    def __init__(self, block_list, num_classes, initial_filters=16, **kwargs):
        super().__init__(**kwargs)

        self.num_blocks = len(block_list)
        self.block_list = block_list

        self.in_channels = initial_filters
        self.out_channels = initial_filters
        self.conv_initial = conv3x3(self.out_channels)

        self.blocks = keras.models.Sequential(name='dynamic-blocks')

        for block_id in range(len(block_list)):
            for layer_id in range(block_list[block_id]):

                if block_id != 0 and layer_id == 0:
                    block = ResnetBlock(self.out_channels,
                                        strides=2, residual_path=True)
                else:
                    if self.in_channels != self.out_channels:
                        residual_path = True
                    else:
                        residual_path = False
                    block = ResnetBlock(self.out_channels,
                                        residual_path=residual_path)

                self.in_channels = self.out_channels

                self.blocks.add(block)

            self.out_channels *= 2

        self.final_bn = keras.layers.BatchNormalization()
        self.avg_pool = keras.layers.GlobalAveragePooling2D()
        self.fc = keras.layers.Dense(num_classes)

    def call(self, inputs, training=None):
        out = self.conv_initial(inputs)
        out = self.blocks(out, training=training)
        out = self.final_bn(out, training=training)
        out = tf.nn.relu(out)
        out = self.avg_pool(out)
        out = self.fc(out)
        return out

if __name__ == "__main__":
    model = ResNet([2, 2, 2], 10)
    model.build(input_shape=(None, 28, 28, 1))
    model.summary()
```

总结：一般情况下，简单的应用可以直接使用函数式API编程，对于复杂的网络的定义和训练可以使用类继承的方式，这样的代码逻辑和封装性较好





### 1.3.1. 持久化

子类化模型**不能**以`.h5 格式`保存模型，只能以tensorflow 格式保存

```python
model.save("...",save_model="tf")
```

Saving the model to HDF5 format requires the model to be a Functional model or a Sequential model. It does not work for subclassed models, because such models are defined via the body of a Python method, which isn't safely serializable.

#  2. 编译模型


```python 
def compile(optimizer,
            loss=None,
            metrics=None,
            loss_weights=None,
            sample_weight_mode=None,
             weighted_metrics=None,
             target_tensors=None,
              **kwargs):

```


# 3. 训练模型 

通过 Dataset 对象进行训练时，不支持参数 validation_split（从训练数据生成预留集），因为此功能需要为数据集样本编制索引的能力，而 Dataset API 通常无法做到这一点。
```
model.fit( X_train, Y_train,
            batch_size=batch_size, nb_epoch=nb_epoch,
            verbose=1,
            validation_data=(X_test, Y_test),
            callbacks=[history,model_checkpoint,TensorBoard(log_dir=r"./mytensotboard",
                        histogram_freq=1,update_freq="ba

```

## 3.1. 使用tensorboard




