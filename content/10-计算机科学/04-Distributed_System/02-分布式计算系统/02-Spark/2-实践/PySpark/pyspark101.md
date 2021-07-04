---
title: "pyspark 101"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 参考资料

https://colab.research.google.com/drive/13E5phjOMUbRfDnRyK8DLveyd3QiMUBYJ#scrollTo=-7ltugSVk1fX
# 2. 概况

## 2.1. PySpark Shell 


PySpark提供了PySpark Shell ，它将Python API链接到spark核心并初始化Spark上下文。
```shell
cd $SPARK_HOME
./bin/pyspark
>>>
Welcome to
      ____              __
     / __/__  ___ _____/ /__
    _\ \/ _ \/ _ `/ __/  '_/
   /__ / .__/\_,_/_/ /_/\_\   version 1.5.2
      /_/

Using Python version 2.7.9 (default, Mar  1 2015 12:57:24)
SparkContext available as sc, HiveContext available as sqlContext.
```
注意最后一行 `SparkContext available as **sc**, HiveContext available as **sqlContext**`.


PySpark提供了PySpark Shell ，它将Python API链接到spark核心并初始化Spark上下文。

## 2.2. python 程序




# 3. Spark Core 基本用法

Programming in Spark 
1. 创建RDD,Create RDDs 
2. 应用转换, Apply transformations
3. 执行，Perform actions 

RDD，全称为 Resilient Distributed Datasets，是一个容错的、并行的数据结构，可以让用户显式地将数据存储到磁盘和内存中，并能控制数据的分区。

RDD 是不可变Java虚拟机（JVM）对象的分布式集合。我们使用python时候，尤其要注意，python数据是存储在JVM对象中的 


## 3.1. 创建RDDs
```python
# 1.SparkContext 类
class pyspark.SparkContext (
   master = None,
   appName = None,
   sparkHome = None,
   pyFiles = None,
   environment = None,
   batchSize = 0,
   serializer = PickleSerializer(),
   conf = None,
   gateway = None,
   jsc = None,
   profiler_cls = <class 'pyspark.profiler.BasicProfiler'>
)

# 以下是SparkContext的参数。
#     Master - 它是连接到的集群的URL。
#     appName - 您的工作名称。
#     sparkHome - Spark安装目录。
#     pyFiles - 要发送到集群并添加到PYTHONPATH的.zip或.py文件。
#     environment - 工作节点环境变量。
#     batchSize - 表示为单个Java对象的Python对象的数量。 设置1以禁用批处理，设置0以根据对象大小自动选择批处理大小，或设置为-1以使用无限批处理大小。
#     serializer - RDD序列化器。
#     Conf - L {SparkConf}的一个对象，用于设置所有Spark属性。
#     gateway - 使用现有网关和JVM，否则初始化新JVM。
#     JSC - JavaSparkContext实例。
#     profiler_cls - 用于进行性能分析的一类自定义Profiler（默认为pyspark.profiler.BasicProfiler）。


# 2.SparkContext 类
class pyspark.RDD (
   jrdd,
   ctx,
   jrdd_deserializer = AutoBatchedSerializer(PickleSerializer())
)
```
```python
from pyspark import SparkContext

sc = SparkContext("local", "count app")

# 1 从内存中读取并行集合
data = sc.parallelize(
    [('Amber', 22), ('Alfred', 23), ('Skye',4), ('Albert', 12), 
     ('Amber', 9)])

# 2 从硬盘中读取
# 本地文件系统，HDFS，Cassandra，HBase，Amazon S3等。 Spark 支持文本文件(text files)，SequenceFiles 和其他 Hadoop InputFormat。
data_from_file = sc.textFile('/Users/drabast/Documents/PySpark_Data/VS14MORT.txt.gz',4)
## 4： Parallelize  range output  into 4 partitions 

```


# 4. 实践


```python
Stop the current Spark Session

spark.sparkContext.stop()
Create a Spark Session

