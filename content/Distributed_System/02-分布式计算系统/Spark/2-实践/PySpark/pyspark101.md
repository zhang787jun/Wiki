---
title: "pyspark 101"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 概况

## 1.1. PySpark Shell 


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

## 1.2. python 程序




# 2. Spark Core 基本用法

Programming in Spark 
1. 创建RDD,Create RDDs 
2. 应用转换, Apply transformations
3. 执行，Perform actions 

RDD，全称为 Resilient Distributed Datasets，是一个容错的、并行的数据结构，可以让用户显式地将数据存储到磁盘和内存中，并能控制数据的分区。

RDD 是不可变Java虚拟机（JVM）对象的分布式集合。我们使用python时候，尤其要注意，python数据是存储在JVM对象中的 


### 2.0.1. 创建RDDs
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
### 2.0.2. 应用transformations



| ransformation                                        | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| map(func)                                            | 返回一个新的分布式数据集，将数据源的每一个元素传递给函数 func 映射组成。                                                                                                                                                                                                                                                                                                                                                                                        |
| filter(func)                                         | 返回一个新的数据集，从数据源中选中一些元素通过函数 func 返回 true。                                                                                                                                                                                                                                                                                                                                                                                             |
| flatMap(func)                                        | 类似于 map，但是每个输入项能被映射成多个输出项(所以 func 必须返回一个 Seq，而不是单个 item)。                                                                                                                                                                                                                                                                                                                                                                   |
| mapPartitions(func)                                  | 类似于 map，但是分别运行在 RDD 的每个分区上，所以 func 的类型必须是 Iterator<T> => Iterator<U> 当运行在类型为 T 的 RDD 上。                                                                                                                                                                                                                                                                                                                                     |
| mapPartitionsWithIndex(func)                         | 类似于 mapPartitions，但是 func 需要提供一个 integer 值描述索引(index)，所以 func 的类型必须是 (Int, Iterator) => Iterator 当运行在类型为 T 的 RDD 上。                                                                                                                                                                                                                                                                                                         |
| sample(withReplacement, fraction, seed)              | 对数据进行采样。                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| union(otherDataset)                                  | Return a new dataset that contains the union of the elements in the source dataset and the argument.                                                                                                                                                                                                                                                                                                                                                            |
| intersection(otherDataset)                           | Return a new RDD that contains the intersection of elements in the source dataset and the argument.                                                                                                                                                                                                                                                                                                                                                             |
| distinct([numTasks]))                                | Return a new dataset that contains the distinct elements of the source dataset.                                                                                                                                                                                                                                                                                                                                                                                 |
| groupByKey([numTasks])                               | When called on a dataset of (K, V) pairs, returns a dataset of (K, Iterable) pairs. Note: If you are grouping in order to perform an aggregation (such as a sum or average) over each key, using reduceByKey or combineByKey will yield much better performance. Note: By default, the level of parallelism in the output depends on the number of partitions of the parent RDD. You can pass an optional numTasks argument to set a different number of tasks. |
| reduceByKey(func, [numTasks])                        | When called on a dataset of (K, V) pairs, returns a dataset of (K, V) pairs where the values for each key are aggregated using the given reduce function func, which must be of type (V,V) => V. Like in groupByKey, the number of reduce tasks is configurable through an optional second argument.                                                                                                                                                            |
| aggregateByKey(zeroValue)(seqOp, combOp, [numTasks]) | When called on a dataset of (K, V) pairs, returns a dataset of (K, U) pairs where the values for each key are aggregated using the given combine functions and a neutral "zero" value. Allows an aggregated value type that is different than the input value type, while avoiding unnecessary allocations. Like in groupByKey, the number of reduce tasks is configurable through an optional second argument.                                                 |
| sortByKey([ascending], [numTasks])                   | When called on a dataset of (K, V) pairs where K implements Ordered, returns a dataset of (K, V) pairs sorted by keys in ascending or descending order, as specified in the boolean ascending argument.                                                                                                                                                                                                                                                         |
| join(otherDataset, [numTasks])                       | When called on datasets of type (K, V) and (K, W), returns a dataset of (K, (V, W)) pairs with all pairs of elements for each key. Outer joins are also supported through leftOuterJoin and rightOuterJoin.                                                                                                                                                                                                                                                     |
| cogroup(otherDataset, [numTasks])                    | When called on datasets of type (K, V) and (K, W), returns a dataset of (K, Iterable, Iterable) tuples. This operation is also called groupWith.                                                                                                                                                                                                                                                                                                                |
| cartesian(otherDataset)                              | When called on datasets of types T and U, returns a dataset of (T, U) pairs (all pairs of elements).                                                                                                                                                                                                                                                                                                                                                            |
| pipe(command, [envVars])                             | Pipe each partition of the RDD through a shell command, e.g. a Perl or bash script. RDD elements are written to the process's stdin and lines output to its stdout are returned as an RDD of strings.                                                                                                                                                                                                                                                           |
| coalesce(numPartitions)                              | Decrease the number of partitions in the RDD to numPartitions. Useful for running operations more efficiently after filtering down a large dataset.                                                                                                                                                                                                                                                                                                             |
| repartition(numPartitions)                           | Reshuffle the data in the RDD randomly to create either more or fewer partitions and balance it across them. This always shuffles all data over the network.                                                                                                                                                                                                                                                                                                    |

