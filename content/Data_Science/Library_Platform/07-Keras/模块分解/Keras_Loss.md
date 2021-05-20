---
title: "Keras Loss--常见损失函数"
layout: page
date: 2099-06-02 00:00
---

[TOC]




```python
# 自定义loss func

def  my_loss(y_true, y_pred):
    # y_true: True labels. TensorFlow/Theano tensor
    # y_pred: Predictions. TensorFlow/Theano tensor of the same shape as y_true
    .
    .
    .
    return scalar  #返回一个标量值
然后在model.compile中指定即可，如：

model.compile(loss=my_loss, optimizer='sgd')
```


```python
def ctc_loss(labels, predicts, input_lengths, label_lengths):
    loss = tf.keras.backend.ctc_batch_cost(
        labels,
        predicts,
        input_lengths,
        label_lengths)
    loss = tf.keras.backend.mean(loss)
    return loss
```