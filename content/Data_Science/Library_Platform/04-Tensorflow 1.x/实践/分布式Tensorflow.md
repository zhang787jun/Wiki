---
title: "TensorFlow 1.X--分布式训练"
date: 2019-06-12 00:00
render: True 
tag: Tensorflow,框架,AI,
---


TensorFlow 1.X 版本的分布式
最原始的分布式TensorFlow

Parameter Server的配置数量也非常复杂，不同的网络环境，模型大小都会对效率有影响**，所以现在官方好像也不怎么推荐这种做法了**。最原始的分布式TensorFlow编程是基于Low-level API来实现，下面我们通过举例来理解最原始的分布式TensorFlow编程步骤。我们在一台机器上启动三个Server(2个worker，1个ps)来模拟分布式多机环境，开启三个Python解释器(分别对应2个worker和1个ps)，执行如下python语句，定义一个Cluster：

import tensorflow as tf
 
cluster = tf.train.ClusterSpec({
  "worker": [
      "localhost:2222",
      "localhost:2223"
  ],
  "ps": [
      "localhost:2224"
  ]})
在第一个worker解释器内执行如下语句启动Server：
server = tf.train.Server(cluster, job_name="worker", task_index=0)
在第二个worker解释器内执行如下语句启动Server：

server = tf.train.Server(cluster, job_name="worker", task_index=1)
在ps解释器内执行如下语句启动Server:
server = tf.train.Server(cluster, job_name="ps", task_index=0)
至此，我们已经启动了一个TensorFlow Cluster，它由两个worker节点和一个ps节点组成，每个节点上都有Master Service和Worker Service，其中worker节点上的Worker Service将负责梯度运算，ps节点上的Worker Service将负责参数更新，三个Master Service将仅有一个会在需要时被用到，负责子图划分与Task派发。



上图所示，假设存在两个任务：

/job:ps/task:0: 负责模型参数的存储和更新
/job:worker/task:0: 负责模型的训练或推理
有了Cluster，我们就可以编写Client，构建计算图，并提交到这个Cluster上执行。使用分布式TensorFlow时，最常采用的分布式训练策略是数据并行，数据并行就是在很多设备上放置相同的模型，在TensorFlow中称之为Replicated training，主要表现为两种模式：图内复制(in-graph replication)和图间复制(between-graph replication)。不同的运行模式，Client的表现形式不一样。

Client
可以把它看成是TensorFlow前端，它支持多语言的编程环境(Python/C++/Go/Java等)，方便用户构造各种复杂的计算图。Client通过Session连接TensorFlow后端，并启动计算图的执行。Client基于TensorFlow的编程接口，构造计算图。此时，TensorFlow并未执行任何计算。直至建立Session会话，并以Session为桥梁，建立Client与后端运行时的通道，将Protobuf格式的GraphDef发送至Distributed Master。也就是说，当Client对OP结果进行求值时，将触发Distributed Master的计算图的执行过程

Master
Master根据要计算的操作(Op)，从计算图中反向遍历，找到其所依赖的最小子图，然后将该子图再次分裂为多个子图片段，以便在不同的进程和设备上运行这些子图片段，最后将这些子图片段派发给Worker执行。

Worker
Worker按照计算子图中节点之间的依赖关系，根据当前的可用的硬件环境(GPU/CPU/TPU)，调用Op的Kernel实现完成运算。对于每个任务，都将存在相应的Worker Service，它主要负责如下3个方面的职责：1 处理来自Master的请求；2 调度OP的Kernel实现，执行本地子图；3 协同任务之间的数据通信。

在分布式TensorFlow中，参与分布式系统的所有节点或者设备统称为一个Cluster，一个Cluster中包含很多Server，每个Server去执行一项Task，Server和Task是一一对应的。

所以，Cluster可以看成是Server的集合，也可以看成是Task的集合，TensorFlow为各个Task又增加了一个抽象层，将一系列相似的Task集合称为一个Job。

