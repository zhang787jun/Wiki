---
title: 1. Spark RDD的概念、特点及运行原理
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 什么是RDD

RDD，全称为 Resilient Distributed Datasets（弹性分布式数据集），是一个**容错的**、**并行**的数据结构，可以让用户显式地将数据存储到磁盘和内存中，并能控制数据的分区，是一个无序的列表（Java虚拟机，JVM对象），是**不可变**、**只读的**，**被分区**的数据集

<img src=https://pic2.zhimg.com/80/v2-149271b4ceab4c4ba7b1712b014d8a60_hd.jpg>

# 2. RDD的特点


## 2.1. 弹性数据分区

Partition：数据分区，是指的spark在计算过程中，生成的数据在计算空间内最小单元。即一个RDD数据集可以划分为多少个数据分区。同一份数据（RDD）的**partition 大小不一**，**数量不定**，是根据application里的算子和最初读入的数据分块数量决定的，这也是为什么叫“**弹性**分布式”数据集的原因之一。（在内存）


![](/attach/images/2019-10-14-16-59-16.png)

**如图所示** RDD_1 含有5个partition 分区（p1、p2、p3、p4、p5），分别存储在4个节点（Node1、node2、Node3、Node4）中。RDD_2含有3个分区（p1、p2、p3），分布在3个节点（Node1、Node2、Node3）中。

RDD分区的一个分区原则是使得分区的个数尽量等于集群中的CPU核心（core）数目。


**NOTE**  
**Partition与block** 
hdfs中的block是分布式存储的最小单元，类似于盛放文件的盒子，一个文件可能要占多个盒子，但一个盒子里的内容只可能来自同一份文件。假设block设置为128M，你的文件是250M，那么这份文件占3个block（128+128+2）。这样的设计虽然会有一部分磁盘空间的浪费，但是整齐的block大小，便于快速找到、读取对应的内容。（p.s. 考虑到hdfs冗余设计，默认三份拷贝，实际上3*3=9个block的物理空间。）

spark中的partition 是弹性分布式数据集RDD的最小单元，RDD是由分布在各个节点上的partition 组成的。partition 是指的spark在计算过程中，生成的数据在计算空间内最小单元，同一份数据（RDD）的partition 大小不一，数量不定，是根据application里的算子和最初读入的数据分块数量决定的，这也是为什么叫**弹性分布式**数据集的原因之一。

| HDFS block                    | RDD partition                                      |
| ----------------------------- | -------------------------------------------------- |
| block位于存储空间             | partition 位于计算空间，                           |
| block的大小是固定的           | partition 大小是不固定的，                         |
| block是有冗余的、不会轻易丢失 | partition（RDD）没有冗余设计、丢失之后重新计算得到 |



### 2.1.1. 数据分区方式
Spark包含3种数据分区方式：
1. HashPartitioner（哈希分区）
2. RangePartitioner（范围分区）
3. 自定义分区


## 2.2. 粗粒度

不能进行细粒度操作（对数据集中某一条数据进行修改），修改是针对整个数据集的。

## 2.3. 只读
RDD是只读的，要想改变RDD中的数据，只能在现有的RDD基础上创建新的RDD。

## 2.4. 依赖

RDDs通过操作算子进行转换，转换得到的新RDD包含了从其他RDDs衍生所必需的信息，RDDs之间维护着这种血缘关系，也称之为依赖。

如下图所示，依赖包括两种，一种是窄依赖，RDDs之间分区是一一对应的，另一种是宽依赖，下游RDD的每个分区与上游RDD(也称之为父RDD)的每个分区都有关，是多对多的关系。

![](/attach/images/2019-10-14-16-46-08.png)

如果用户没有要求Spark cache该RDD的结果，那么这个过程占用的内存是很小的，一个元素处理完毕后就落地或扔掉了（概念上如此，实现上有buffer），并不会长久地占用内存。只有在用户要求Spark cache该RDD，且storage level要求在内存中cache时，Iterator计算出的结果才会被保留，通过cache manager放入内存池。

总体而言，如果父RDD的一个分区只被一个子RDD的一个分区所使用就是窄依赖，否则就是宽依赖。窄依赖典型的操作包括map、filter、union等，宽依赖典型的操作包括groupByKey、sortByKey等。对于连接（join）操作，可以分为两种情况。
1. 对输入进行协同划分，属于窄依赖。所谓协同划分（co-partitioned）是指多个父RDD的某一分区的所有“键（key）”，落在子RDD的同一个分区内，不会产生同一个父RDD的某一分区，落在子RDD的两个分区的情况。
2. 对输入做非协同划分，属于宽依赖。
对于窄依赖的RDD，可以以流水线的方式计算所有父分区，不会造成网络之间的数据混合。对于宽依赖的RDD，则通常伴随着Shuffle操作，即首先需要计算好所有父分区数据，然后在节点之间进行Shuffle。



