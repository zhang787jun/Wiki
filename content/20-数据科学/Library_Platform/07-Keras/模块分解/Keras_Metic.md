---
title: "Keras Metrics--常见度量"
layout: page
date: 2099-06-02 00:00
---

[TOC]




keras 自定义 metrics

简介：自定义 Metrics 在 keras 中操作的均为 Tensor 对象，因此，需要定义操作 Tensor 的函数来操作所有输出结果，定义好函数之后，直接将其放在 model.

# 自定义 Metrics
在 keras 中操作的均为 Tensor 对象，因此，需要定义操作 Tensor 的函数来操作所有输出结果，定义好函数之后，直接将其放在 model.compile 函数 metrics 中即可生效：
```python
def precision(y_true, y_pred):
    # Calculates the precision
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    predicted_positives = K.sum(K.round(K.clip(y_pred, 0, 1)))
    precision = true_positives / (predicted_positives + K.epsilon())
    return precision


def recall(y_true, y_pred):
    # Calculates the recall
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    possible_positives = K.sum(K.round(K.clip(y_true, 0, 1)))
    recall = true_positives / (possible_positives + K.epsilon())
    return recall

def fbeta_score(y_true, y_pred, beta=1):
    # Calculates the F score, the weighted harmonic mean of precision and recall.

    if beta < 0:
        raise ValueError('The lowest choosable beta is zero (only precision).')
        
    # If there are no true positives, fix the F score at 0 like sklearn.
    if K.sum(K.round(K.clip(y_true, 0, 1))) == 0:
        return 0

    p = precision(y_true, y_pred)
    r = recall(y_true, y_pred)
    bb = beta ** 2
    fbeta_score = (1 + bb) * (p * r) / (bb * p + r + K.epsilon())
    return fbeta_score

def fmeasure(y_true, y_pred):
    # Calculates the f-measure, the harmonic mean of precision and recall.
    return fbeta_score(y_true, y_pred, beta=1)
```
使用方法如下：
```python
model.compile(
    optimizer=Adam(), 
    loss='binary_crossentropy',
    metrics = ['accuracy',  fmeasure, recall, precision]
    )
```
# 参考
custom metrics for binary classification in Keras