spark = SparkSession.builder.config(conf=conf).getOrCreate()
```

## 4.1. 连接 

**Master URLs**
传递给 Spark 的 master URL 可以使用下列格式中的一种 :

Master URL| Meaning
--|--
local|使用一个线程本地运行 Spark（即，没有并行性）。
local[K]|使用 K 个 worker 线程本地运行 Spark（理想情况下，设置这个值的数量为您机器的 core 数量）。
local[K,F]|使用 K 个 worker 线程本地运行 Spark并允许最多失败 F次 (查阅 spark.task.maxFailures 以获取对该变量的解释)
local[*]|使用更多的 worker 线程作为逻辑的 core 在您的机器上来本地的运行 Spark。
local[*,F]|使用更多的 worker 线程作为逻辑的 core 在您的机器上来本地的运行 Spark并允许最多失败 F次。
spark://HOST:PORT|连接至给定的 Spark standalone cluster master. master。该 port（端口）必须有一个作为您的 master 配置来使用，默认是 7077。
spark://HOST1:PORT1,HOST2:PORT2|连接至给定的 Spark standalone cluster with standby masters with Zookeeper. 该列表必须包含由zookeeper设置的高可用集群中的所有master主机。该 port（端口）必须有一个作为您的 master 配置来使用，默认是 7077。
mesos://HOST:PORT|连接至给定的 Mesos 集群. 该 port（端口）必须有一个作为您的配置来使用，默认是 5050。或者，对于使用了 ZooKeeper 的 Mesos cluster 来说，使用 mesos://zk://.... 。使用 --deploy-mode cluster, 来提交，该 HOST:PORT 应该被配置以连接到 MesosClusterDispatcher.
yarn|连接至一个 YARN cluster in client or cluster mode 取决于 --deploy-mode. 的值在 client 或者 cluster 模式中。该 cluster 的位置将根据 HADOOP_CONF_DIR 或者 YARN_CONF_DIR 变量来找到。

## 4.2. 查看信息

```python
# version1 
sc._conf.getAll()

# version2 
spark.sparkContext.getConf().getAll()
```

### 4.2.1. 节点数量

```python
spark = 

.builder.master("local[*]").getOrCreate()
sc = spark._jsc.sc() 
n_workers = len(set([executor.host() for executor in sc.statusTracker().getExecutorInfos()]))
print(n_workers)
```
## 4.3. shell

默认情况下，当PySpark shell启动时，Spark会自动创建名为sc的SparkContext对象。

```python
logFile = "file:///home/hadoop/spark-2.1.0-bin-hadoop2.7/README.md"
logData = sc.textFile(logFile).cache()
numAs = logData.filter(lambda s: 'a' in s).count()
numBs = logData.filter(lambda s: 'b' in s).count()
print "Lines with a: %i, lines with b: %i" % (numAs, numBs)
>>>
Lines with a: 62, lines with b: 30
```

## 4.4. python

### 4.4.1. 连接集群--创建 SparkContext

#### 4.4.1.1. spark on  standalone


```python
from pyspark import SparkContext

sc = SparkContext("local", "first app")
```



#### 4.4.1.2. spark on k8s

```python
import os
from pyspark import SparkContext, SparkConf
from pyspark.sql import SparkSession
# Create Spark config for our Kubernetes based cluster manager
sparkConf = SparkConf()
sparkConf.setMaster("k8s://https://kubernetes.default.svc.cluster.local:443")
sparkConf.setAppName("spark")
sparkConf.set("spark.kubernetes.container.image", "pidocker-docker-registry.default.svc.cluster.local:5000/my-spark-py:v2.4.4")
sparkConf.set("spark.kubernetes.namespace", "spark")
sparkConf.set("spark.executor.instances", "7")
sparkConf.set("spark.executor.cores", "2")
sparkConf.set("spark.driver.memory", "512m")
sparkConf.set("spark.executor.memory", "512m")
sparkConf.set("spark.kubernetes.pyspark.pythonVersion", "3")
sparkConf.set("spark.kubernetes.authenticate.driver.serviceAccountName", "spark")
sparkConf.set("spark.kubernetes.authenticate.serviceAccountName", "spark")
sparkConf.set("spark.driver.port", "29413")
sparkConf.set("spark.driver.host", "my-notebook-deployment.spark.svc.cluster.local")
# Initialize our Spark cluster, this will actually
# generate the worker nodes.
spark = SparkSession.builder.config(conf=sparkConf).getOrCreate()
sc = spark.sparkContext
```
说明：


1.  `setMaster`: 设置Spark 集群的 master url， 告诉 sparkContext ，集群是由  Kubernetes (k8s)管理的，通过发现kube-api  server服务 来请求资源
`k8s://https://<k8s-apiserver-host>:<k8s-apiserver-port> \`

<k8s-apiserver-host> 通过 `kubectl cluster-info`确定

```shell
kubectl cluster-info
>>>
Kubernetes master is running at https://10.0.77.98:6443
KubeDNS is running at https://10.0.77.98:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
Metrics-server is running at https://10.0.77.98:6443/api/v1/namespaces/kube-system/services/https:metrics-server:/proxy
```


`k8s://https://kubernetes.default.svc.cluster.local:443`
# 5. 参考资料

https://iowiki.com/pyspark/pyspark_sparkcontext.html

https://doc.codingdict.com/spark/4/