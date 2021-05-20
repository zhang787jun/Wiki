---
title: "Tensorflow2.x--分布式Tensorflow"
date: 2019-06-12 00:00
render: True 
tag: Tensorflow,框架,AI,
---

[TOC]

# 1. 使用 tf.distribute.Strategy
## 1.1. 概要Overview

`tf.distribute.Strategy` 是TensorFlow的一个用于进行 多GPU/多设备/多TPU 分布式训练的API。

使用这个API，可以以最小的改动实现分布式训练。


`tf.distribute.Strategy` 设计的3个原则:

* 易用 Easy to use and support multiple user segments, including researchers, ML engineers, etc.
* 高效Provide good performance out of the box.
* 策略切换容易 Easy switching between strategies.

`tf.distribute.Strategy` 配合Keras使用效果更好。


`tf.distribute.Strategy` 支持[`tf.function`](../tutorials/eager/tf_function.ipynb).模式进行编程开放，同时适用于模型训练和推理。


可以以很少的改动使用 `tf.distribute.Strategy`
## 1.2. 分布式策略

`tf.distribute.Strategy` 试图覆盖大部分的分布式训练的案例，这些案例的维度包括：

1. 覆盖异步/同步训练（*Synchronous vs asynchronous training*）
2. 覆盖大部分硬件平台

异步/同步训练 是基于数据并行策略训练的方式

* In sync training, all workers train over different slices of input data in sync, and aggregating gradients at each step. 
* In async training, all workers are independently training over the input data and updating variables asynchronously. Typically sync training is supported via all-reduce and async through parameter server architecture.

### 1.2.1. 主要支持策略
1. MirroredStrategy
2. TPUStrategy
3. MultiWorkerMirroredStrategy
4. CentralStorageStrategy	
5. ParameterServerStrategy
6. OneDeviceStrategy


| Training API          	| MirroredStrategy  	| TPUStrategy         	| MultiWorkerMirroredStrategy     	| CentralStorageStrategy          	| ParameterServerStrategy  	| OneDeviceStrategy |
|:-----------------------	|:-------------------	|:---------------------	|:---------------------------------	|:---------------------------------	|:--------------------------	| :-------------------------------------- |
| **Keras API**             	| Supported         	| Experimental support 	| Experimental support 	| Experimental support 	| Supported planned post 2.0 	| Supported |
| **Custom training loop**  	| Experimental support 	| Experimental support   	| Support planned post 2.0             	| Support planned post 2.0            	| No support yet          	| Supported |
| **Estimator API**         	| Limited Support         	| Not supported           	| Limited Support                       	| Limited Support                       	| Limited Support                	| Limited Support |



