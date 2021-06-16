---
title: "Tensorflow2.x--分布式Tensorflow"
date: 2019-06-12 00:00
render: True 
tag: Tensorflow,框架,AI,
---

[TOC]

# 1. 使用 tf.distribute.Strategy
## 1.1. 概要

`tf.distribute.Strategy` 是TensorFlow的一个用于进行 多GPU/多设备/多TPU 分布式训练的API。

使用这个API，可以以最小的改动实现分布式训练。


`tf.distribute.Strategy` 设计的3个原则:
1. 上手简单，可供包括研究员和机器学习工程师在内的多部门使用。
2. 提供开箱即用的高性能计算。
3. 在不同策略之间切换简单。


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


# 2. 实践

## 2.1. 基本模式


```python
strategy = tf.distribute.MirroredStrategy()

with strategy.scope():
   # 1. build model
   model=get_model()

   # 2. compile modle

   model.compile(...)

   # 3. fit model 
   model.fit ()
   ...
```

## 2.2. 单机策略


### 2.2.1. OneDeviceStrategy--单机单卡
```python
strategy = tf.distribute.OneDeviceStrategy(device="/gpu:0")
```

### 2.2.2. MirroredStrategy--单机多卡
![](https://pic4.zhimg.com/80/v2-7b05382a7a62e3664ebc83f1272ea9e3_720w.jpg)

![](https://theaisummer.com/static/72f7634fe4cc7d260ba081bdb345e7bb/0012b/multi-gpu-system.png)

镜像策略用了高效的All-reduce算法来实现设备之间变量的传递更新。默认情况下，它使用NVIDIA NCCL作为all-reduce实现。用户还可以在官方提供的其他几个选项之间进行选择。


**特点**
in-graph replication with synchronous

MirroredStrategy是一种支持**多张GPU**在**同一个机器**上的同步训练方法。在训练开始时，Mirrored会在每张卡上复制一份模型，

每个显卡会收到`tf.data.Dataset`传来的数据，独立计算梯度，然后采用all-reduce的方法进行同步更新。多个显卡在通信时默认使用Nvidia NCCL进行。

我们可以深入MirroredStrategy的实现了解一下。基本上所有的distributed strategy都是通过某些collective ops和cross device ops进行数据通讯。MirroredStrategy也是如此，它是这样选择cross device ops的：

```python

strategy = tf.distribute.MirroredStrategy(devices=None, cross_device_ops=None)

# strategy = tf.distribute.MirroredStrategy(devices=["/gpu:0", "/gpu:1"])

with strategy.scope():
   # 1. build model
   model=get_model()

   # 2. compile modle
   model.compile(...)

   # 3. fit model 
   model.fit ()
```

官方也提供了一些all-reduce实现(tf.distribute.CrossDeviceOps)：
```python


tf.distribute.HierarchicalCopyAllReduce
tf.distribute.ReductionToOneDevice
tf.distribute.NcclAllReduce (default)
```

#### 2.2.2.1. NCCL

`MirroredStrategy` 类默认使用 NVIDIA Collective Communications 库（NCCL,用于GPU之间通讯的）做 AllReduce 平均值运算, 但依赖 GPU 的数量和类型

参考资料:https://github.com/veaba/tensorflow-docs/blob/39c8233ef6f46521d44edeaa08002da0be9b6df8/docs/tf.distribute/NcclAllReduce.md
#### 2.2.2.2. HierarchicalCopyAllReduce

This is a reduction created for Nvidia DGX-1 which assumes GPUs connects likethat on DGX-1 machine. 

If you have different GPU inter-connections, it islikely that it would be slower than `tf.distribute.ReductionToOneDevice .`

如果不是 Nvidia DGX-1 ,可能比`tf.distribute.ReductionToOneDevice .`慢

参考资料:
1. http://nvidia.zhidx.com/content-9-1608-1.html

![](https://pic2.zhimg.com/80/v2-249e0641218cab2091df8d74d0502972_720w.jpg?source=1940ef5c)

#### 2.2.2.3. ReductionToOneDevice

总是先还原到一个设备，然后再进行广播。
```python

strategy = tf.distribute.MirroredStrategy(devices=None, cross_device_ops=tf.distribute.ReductionToOneDevice)


```


参考资料:https://github.com/veaba/tensorflow-docs/blob/39c8233ef6f46521d44edeaa08002da0be9b6df8/docs/tf.distribute/ReductionToOneDevice.md
### 2.2.3. CentralStorageStrategy--单机多卡
`tf.distribute.experimental.CentralStorageStrategy`  
也执行同步训练，但是变量不会被镜像，而是放在CPU上。各操作(operation)在本地GPU之间复制进行。如果只有一个GPU，变量和操作都会放在GPU上。




![](https://tse2-mm.cn.bing.net/th/id/OIP.ymuwRWOecXOsUP1g25ewgAHaFF?pid=ImgDet&rs=1)

![](https://pic4.zhimg.com/80/v2-ed1e40774fe67adb535321df99dc991f_1440w.jpg)
单机多卡是指单台服务器有多块GPU设备。假设一台机器上有4块GPU，单机多GPU的训练过程如下：

1. 在单机单GPU的训练中，数据是一个batch一个batch的训练。 在单机多GPU中，数据一次处理4个batch(假设是4个GPU训练）， 每个GPU处理一个batch的数据计算。
2. 变量，或者说参数，保存在CPU上。数据由CPU分发给4个GPU，在GPU上完成计算，得到每个批次要更新的梯度
3. 在CPU上收集完4个GPU上要更新的梯度，计算一下平均梯度，然后更新。
4. 循环进行上面步骤

>**注意**: 该策略是 **实验性的** ，因为我们正在对它进行改进，使他能在更多场景下工作. 敬请期待此API的变化

synchronous 同步训练.
变量不进行复制和分发，


```python
# Create a CentralStorageStrategy by:

central_storage_strategy = tf.distribute.experimental.CentralStorageStrategy()
```

这会创建一个 CentralStorageStrategy 实例使用所有可见的CPU和GPU。在更新应用到变量之前，不同副本上变量的更新将会汇总。

#### 2.2.3.1. 注意--与MirroredStrategy的区别



If you use 4 GPUs, MirroredStrategy `will create 4 variables instead of "my_var" variable, one on each GPU`. However each variable will have the same value, because they are always updated in the same way. So the variable updates happen in sync on all the GPUs.

In case of the CentralStorageStrategy, only one variable is created for "my_var", in the host (CPU) memory. The updates only happen in one place.
#### 2.2.3.2. 选择 MirroredStrategy/ CentralStorageStrategy?



依据：
1. 节点的物理拓扑结构
2. CPU-GPU 通信速度与GPU-GPU 通信速度比较
   1. 若 GPU-GPU 比 CPU-GPU 快 MirroredStrategy好
   2. 一般情况下CPU和GPU通信代价大，不建议使用CentralStorageStrategy

Which one is better probably depends on the computer's topology and how fast CPU-GPU communication is compared with GPU-GPU. 

If the GPUs can communicate fast with each other, MirroredStrategy may be more efficient. But I'd benchmark it to be sure.


## 2.3. 多机策略
多机训练，需要配置环境变量 `TF_CONFIG`， 需要指定集群中ps和worker的配置，可以在 TF_CONFIG 中获取更多相关信息。


```json
{
   "cluster": {
      #"chief":chief_hosts, # 可不设置
      "worker": ["host1:port", "host2:port", "host3:port"],
      "ps": ["host4:port", "host5:port"],
      "evaluator":evaluator_hosts, # 不做评估的话，可不设置
   },
   "task": {"type": "worker", "index": 0}
}
```
`TF_CONFIG` 主要由 `cluster` 集群信息 与 本机任务 `task` 组成 

此 `TF_CONFIG` 指定了集群中包含三个工作进程和两个 ps 任务，以及它们的主机和端口。"task" 部分指定当前任务在集群中的角色，即 worker 1（第二个工作进程）。集群中的有效角色是 "chief"、"worker"、"ps" 和 "evaluator"。除使用 `tf.distribute.experimental.ParameterServerStrategy` 时外，不应有 "ps" 作业

```python
os.environ["TF_CONFIG"] = json.dumps({"cluster": {"worker": ["host1:port", "host2:port", "host3:port"],         "ps": ["host4:port", "host5:port"]     },    "task": {"type": "worker", "index": 1} })
```

### 2.3.1. MultiWorkerMirroredStrategy--多机多卡 all-reduce

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


### 2.3.2. ParameterServerStrategy

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


但是 ParameterServerStrategy 不支持一机多卡

 
```python

strategy = tf.distribute.experimental.ParameterServerStrategy()
run_config = tf.estimator.RunConfig(
    experimental_distribute.train_distribute=strategy)
estimator = tf.estimator.Estimator(config=run_config)
tf.estimator.train_and_evaluate(estimator,...)
 
```


# 3. 存储与数据问题 


## 3.1. 数据源的存储策略 
原则
> be able to able to access your data sourc

不同的训练策略，都涉及到一个问题，训练数据的存储与读取。

### 在分布式文件系统上使用分布式系统接口
数据可以远程存储 （the input data may be stored remotely,Google Cloud Storage or HDFS）

### 在单机文件系统上的创建副本

数据也可以单一文件系统上,存储副本,相同名称


## 3.2. 分布式 input 

关键问题

1. batch_size 
2. 分片
3. 缓存

###  3.2.1. Batching 分批

在分布式策略下, tf.distribute 会将数据集`rebatches` 再次分批, 所有新的 

`batch size`=`global batch size`/`replicas`


`tf.distribute` **rebatches** the input `tf.data.Dataset` instance with a new batch size that is equal to the global batch size divided by the number of replicas in sync.


The number of replicas in sync is equal to the number of devices that are taking part in the gradient allreduce during training. When a user calls `next` on the distributed iterator, a per replica batch size of data is returned on each replica. The rebatched dataset cardinality will always be a multiple of the number of replicas. Here are a couple of
examples:
* `tf.data.Dataset.range(6).batch(4, drop_remainder=False)`
  * Without distribution:
    * Batch 1: [0, 1, 2, 3]
    * Batch 2: [4, 5]
  * With distribution over 2 replicas.
    The last batch ([4, 5]) is split between 2 replicas.

    * Batch 1:
      * Replica 1:[0, 1]
      * Replica 2:[2, 3]
    * Batch 2:
      * Replica 2: [4]
      * Replica 2: [5]


* `tf.data.Dataset.range(4).batch(4)`
  * Without distribution:
    * Batch 1: [[0], [1], [2], [3]]
  * With distribution over 5 replicas:
    * Batch 1:
      * Replica 1: [0]
      * Replica 2: [1]
      * Replica 3: [2]
      * Replica 4: [3]
      * Replica 5: []

* `tf.data.Dataset.range(8).batch(4)`
  * Without distribution:
    * Batch 1: [0, 1, 2, 3]
    * Batch 2: [4, 5, 6, 7]
  * With distribution over 3 replicas:
    * Batch 1:
      * Replica 1: [0, 1]
      * Replica 2: [2, 3]
      * Replica 3: []
    * Batch 2:
      * Replica 1: [4, 5]
      * Replica 2: [6, 7]
      * Replica 3: []

Note: The above examples only illustrate how a global batch is split on different replicas. It is not advisable to depend on the actual values that might end up on each replica as it can change depending on the implementation.

Rebatching the dataset has a space complexity that increases linearly with the number of replicas. This means that for the multi worker training use case the input pipeline can run into OOM errors. 



```python 
dataset = tf.data.Dataset.from_tensors(([1.],[1.])).repeat(64).batch(16)
options = tf.data.Options()
options.experimental_distribute.auto_shard_policy = tf.data.experimental.AutoShardPolicy.DATA
dataset = dataset.with_options(options)
```

###  3.2.2. shard 分片
There are three different options that you can set for the `tf.data.experimental.AutoShardPolicy`:

#### AUTO
* This is the default option which means an attempt will be made to shard by FILE. The attempt to shard by FILE fails if a file-based dataset is not detected. `tf.distribute` will then fall back to sharding by DATA. Note that if the input dataset is file-based but the number of files is less than the number of workers, an `InvalidArgumentError` will be raised. If this happens, explicitly set the policy to `AutoShardPolicy.DATA`, or split your input source into smaller files such that number of files is greater than number of workers.


#### FILE

如果输入文件的数量远远大于辅助进程的数量，并且文件中的**数据分布均匀**，则应该使用此选项

This is the option if you want to shard the input files over all the workers. You should use this option if the number of input files is much larger than the number of workers and the data in the files is evenly distributed. The downside of this option is having idle workers if the data in the files is not evenly distributed. If the number of files is less than the number of workers, an `InvalidArgumentError` will be raised. If this happens, explicitly set the policy to `AutoShardPolicy.DATA`.
>> For example

let us distribute 2 files over 2 workers with 1 replica each. 
```shell
File 1 contains [0, 1, 2, 3, 4, 5] 
File 2 contains [6, 7, 8, 9, 10, 11]
```

Let the total number of replicas in sync be 2 and global batch size be 4.

```shell
  * Worker 0:
    * Batch 1 =  Replica 1: [0, 1]
    * Batch 2 =  Replica 1: [2, 3]
    * Batch 3 =  Replica 1: [4]
    * Batch 4 =  Replica 1: [5]
  * Worker 1:
    * Batch 1 =  Replica 2: [6, 7]
    * Batch 2 =  Replica 2: [8, 9]
    * Batch 3 =  Replica 2: [10]
    * Batch 4 =  Replica 2: [11]
```

#### DATA
通常 
This will autoshard the elements across all the workers. Each of the workers will read the entire dataset and only process the shard assigned to it. 

All other shards will be discarded. 

This is generally used if the number of input files is less than the number of workers and you want better sharding of data across all workers. The downside is that the entire dataset will be read on each worker.

>> For example

let us distribute 1 files over 2 workers. 
```shell 
# 每个workers 都保存一个 File 1  副本
File 1 contains [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]. 
```

Let the total number of replicas in sync be 2.
```shell
  * Worker 0:
    * Batch 1 =  Replica 1: [0, 1]
    * Batch 2 =  Replica 1: [4, 5]
    * Batch 3 =  Replica 1: [8, 9]
  * Worker 1:
    * Batch 1 =  Replica 2: [2, 3]
    * Batch 2 =  Replica 2: [6, 7]
    * Batch 3 =  Replica 2: [10, 11]
```

#### OFF

If you turn off autosharding, each worker will process all the data.
For example, let us distribute 1 files over 2 workers. File 1 contains [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]. Let the total number of replicas in sync be 2. Then each worker will see the following distribution:

  * Worker 0:
    * Batch 1 =  Replica 1: [0, 1]
    * Batch 2 =  Replica 1: [2, 3]
    * Batch 3 =  Replica 1: [4, 5]
    * Batch 4 =  Replica 1: [6, 7]
    * Batch 5 =  Replica 1: [8, 9]
    * Batch 6 =  Replica 1: [10, 11]

  * Worker 1:
    * Batch 1 =  Replica 2: [0, 1]
    * Batch 2 =  Replica 2: [2, 3]
    * Batch 3 =  Replica 2: [4, 5]
    * Batch 4 =  Replica 2: [6, 7]
    * Batch 5 =  Replica 2: [8, 9]
    * Batch 6 =  Replica 2: [10, 11]


# 性能

前面提到的文献在建模的时候都没有考虑分布式机器学习对位置的敏感性，
事实上，现在业界的分布式机器学习集群大多采用虚拟化技术，采用了虚拟化方
案的集群的使用者通常不能得到相关的位置信息。比如某使用者申请在该集群中
分配两台虚拟机/容器，每台虚拟机/容器包含一块 GPU，该使用者通常并不能知
道这两台虚拟机是否在同一台物理服务器上或者是否在同一个 PCIe switch 下。 
VGG16 ResNet-50


标准化的训练速度
SamePCIeSw  SameSocket  DiffSocket
 
图 3-4  位置对机器学习训练速度的影响 
ResNet-50 VGG16 MobileNet

标准化的训练速度
 无干扰
 有干扰
 
图 3-5  干扰对机器学习训练速度的影响 
最后，集群中的资源和任务实际上处于动态变化中。即使分配给某个任务的
计算资源不变，实际上当集群中还有其他任务在运行的时候，它们会相互竞争
PCIe、通信网络、存储等资源，也就是其他的任务会对该任务造成干扰。不同的
机器学习任务对于其他任务的干扰的敏感程度也是不一样的。举个例子，有两台
服务器通过千兆以太网相连，每台服务器有两块 1080  Ti  GPU，在这两台服务器
上的两块 GPU 上（两块 GPU 分别分布在两台服务器上）在下面两种情况下：1）20 
 电子科技大学硕士学位论文 
22 
 
另外两块 GPU 没有在运行任何任务；2）另外两块 GPU 同时在训练 ResNet-50 模
型；在 TensorFlow 平台上分别训练 VGG16、ResNet-50、Inception-v1 模型。如图
3-5 所示，三个模型的训练速度在有干扰的情况下都会下降，并且三个模型的训
练速度下降的程度不一样，即干扰对它们造成的影响不同。因为集群中的任务处
于不断的变化中并且难以预测，所以来自其他任务的干扰也是非常难以建模的。
同样的，前面提到的文献建模的时候也没有考虑其他任务的干扰。


# 4. 参考资料

1. [机器之心：TensorFlow 2.4来了：上线对分布式训练和混合精度的新功能支持
](https://picture.iczhiku.com/weixin/message1608012039669.html)

3. [Tensorflow 官网: Distributed Input](https://www.tensorflow.org/tutorials/distribute/input)