### 2.0.3. 实现 actions


| Action                                    | Meaning                                                                                                                                                                                                                                                                                                                                                                                                             |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| reduce(func)                              | Aggregate the elements of the dataset using a function func (which takes two arguments and returns one). The function should be commutative and associative so that it can be computed correctly in parallel.                                                                                                                                                                                                       |
| collect()                                 | Return all the elements of the dataset as an array at the driver program. This is usually useful after a filter or other operation that returns a sufficiently small subset of the data.                                                                                                                                                                                                                            |
| count()                                   | Return the number of elements in the dataset.                                                                                                                                                                                                                                                                                                                                                                       |
| first()                                   | Return the first element of the dataset (similar to take(1)).                                                                                                                                                                                                                                                                                                                                                       |
| take(n)                                   | Return an array with the first n elements of the dataset. Note that this is currently not executed in parallel. Instead, the driver program computes all the elements.                                                                                                                                                                                                                                              |
| takeSample(withReplacement, num, [seed])  | Return an array with a random sample of num elements of the dataset, with or without replacement, optionally pre-specifying a random number generator seed.                                                                                                                                                                                                                                                         |
| takeOrdered(n, [ordering])                | Return the first n elements of the RDD using either their natural order or a custom comparator.                                                                                                                                                                                                                                                                                                                     |
| saveAsTextFile(path)                      | Write the elements of the dataset as a text file (or set of text files) in a given directory in the local filesystem, HDFS or any other Hadoop-supported file system. Spark will call toString on each element to convert it to a line of text in the file.                                                                                                                                                         |
| saveAsSequenceFile(path) (Java and Scala) | Write the elements of the dataset as a Hadoop SequenceFile in a given path in the local filesystem, HDFS or any other Hadoop-supported file system. This is available on RDDs of key-value pairs that either implement Hadoop's Writable interface. In Scala, it is also available on types that are implicitly convertible to Writable (Spark includes conversions for basic types like Int, Double, String, etc). |
| saveAsObjectFile(path) (Java and Scala)   | Write the elements of the dataset in a simple format using Java serialization, which can then be loaded using SparkContext.objectFile().                                                                                                                                                                                                                                                                            |
| countByKey()                              | Only available on RDDs of type (K, V). Returns a hashmap of (K, Int) pairs with the count of each key.                                                                                                                                                                                                                                                                                                              |
| foreach(func)                             | Run a function func on each element of the dataset. This is usually done for side effects such as updating an accumulator variable (see below) or interacting with external storage systems.                                                                                                                                                                                                                        |

Some Common Actions 
 Action Usage collect() Copy all elements to the driver take(n) Copy first n elements reduce(func) Aggregate elements with func (takes 2 elements, returns 1) saveAsTextFile(filename)  Save to local file or HDFS 

<img src=https://pic2.zhimg.com/80/v2-149271b4ceab4c4ba7b1712b014d8a60_hd.jpg>


Spark的三种模式的详细运行过程（基于standalone与基于yarn）


Spark部署在单台机器上面时，可以使用本地模式（Local）运行；当部署在分布式集群上面的时候，可以根据自己的情况选择Standalone模式（Spark自带的模式）、YARN-Client模式或者YARN-Cluster模式、Spark on Mesos模式。 


https://blog.csdn.net/wyqwilliam/article/details/84678867


# 3. 实践


```python
Stop the current Spark Session

spark.sparkContext.stop()
Create a Spark Session

spark = SparkSession.builder.config(conf=conf).getOrCreate()
```

## 3.1. 连接 

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

## 3.2. 查看信息

```python
myconf=sc._conf
myconf.getAll()
```

### 3.2.1. 节点数量


```python
spark = SparkSession.builder.master("local[*]").getOrCreate()
sc = spark._jsc.sc() 
n_workers = len(set([executor.host() for executor in sc.statusTracker().getExecutorInfos()]))
print(n_workers)
```
## 3.3. shell

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

## 3.4. python

### 3.4.1. 连接集群--创建 SparkContext

#### 3.4.1.1. spark on  standalone


```python
from pyspark import SparkContext

sc = SparkContext("local", "first app")
```



#### 3.4.1.2. spark on k8s

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
# 4. 参考资料

https://iowiki.com/pyspark/pyspark_sparkcontext.html

https://doc.codingdict.com/spark/4/