### 1.2.2. MirroredStrategy--单机多卡
![](https://pic4.zhimg.com/80/v2-7b05382a7a62e3664ebc83f1272ea9e3_720w.jpg)


![](https://theaisummer.com/static/72f7634fe4cc7d260ba081bdb345e7bb/0012b/multi-gpu-system.png)


**特点**
in-graph replication with synchronous

MirroredStrategy是一种支持**多张GPU**在**同一个机器**上的同步训练方法。在训练开始时，Mirrored会在每张卡上复制一份模型，

每个显卡会收到tf.data.Dataset传来的数据，独立计算梯度，然后采用all-reduce的方法进行同步更新。多个显卡在通信时默认使用Nvidia NCCL进行。

我们可以深入MirroredStrategy的实现了解一下。基本上所有的distributed strategy都是通过某些collective ops和cross device ops进行数据通讯。MirroredStrategy也是如此，它是这样选择cross device ops的：

```python

strategy = tf.distribute.MirroredStrategy()

with strategy.scope():
   model.fit ()
   ....

```


### 1.2.3. MultiWorkerMirroredStrategy--多机多卡 all-reduce

![](https://pic4.zhimg.com/80/v2-7b05382a7a62e3664ebc83f1272ea9e3_720w.jpg)

![](https://picture.iczhiku.com/weixin/weixin16080120396692.png)

`tf.distribute.experimental.MultiWorkerMirroredStrategy`与MirroredStrategy非常类似，都在每一个device上存储一份模型的备份，进行同步的分布式训练。

该策略采用CollectiveOps作为多个worker之间通讯的操作。所谓的collective op是Tensorflow自己实现的根据当前硬件环境，网络结构，和Tensor大小自动采用最佳算法进行all-reduce的计算操作。一个collective op的实现逻辑十分简单

```python
if (CanProceedWithCompute(c, col_exec, done)) {
col_exec->ExecuteAsync(
   c, col_params_, GetCollectiveKey(c), actual_done);
}
```

c是当前op的计算状态，col_exec是Tensorflow根据系统情况选择的collective executor，所有的all reduce，boardcast和receive操作都有collective executor去执行。

该策略目前也实现了很多优化，比如将很多个小tensor的all reduce操作变成几个大tensor的all reduce操作，以及在开发当中的采用最新NCCL 2.0进行通讯的操作，具体可以参见Issue 24505。可以看出Tensorflow分布式训练在被吐槽很多次后，感受到了来自Pytorch，Horovod的压力，在努力的提升自己。

最后，关于MultiWorkerMirroredStrategy的配置，有两点需要注意。

一点是collective ops的策略选择，目前支持CollectiveCommunication.RING，采用与Horovod类似的ring-based通讯策略。另一个是CollectiveCommunication.NCCL，采用Nvidia NCCL进行通讯，在启动策略时可以传入参数指定：

```python
multiworker_strategy = tf.distribute.experimental.MultiWorkerMirroredStrategy(tf.distribute.experimental.CollectiveCommunication.NCCL)
```

CollectiveCommunication.AUTO defers the choice to the runtime.

另一个需要注意的是关于TF_CONFIG的设置，该策略并不需要指定Parameter server，只需要一系列worker即可，其配置如下：

```python
   TF_CONFIG = {
   'cluster': {
      'worker': ['worker1:port1', 'worker2:port2', 'worker3:port3', ...]
   },
   'task': {'type': 'worker', 'index': 0}
   })

```
目前该API尚处于实验阶段。如果在代码中通过MultiWorkerMirroredStrategy指定使用All-Reduce架构，则分布式提交时，TF_CONFIG环境变量中的cluster就不需要ps类型的节点了，例如：

```python
TF_CONFIG='{
   "cluster": {
      "worker": ["host1:2222", "host2:2222", "host3:2222"]
   },
   "task": {"type": "work", "index": 0}
}'



strategy = tf.distribute.experimental.MultiWorkerMirroredStrategy()
config = tf.estimator.RunConfig(
   train_distribute=strategy, eval_distribute=strategy)
regressor = tf.estimator.LinearRegressor(
   feature_columns=[tf.feature_column.numeric_column('feats')],
   optimizer='SGD',
   config=config)
```

 

tf.keras例子
```python

import tensorflow as tf
import tensorflow_datasets as tfds
import os
import json

num_epochs = 5
batch_size_per_replica = 64
learning_rate = 0.001

num_workers = 2
os.environ['TF_CONFIG'] = json.dumps({
   'cluster': {
      'worker': ["localhost:20000", "localhost:20001"]
   },
   'task': {'type': 'worker', 'index': 0}
})
strategy = tf.distribute.experimental.MultiWorkerMirroredStrategy()
batch_size = batch_size_per_replica * num_workers

def resize(image, label):
   image = tf.image.resize(image, [224, 224]) / 255.0
   return image, label

dataset = tfds.load("cats_vs_dogs", split=tfds.Split.TRAIN, as_supervised=True)
dataset = dataset.map(resize).shuffle(1024).batch(batch_size)

with strategy.scope():
   model = tf.keras.applications.MobileNetV2()
   model.compile(
      optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
      loss=tf.keras.losses.sparse_categorical_crossentropy,
      metrics=[tf.keras.metrics.sparse_categorical_accuracy]
   )

model.fit(dataset, epochs=num_epochs)
```


### 1.2.4. CentralStorageStrategy
`tf.distribute.experimental.CentralStorageStrategy`  
也执行同步训练，但是变量不会被镜像，而是放在CPU上。各操作(operation)在本地GPU之间复制进行。如果只有一个GPU，变量和操作都会放在GPU上。




![](https://tse2-mm.cn.bing.net/th/id/OIP.ymuwRWOecXOsUP1g25ewgAHaFF?pid=ImgDet&rs=1)

![](https://pic4.zhimg.com/80/v2-ed1e40774fe67adb535321df99dc991f_1440w.jpg)
单机多卡是指单台服务器有多块GPU设备。假设一台机器上有4块GPU，单机多GPU的训练过程如下：

1. 在单机单GPU的训练中，数据是一个batch一个batch的训练。 在单机多GPU中，数据一次处理4个batch(假设是4个GPU训练）， 每个GPU处理一个batch的数据计算。
2. 变量，或者说参数，保存在CPU上。数据由CPU分发给4个GPU，在GPU上完成计算，得到每个批次要更新的梯度
3. 在CPU上收集完4个GPU上要更新的梯度，计算一下平均梯度，然后更新。
循环进行上面步骤

>**注意**: 该策略是 **实验性的** ，因为我们正在对它进行改进，使他能在更多场景下工作. 敬请期待此API的变化

synchronous 同步训练.
变量不进行复制和分发，


```python
# Create a CentralStorageStrategy by:

central_storage_strategy = tf.distribute.experimental.CentralStorageStrategy()
```

这会创建一个 CentralStorageStrategy 实例使用所有可见的CPU和GPU。在更新应用到变量之前，不同副本上变量的更新将会汇总。

#### 1.2.4.1. 注意--与MirroredStrategy的区别



If you use 4 GPUs, MirroredStrategy `will create 4 variables instead of "my_var" variable, one on each GPU`. However each variable will have the same value, because they are always updated in the same way. So the variable updates happen in sync on all the GPUs.

In case of the CentralStorageStrategy, only one variable is created for "my_var", in the host (CPU) memory. The updates only happen in one place.
#### 1.2.4.2. 选择 MirroredStrategy/ CentralStorageStrategy?



依据：
1. 节点的物理拓扑结构
2. CPU-GPU 通信速度与GPU-GPU 通信速度比较
   1. 若 GPU-GPU 比 CPU-GPU 快 MirroredStrategy好
   2. 一般情况下CPU和GPU通信代价大，不建议使用CentralStorageStrategy

Which one is better probably depends on the computer's topology and how fast CPU-GPU communication is compared with GPU-GPU. 
If the GPUs can communicate fast with each other, MirroredStrategy may be more efficient. But I'd benchmark it to be sure.

### 1.2.5. ParameterServerStrategy

**Note**：ParameterServerStrategy是Tensorflow最初的分布式训练方法。


![](https://pic4.zhimg.com/80/v2-1416837956874bb92c719aca09634a17_720w.jpg)

ParameterServerStrategy 由若干个parameter servers和若干个worker servers构成，parameter servers用于存储参数，worker servers用于计算。


```python
ps_strategy = tf.distribute.experimental.ParameterServerStrategy()
```
ParameterServerStrategy 在训练过程中worker servers会和不同的parameter servers沟通获得参数，然后计算，向parameter servers传递参数的梯度。配置一个这样的训练环境非常简单，只需要在程序运行时设置好环境变量TF_CONFIG，需要注意的是需要给分布式集群里每一个机子不同的task。

```python
os.environ["TF_CONFIG"] = json.dumps({
  "cluster": {
    "worker": ["host1:port", "host2:port", "host3:port"],
    "ps": ["host4:port", "host5:port"]
  },
  "task": {"type": "worker", "index": 1}
})
```

同时，ParameterServerStrategy还有比较神奇的功能，它可以通过传入num_gpus_per_worker在一个worker上进行多GPU的同步计算，然后不同worker之间进行异步计算。但是由于单一worker上多GPU并没有利用NCCL进行通讯，而是直接将结果发送到CPU，所以效率非常低下。

 
```python

strategy = tf.distribute.experimental.ParameterServerStrategy()
run_config = tf.estimator.RunConfig(
    experimental_distribute.train_distribute=strategy)
estimator = tf.estimator.Estimator(config=run_config)
tf.estimator.train_and_evaluate(estimator,...)
 
```


## 使用


```python
strategy = tf.distribute.MirroredStrategy()

with strategy.scope():
   # 1. build model
   model=get_model()

   # 2. compile modle

   model.compile(...)

   # 3. fit model 
   model.fit ()
   ....



```

# 2. 参考资料

1. [机器之心：TensorFlow 2.4来了：上线对分布式训练和混合精度的新功能支持
](https://picture.iczhiku.com/weixin/message1608012039669.html)