一组Task集合(即Job)有若干个Server(host和port标识)，每个Server上会绑定两个Service，就是前面提到的Master Service和Worker Service，Client通过Session连接集群中的任意一个Server的Master Service提交计算图，Master Service负责划分子图并派发Task给Worker Service，Worker Service则负责运算派发过来的Task完成子图的运算。

为什么要分成Cluster Job和Task

首先,我们介绍一下Task:Task就是主机上的一个进程,在大多数情况下,一个机器上只运行一个Task.

为什么Job是Task的集合呢? 在分布式深度学习框架中,我们一般把Job划分为Parameter和Worker,Parameter Job是管理参数的存储和更新工作.Worker Job是来运行ops.如果参数的数量太大,一台机器处理不了,这就要需要多个Tasks.

Cluster 是 Jobs 的集合: Cluster(集群),就是我们用的集群系统了

参数服务器

当计算模型越来越大，模型的参数越来越多，多到模型参数的更新，一台机器的性能都不够时，我们需要将参数分开到不同的机器去存储和更新。参数服务器可以是多台机器组成的集群，类似于分布式的存储结构。主要用来解决参数存储和更新的性能问题。

对于PS架构，Parameter Server的Task集合为ps(即job类型为ps)，而执行梯度计算的Task集合为worker(即job类型为worker)，Low-level 分布式编程模型

 

High-level 分布式编程模型

TensorFlow提供Estimator和Dataset高阶API，简化模型构建以及数据输入，用户通过Estimator和Dataset高阶API编写TensorFlow应用，不用了解TensorFlow内部实现细节，只需关注模型本身即可。

Estimator代表一个完整的模型，它提供方法用于模型的训练、评估、预测及导出

 

Estimator具备如下优势：

基于Estimator编写的代码，可运行在单机和分布式环境中，不用区别对待
简化了模型开发者之间共享部署，它提供了标准的模型导出功能，可以将训练好的模型直接用于TensorFlow-Serving等在线服务
提供全套的分布式训练生命周期管理，自动初始化变量、处理异常、创建检查点文件并从故障中恢复、以及保存TensorBoard 的摘要等
提供了一系列开箱即用的常见Estimator，例如DNNClassifier，LinearClassifier等
使用Estimator编写应用时，需将数据输入从模型中分离出来。数据输入可以通过 Dataset API 构建数据 pipeline，类似Spark RDD或DataFrame，可以轻松处理大规模数据、不同的数据格式以及复杂的转换等。具体关于Estimator的使用可以参考TensorFlow官方文档，讲的特别详细。

使用Estimator编写完应用后，可以直接单机上运行，如果需要将其部署到分布式环境运行，则需要在每个节点执行代码前设置集群的TF_CONFIG环境变量(实际应用时通常借助资源调度平台自动完成，如K8S，不需要修改TensorFlow应用程序代码)：

TF_CONFIG='{
    "cluster": {
        "chief": ["host0:2222"],
        "worker": ["host1:2222", "host2:2222", "host3:2222"],
        "ps": ["host4:2222", "host5:2222"]
    },
    "task": {"type": "chief", "index": 0}
}'
TF_CONFIG环境变量是一个json字符串，指定集群规格cluster以及节点自身的角色task，cluster包括chief、worker、ps节点，chief节点其实是一个特殊的worker节点，而且只能有一个节点，表示分布式TensorFlow Master Service所在的节点。

通过以上描述可以看到，使用高阶API编写分布式TensorFlow应用已经很方便了，然而因为PS架构的缘故，我们实际部署时，需要规划使用多少个ps，多少个worker，那么调试过程中，需要反复调整ps和worker的数量。当模型规模较大时，在分布式训练过程中，ps可能成为网络瓶颈，因为所有worker都需要从ps处更新/获取参数，如果ps节点网络被打满，那么worker节点可能就会堵塞等待，以至于其计算能力就发挥不出来。所以后面TensorFlow引入All-Reduce架构解决这类问题。

 
————————————————
版权声明：本文为CSDN博主「积极向上的墨鱼仔」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/zwqjoy/article/details/89552866