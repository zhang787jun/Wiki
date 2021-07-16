---
title: "02-Netron 模型结构可视化神器"
layout: page
date: 2099-06-02 00:00
---
[TOC]

复现人家工程的时候，需要了解人家的网络结构。但不同框架之间可视化网络层方法不一样，这样给研究人员造成了很大的困扰。 `Netron` 是一个解决这个问题的神奇。

# 1. 什么是Netron

`Netron` is a viewer for neural network, deep learning and machine learning models.
Netron 是一个可以查看神经网络模型、深度学习模型、机器学习模型结构的可视化工具。

优点:
1. 支持多平台
缺点：
1. 只能看网络结构

官方介绍:
https://github.com/lutzroeder/Netron 


# 2. 使用

Netron支持windows，Linux，mac系统。在windows系统，下载一个`.exe`的可执行文件，安装以后，就是只需双击打开，添加模型文件的位置就可以了。 
 

# 3. 支持格式
Netron 支持的框架和对应文件如下：
| 框架            | 对应文件    |
| --------------- | ----------- |
| ONNX            | .onnx, .pb  |
| Keras           | .h5, .keras |
| CoreML          | .mlmodel    |
| TensorFlow Lite | .tflite     |
试验性支持，可能不同稳定：
| 框架          | 对应文件             |
| ------------- | -------------------- |
| Caffe         | .caffemodel          |
| Caffe2        | predict_net.pb       |
| MXNet         | .model, -symbol.json |
| TensorFlow.js | model.json, .pb      |
| TensorFlow    | .pb, .meta           |

只需按照上述表格将对应的文件路径加到netron中，就可以看到漂亮的网络结构图了。