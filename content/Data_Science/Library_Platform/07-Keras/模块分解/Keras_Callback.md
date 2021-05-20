---
title: "Keras Layer--常见网络层"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 参考资料
https://keras.io/zh/callbacks/#modelcheckpoint

#  ModelCheckpoint
```python
keras.callbacks.ModelCheckpoint(filepath, monitor='val_loss', verbose=0, save_best_only=False, save_weights_only=False, mode='auto', period=1)
```
在每个训练期之后保存模型。

filepath 可以包括命名格式选项，可以由 epoch 的值和 logs 的键（由 on_epoch_end 参数传递）来填充。

例如：如果 filepath 是 weights.{epoch:02d}-{val_loss:.2f}.hdf5， 那么模型被保存的的文件名就会有训练轮数和验证损失。

参数说明

- `filepath`: str，保存模型的路径。
- `monitor`: 被监测的数据。
- `verbose`: 详细信息模式，0 或者 1 。
- `save_best_only`: 如果 `save_best_only=True`， 被监测数据的最佳模型就不会被覆盖。
- `mode`: {auto, min, max} 的其中之一。 如果 save_best_only=True，那么是否覆盖保存文件的决定就取决于被监测数据的最大或者最小值。 对于 val_acc，模式就会是 max，而对于 val_loss，模式就需要是 min，等等。 在 auto 模式中，方向会自动从被监测的数据的名字中判断出来。
- `save_weights_only`: 如果 True，那么只有模型的权重会被保存 (model.save_weights(filepath))， 否则的话，整个模型会被保存 (model.save(filepath))。
- `period`: 每个检查点之间的间隔（训练轮数）



# TensorBoard
```python
keras.callbacks.TensorBoard(
    log_dir='./logs', histogram_freq=0, batch_size=32, write_graph=True, write_grads=False, write_images=False, embeddings_freq=0, embeddings_layer_names=None, embeddings_metadata=None, embeddings_data=None, update_freq='epoch'
    )
```

TensorBoard 是由 Tensorflow 提供的一个可视化工具。

这个回调函数为 Tensorboard 编写一个日志， 这样你可以可视化测试和训练的标准评估的动态图像， 也可以可视化模型中不同层的激活值直方图。

如果你已经使用 pip 安装了 Tensorflow，你应该可以从命令行启动 Tensorflow：
```shell
tensorboard --logdir=/full_path_to_your_logs
```
参数

- `log_dir`: 用来保存被 TensorBoard 分析的日志文件的文件名。
- `histogram_freq`: 对于模型中各个层计算激活值和模型权重直方图的频率（训练轮数中）。 如果设置成 0 ，直方图不会被计算。对于直方图可视化的验证数据（或分离数据）一定要明确的指出。
- `write_graph`: 是否在 TensorBoard 中可视化图像。 如果 write_graph 被设置为 True，日志文件会变得非常大。
- `write_grads`: 是否在 TensorBoard 中可视化梯度值直方图。 histogram_freq 必须要大于 0 。
- `batch_size`: 用以直方图计算的传入神经元网络输入批的大小。
- `write_images`: 是否在 TensorBoard 中将模型权重以图片可视化。
- `embeddings_freq`: 被选中的嵌入层会被保存的频率（在训练轮中）。
- `embeddings_layer_names`: 一个列表，会被监测层的名字。 如果是 None 或空列表，那么所有的嵌入层都会被监测。
- `embeddings_metadata`: 一个字典，对应层的名字到保存有这个嵌入层元数据文件的名字。 查看 详情 关于元数据的数据格式。 以防同样的元数据被用于所用的嵌入层，字符串可以被传入。
- `embeddings_data`: 要嵌入在 embeddings_layer_names 指定的层的数据。 Numpy 数组（如果模型有单个输入）或 Numpy 数组列表（如果模型有多个输入）。 Learn ore about embeddings。
- `update_freq`: 'batch' 或 'epoch' 或 整数。当使用 'batch' 时，在每个 batch 之后将损失和评估值写入到 TensorBoard 中。同样的情况应用到 'epoch' 中。如果使用整数，例如 10000，这个回调会在每 10000 个样本之后将损失和评估值写入到 TensorBoard 中。注意，频繁地写入到 TensorBoard 会减缓你的训练。
