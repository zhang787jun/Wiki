---
title: "Keras Layer--常见网络层"
layout: page
date: 2099-06-02 00:00
---

[TOC]


keras.layer

keras 里面的几个基础layer
# 1. 常用层
## 1.1. Dense
Dense就是常用的全连接层。

$$output = activation(dot(input, kernel)+bias)$$

```python
input shape=(None,n)
output shape=(None,units)
```

其中activation是逐元素计算的激活函数，kernel是本层的权值矩阵，bias为偏置向量，只有当use_bias=True才会添加。

```python
Dense(units, activation=None, use_bias=True, kernel_initializer='glorot_uniform', bias_initializer='zeros', kernel_regularizer=None, bias_regularizer=None, activity_regularizer=None, kernel_constraint=None, bias_constraint=None)
```

## 1.2. Flatten
用来将输入**压平**，即把多维的输入一维化，常用在从卷积层到全连接层的过渡。Flatten不影响batch的大小。

```shell
input_shape=(None,n,m,x,y,z)
output_shape=(None,n*m*x*y,z)
```

```shell
_________________________________________________________________
lstm_24 (LSTM)               (None, 12, 10)            3000      
_________________________________________________________________
flatten_3 (Flatten)          (None, 120)               0         
_________________________________________________________________
```

## 1.3. Embedding

Embedding层只能作为模型的第一层


```python
keras.layers.embeddings.Embedding(input_dim, output_dim, embeddings_initializer='uniform', embeddings_regularizer=None, activity_regularizer=None, embeddings_constraint=None, mask_zero=False, input_length=None)

```

# 2. 卷积层

# 3. 池化层

# 4. 局部连接层

# 5. 循环层

# 6. 嵌入层


# 7. 激活层

# 8. BN层

# 9. 噪声层

# 10. 包装器

# 11. 自定义层
将自定义的tensorflow图写入keras 

参考 [Tensorflow 官方:通过子类化创建新的层和模型](https://www.tensorflow.org/guide/keras/custom_layers_and_models#call_%E6%96%B9%E6%B3%95%E4%B8%AD%E7%9A%84%E7%89%B9%E6%9D%83_training_%E5%8F%82%E6%95%B0) 
```python
class Linear(keras.layers.Layer):
    def __init__(self, units=32, input_dim=32):
        super(Linear, self).__init__()
        w_init = tf.random_normal_initializer()
        self.w = tf.Variable(
            initial_value=w_init(shape=(input_dim, units), dtype="float32"),
            trainable=True,
        )
        b_init = tf.zeros_initializer()
        self.b = tf.Variable(
            initial_value=b_init(shape=(units,), dtype="float32"), trainable=True
        )

    def call(self, inputs):
        return tf.matmul(inputs, self.w) + self.b




class Linear(keras.layers.Layer):
    def __init__(self, units=32, input_dim=32):
        super(Linear, self).__init__()
        w_init = tf.random_normal_initializer()
        # 注意涉及权重层需要在此处声明 
        self.w = tf.Variable(
            initial_value=w_init(shape=(input_dim, units), dtype="float32"),
            trainable=True,
        )
        #
        b_init = tf.zeros_initializer()
        self.b = tf.Variable(
            initial_value=b_init(shape=(units,), dtype="float32"), trainable=True
        )

    def call(self, inputs):
        return tf.matmul(inputs, self.w) + self.b


```