## 2.5. 可缓存
如果在应用程序中多次使用同一个RDD，可以将该RDD缓存起来，该RDD只有在第一次计算的时候会根据血缘关系得到分区的数据，在后续其他地方用到该RDD的时候，会直接从缓存处取而不用再根据血缘关系计算，这样就加速后期的重用。

如下图所示，RDD-1经过一系列的转换后得到RDD-n并保存到hdfs，RDD-1在这一过程中会有个中间结果，如果将其缓存到内存，那么在随后的RDD-1转换到RDD-m这一过程中，就不会计算其之前的RDD-0了。
![](https://img-blog.csdnimg.cn/20190122191551656.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2xpdXBpbnlhbmc=,size_16,color_FFFFFF,t_70)

## 2.6. 支持容错机制--checkpointing

**背景**
支持容错通常采用两种方式：
1. 数据复制
2. 日志记录
   
对于以数据为中心的系统而言，这两种方式都非常昂贵，因为它需要跨集群网络拷贝大量数据，毕竟带宽的数据远远低于内存。

RDD 天生是支持容错的。首先，它自身是一个**不变的 (immutable)** 数据集，其次，它能够记住构建它的操作图（Graph of Operation），因此当执行任务的 Worker 失败时，完全可以通过操作图获得之前执行的操作，进行重新计算。由于无需采用 replication 方式支持容错，很好地降低了跨网络的数据传输成本。

不过，在某些场景下，Spark 也需要利用记录日志的方式来支持容错。例如，在 Spark Streaming 中，针对数据进行 update 操作，或者调用 Streaming 提供的 window 操作时，就需要恢复执行过程的中间状态。此时，需要通过 Spark 提供的 checkpoint 机制，以支持操作能够从 checkpoint 得到恢复。

针对 RDD 的 `wide dependency`，最有效的容错方式同样还是采用 checkpoint 机制。


不过，似乎 Spark 的最新版本仍然没有引入 `auto checkpointing`机制。因为checkpoint后的RDD不需要知道它的父RDDs了，它可以从checkpoint处拿到数据。
# 3. RDD 的分析

## 3.1. 存储情况

rdd里的元素是怎么存储的，它们占用多少存储空间？

关于rdd的元素怎么存储，spark里面实现了好几种不同类型的rdd。

如最常见的MapPartitionsRDD，它处理 map,filter,mapPartition 等不引起shuffle的算子；

再如ShuffledRDD它由shuffle操作生成的；像GraphX里面的VertexRDD、EdgeRDD和TripletRDD，它们是分区内构建了大量索引得rdd。

不同的rdd拥有不同的元素存储机制，这些机制由rdd具体的分区对象来实现。关于rdd分区对象的存储方式，由于内容过多，这里不便介绍。


```shell
元素数目	元素类型	rdd占用空间大小
1M	Int	32MB
1M	(Int, Int)	48MB
1M	(Int, Int, Int)	120MB
1M	Long	32MB
1M	(Long, Long)	56MB
1M	(Long, Long, Long)	120MB
1G	Int	32GB
1G	(Int, Int)	48GB
1G	(Int, Int, Int)	120GB
1G	Long	32GB
1G	(Long, Long)	56GB
1G	(Long, Long, Long)	120GB
10G	Int	240GB
10G	Long	246.7GB
```
本实验1M使用单个分区，1G使用80个分区（10个节点）,10G使用144个分区（18个节点）

1M与1G元素规模的结果吻合的太好了，以至于我都有不敢相信，可是测试出来的结果就是这样的，这也证明spark在数据规模可扩展性方面真是太完美了。

关于每条元素的存储开销，若元素是Java对象存储，那么每条元素至少会带入18自己额外开销，若以基本数据类型存储，则不会带入额外开销。


测试结果有一些诡异的地方： 
相同元素规模情况下，Int与Long占用空间相同，(Int, Int)与(Long, Long)不同，但(Int, Int, Int)与(Long, Long, Long)又相同。 
1M Int净存储空间为4MB，但占用32MB空间，且占用空间一般呈整数样式。

# 4. RDD 基本操作
RDD主要有4类操作:
1. **Creation** 创建操作
2. **Transform** 转化操作：由一个RDD生成一个新的RDD(Dataset)。惰性求值。
3. **Action** 行动操作：会对RDD(Dataset)计算出一个结果或者写到外部系统。会触发实际的计算。
4. **Control** 控制操作
进行RDD持久化，可以让RDD按照不用的存储策略保存在磁盘或者内存中，主要有`persist`、`cache`两个方法，实际上cache是使用persist的快捷方法，使用了默认的存储级别`MEMORY_ONLY`将RDD缓存在内存中

Spark 会**惰性计算**这些RDD，只有第一次在一个行动操作中用到时才会真正计算。

```shell
# Programming in Spark 
1. 创建RDD,Create RDDs 
2. 应用转换, Apply transformations
3. 执行, Perform actions 
```

## 4.1. 创建RDDs
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

sc = SparkContext("local","count app")

# 1 从内存中读取并行集合
data = sc.parallelize(
    [('Amber', 22), ('Alfred', 23), ('Skye',4), ('Albert', 12), 
     ('Amber', 9)])

# 2 从硬盘中读取
# 本地文件系统，HDFS，Cassandra，HBase，Amazon S3等。 Spark 支持文本文件(text files)，SequenceFiles 和其他 Hadoop InputFormat。
data_from_file = sc.textFile('/Users/drabast/Documents/PySpark_Data/VS14MORT.txt.gz',4)
## 4： Parallelize  range output  into 4 partitions 

```

## 4.2. 查看基本信息

```python
# 查看分区情况
rdd.getNumPartitions()
>>>
4 

# 查看存储等级
rdd.getStorageLevel()
>>>
StorageLevel(True, False, False, False, 1)

# DISK_ONLY = StorageLevel(True, False, False, False, 1)
# DISK_ONLY_2 = StorageLevel(True, False, False, False, 2)
# MEMORY_AND_DISK = StorageLevel(True, True, False, False, 1)
# MEMORY_AND_DISK_2 = StorageLevel(True, True, False, False, 2)
# MEMORY_AND_DISK_SER = StorageLevel(True, True, False, False, 1)
# MEMORY_AND_DISK_SER_2 = StorageLevel(True, True, False, False, 2)
# MEMORY_ONLY = StorageLevel(False, True, False, False, 1)
# MEMORY_ONLY_2 = StorageLevel(False, True, False, False, 2)
# MEMORY_ONLY_SER = StorageLevel(False, True, False, False, 1)
# MEMORY_ONLY_SER_2 = StorageLevel(False, True, False, False, 2)
# OFF_HEAP = StorageLevel(True, True, True, False, 1)
```
## 4.3. 应用 Transformations



| Transformation                                       | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
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
| aggregateByKey(zeroValue)(seqOp, combOp, [numTasks]) | When called on a dataset of (K, V) pairs, returns a dataset of (K, U) pairs where the values for each key are aggregated using the given combine functions and a neutral"zero" value. Allows an aggregated value type that is different than the input value type, while avoiding unnecessary allocations. Like in groupByKey, the number of reduce tasks is configurable through an optional second argument.                                                  |
| sortByKey([ascending], [numTasks])                   | When called on a dataset of (K, V) pairs where K implements Ordered, returns a dataset of (K, V) pairs sorted by keys in ascending or descending order, as specified in the boolean ascending argument.                                                                                                                                                                                                                                                         |
| join(otherDataset, [numTasks])                       | When called on datasets of type (K, V) and (K, W), returns a dataset of (K, (V, W)) pairs with all pairs of elements for each key. Outer joins are also supported through leftOuterJoin and rightOuterJoin.                                                                                                                                                                                                                                                     |
| cogroup(otherDataset, [numTasks])                    | When called on datasets of type (K, V) and (K, W), returns a dataset of (K, Iterable, Iterable) tuples. This operation is also called groupWith.                                                                                                                                                                                                                                                                                                                |
| cartesian(otherDataset)                              | When called on datasets of types T and U, returns a dataset of (T, U) pairs (all pairs of elements).                                                                                                                                                                                                                                                                                                                                                            |
| pipe(command, [envVars])                             | Pipe each partition of the RDD through a shell command, e.g. a Perl or bash script. RDD elements are written to the process's stdin and lines output to its stdout are returned as an RDD of strings.                                                                                                                                                                                                                                                           |
| coalesce(numPartitions)                              | Decrease the number of partitions in the RDD to numPartitions. Useful for running operations more efficiently after filtering down a large dataset.                                                                                                                                                                                                                                                                                                             |
| repartition(numPartitions)                           | Reshuffle the data in the RDD randomly to create either more or fewer partitions and balance it across them. This always shuffles all data over the network.                                                                                                                                                                                                                                                                                                    |

## 4.4. 实现 actions

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








| 函数名                                                                  | 目的                                                                                          | 示例                               | 结果                                                        |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------- |
| reduceByKey(f)                                                          | 合并具有相同key的值                                                                           | rdd.reduceByKey( ( x,y) => x+y )   | { (1,2) , (3,10) }                                          |
| groupByKey()                                                            | 对具有相同key的值分组                                                                         | rdd.groupByKey()                   | { (1,2) , (3, [4,6] ) }                                     |
| mapValues(f)                                                            | 对键值对中的每个值(value)应用一个函数，但不改变键(key)                                        | rdd.mapValues(x => x+1)            | { (1,3) , (3,5) , (3,7) }                                   |
| combineBy Key( createCombiner, mergeValue, mergeCombiners, partitioner) | 使用不同的返回类型合并具有相同键的值                                                          | 下面有详细讲解                     | -                                                           |
| flatMapValues(f)                                                        | 对键值对RDD中每个值应用返回一个迭代器的函数，然后对每个元素生成一个对应的键值对。常用语符号化 | rdd.flatMapValues(x => ( x to 5 )) | { (1, 2) ,  (1, 3) ,   (1, 4) , (1, 5) ,  (3, 4) , (3, 5) } |
| keys()                                                                  | 获取所有key                                                                                   | rdd.keys()                         | {1,3,3}                                                     |
| values()                                                                | 获取所有value                                                                                 | rdd.values()                       | {2,4,6}                                                     |
| sortByKey()                                                             | 根据key排序                                                                                   | rdd.sortByKey()                    | { (1,2) , (3,4) , (3,6) }                                   |


下表总结了针对两个键值对RDD的转化操作，以**rdd1 = { (1,2) , (3,4) , (3,6) }  rdd2 = { (3,9) }** 为例，

| 函数名         | 目的                               | 示例                      | 结果                                                     |
| -------------- | ---------------------------------- | ------------------------- | -------------------------------------------------------- |
| subtractByKey  | 删掉rdd1中与rdd2的key相同的元素    | rdd1.subtractByKey(rdd2)  | { (1,2) }                                                |
| join           | 内连接                             | rdd1.join(rdd2)           | {(3, (4, 9)), (3, (6, 9))}                               |
| leftOuterJoin  | 左外链接                           | rdd1.leftOuterJoin (rdd2) | {(3,( Some( 4), 9)), (3,( Some( 6), 9))}                 |
| rightOuterJoin | 右外链接                           | rdd1.rightOuterJoin(rdd2) | {(1,( 2, None)), (3, (4, Some( 9))), (3, (6, Some( 9)))} |
| cogroup        | 将两个RDD钟相同key的数据分组到一起 | rdd1.cogroup(rdd2)        | {(1,([ 2],[])), (3, ([4, 6],[ 9]))}                      |

由一个RDD转换到另一个RDD，可以通过丰富的操作算子实现，不再像MapReduce那样只能写map和reduce了，如下图所示。


RDD**逻辑上是分区**的，每个分区的数据是抽象存在的，计算的时候会通过一个compute函数得到每个分区的数据。

1. 如果RDD是通过已有的文件系统构建，则compute函数是读取指定文件系统中的数据，
2. 如果RDD是通过其他RDD转换而来，则compute函数是执行转换逻辑将其他RDD的数据进行转换。





## 4.5. 持久化

一般，Spark会在每次Action操作时重新计算转换RDD (相当于 提交1个job)。

如果想复用，则用`persist`把RDD持久化缓存下来。可以持久化到内存、到磁盘、在多个节点上进行复制。这样，在下次查询时，集群可以更快地访问。


Persist一个RDD后，**每个节点**都会将这个RDD计算的**所有分区**存储在内存中，并且会在后续的计算中进行复用。这可以让fu actions快很多(一般是10倍)。缓存是迭代算法和快速交互使用的关键工具。

### 4.5.1. 具体方法

出于不同的目的，持久化可以设置不同的级别。例如，缓存到内存(以序列化对象存储，节省空间)、可以缓存到磁盘等，然后会复制到其他节点上。可以对persist传递StorageLevel对象进行设置缓存级别，而cache方法默认的是MEMORY_ONLY，下面是几个常用的。

MEMORY_ONLY(default): RDD作为反序列化的Java对象存储在JVM中。如果not fit in memory，那么一些分区就不会存储，并且会在每次使用的时候重新计算。CPU时间快，但耗内存。

MEMORY_ONLY_SER: RDD作为序列化的Java对象存储在JVM中，每个分区一个字节数组。很省内存，可以选择一个快速的序列化器。CPU计算时间多。只是Java和Scala。

MEMORY_AND_DISK: 反序列化的Java对象存在内存中。如果not fit in memory，那么把不适合在磁盘中存放的分区存放在内存中。

MEMORY_AND_DISK_SER: 和MEMORY_ONLY_SER差不多，只是存不下的再存储到磁盘中，而不是再重新计算。只是Java和Scala。

| 名字                | 占用空间 | CPU时间 | 在内存 | 在磁盘 |
| ------------------- | -------- | ------- | ------ | ------ |
| MEMORY_ONLY         | 高       | 低      | 是     | 否     |
| MEMORY_ONLY_SER     | 低       | 高      | 是     | 否     |
| MEMORY_AND_DISK     | 高       | 中等    | 部分   | 部分   |
| MEMORY_AND_DISK_SER | 低       | 高      | 部分   | 部分   |
所有的类别都通过重新计算丢失的数据来保证容错能力。完整的配置见官方RDD持久化。

在Python中，我们会始终序列化要存储的数据，使用的是Pickle，所以不用担心选择serialized level。

在shuffle中，Spark会自动持久化一些中间结果，即使用户没有使用persist。这样是因为，如果一个节点failed，可以避免重新计算整个input。如果要reuse一个RDD的话，推荐使用persist这个RDD。



### 4.5.2. 保存数据到磁盘
3.1. 写到csv
3.2. 保存到parquet
3.3. 写到hive
3.4. 写到hdfs
3.5. 写到mysql




```python 
# 写到本地文件
file=r"...test.csv"
spark_df.write.csv(path=file, header=True, sep=",", mode='overwrite')
file=r"...test.parquet"
spark_df.write.parquet(path=file,mode='overwrite')



3.3. 写到hive
# 打开动态分区
spark.sql("set hive.exec.dynamic.partition.mode = nonstrict")
spark.sql("set hive.exec.dynamic.partition=true")

# 使用普通的 hive-sql 写入分区表
spark.sql("""
    insert overwrite table ai.da_aipurchase_dailysale_hive 
    partition (saledate) 
    select productid, propertyid, processcenterid, saleplatform, sku, poa, salecount, saledate 
    from szy_aipurchase_tmp_szy_dailysale distribute by saledate
    """)

# 使用每次重建分区表的方式
df.write.mode("overwrite").partitionBy("saledate").insertInto("ai.da_aipurchase_dailysale_hive")

df.write.saveAsTable("ai.da_aipurchase_dailysale_hive", None, "append", partitionBy='saledate')

# 不写分区表，只是简单的导入到hive表
jdbcDF.write.saveAsTable("ai.da_aipurchase_dailysale_for_ema_predict", None, "overwrite", None)
3.4. 写到hdfs
# 数据写到hdfs，而且以csv格式保存
jdbcDF.write.mode("overwrite").options(header="true").csv("/home/ai/da/da_aipurchase_dailysale_for_ema_predict.csv")
3.5. 写到mysql
# 会自动对齐字段，也就是说，spark_df 的列不一定要全部包含MySQL的表的全部列才行

# overwrite 清空表再导入
spark_df.write.mode("overwrite").format("jdbc").options(
    url='jdbc:mysql://127.0.0.1',
    user='root',
    password='123456',
    dbtable="test.test",
    batchsize="1000",
).save()

# append 追加方式
spark_df.write.mode("append").format("jdbc").options(
    url='jdbc:mysql://127.0.0.1',
    user='root',
    password='123456',
    dbtable="test.test",
    batchsize="1000",
).save()
```

# 5. RDD 的类型
如最常见的MapPartitionsRDD，它处理map,filter,mapPartition等不引起shuffle的算子；再如ShuffledRDD它由shuffle操作生成的；像GraphX里面的VertexRDD、EdgeRDD和TripletRDD，它们是分区内构建了大量索引得rdd。
