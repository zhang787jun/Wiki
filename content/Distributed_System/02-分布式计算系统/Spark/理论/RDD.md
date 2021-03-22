---
title: "RDD的概念、特点及运行原理"
layout: page
date: 2099-06-02 00:00
---
[TOC]
# 1. RDD


RDD，全称为 Resilient Distributed Datasets（弹性分布式数据集），是一个**容错的**、**并行**的数据结构，可以让用户显式地将数据存储到磁盘和内存中，并能控制数据的分区，是一个无序的列表（ JVM对象），是不可变、**只读的**，**被分区**的数据集

# 2. RDD的特点


## 2.1. 弹性数据分区

Partition：数据分区，是指的spark在计算过程中，生成的数据在计算空间内最小单元。即一个RDD数据集可以划分为多少个数据分区。同一份数据（RDD）的**partition 大小不一**，**数量不定**，是根据application里的算子和最初读入的数据分块数量决定的，这也是为什么叫“**弹性**分布式”数据集的原因之一。（在内存）


![](/attach/images/2019-10-14-16-59-16.png)

**如图所示**RDD_1含有5个partition 分区（p1、p2、p3、p4、p5），分别存储在4个节点（Node1、node2、Node3、Node4）中。RDD_2含有3个分区（p1、p2、p3），分布在3个节点（Node1、Node2、Node3）中。

RDD分区的一个分区原则是使得分区的个数尽量等于集群中的CPU核心（core）数目。


**NOTE**  
**Partition与block** 
hdfs中的block是分布式存储的最小单元，类似于盛放文件的盒子，一个文件可能要占多个盒子，但一个盒子里的内容只可能来自同一份文件。假设block设置为128M，你的文件是250M，那么这份文件占3个block（128+128+2）。这样的设计虽然会有一部分磁盘空间的浪费，但是整齐的block大小，便于快速找到、读取对应的内容。（p.s. 考虑到hdfs冗余设计，默认三份拷贝，实际上3*3=9个block的物理空间。）

spark中的partition 是弹性分布式数据集RDD的最小单元，RDD是由分布在各个节点上的partition 组成的。partition 是指的spark在计算过程中，生成的数据在计算空间内最小单元，同一份数据（RDD）的partition 大小不一，数量不定，是根据application里的算子和最初读入的数据分块数量决定的，这也是为什么叫“弹性分布式”数据集的原因之一。



| HDFS block                    | RDD partition                                      |
| ----------------------------- | -------------------------------------------------- |
| block位于存储空间             | partition 位于计算空间，                           |
| block的大小是固定的           | partition 大小是不固定的，                         |
| block是有冗余的、不会轻易丢失 | partition（RDD）没有冗余设计、丢失之后重新计算得到 |


## 2.2. 粗粒度

不能进行细粒度操作（对数据集中某一条数据进行修改），修改是针对整个数据集的。

## 2.3. 只读
如下图所示，RDD是只读的，要想改变RDD中的数据，只能在现有的RDD基础上创建新的RDD。

## 2.4. 依赖


RDDs通过操作算子进行转换，转换得到的新RDD包含了从其他RDDs衍生所必需的信息，RDDs之间维护着这种血缘关系，也称之为依赖。如下图所示，依赖包括两种，一种是窄依赖，RDDs之间分区是一一对应的，另一种是宽依赖，下游RDD的每个分区与上游RDD(也称之为父RDD)的每个分区都有关，是多对多的关系。

![](/attach/images/2019-10-14-16-46-08.png)




如果用户没有要求Spark cache该RDD的结果，那么这个过程占用的内存是很小的，一个元素处理完毕后就落地或扔掉了（概念上如此，实现上有buffer），并不会长久地占用内存。只有在用户要求Spark cache该RDD，且storage level要求在内存中cache时，Iterator计算出的结果才会被保留，通过cache manager放入内存池。



总体而言，如果父RDD的一个分区只被一个子RDD的一个分区所使用就是窄依赖，否则就是宽依赖。窄依赖典型的操作包括map、filter、union等，宽依赖典型的操作包括groupByKey、sortByKey等。对于连接（join）操作，可以分为两种情况。
（1）对输入进行协同划分，属于窄依赖（如图9-10(a)所示）。所谓协同划分（co-partitioned）是指多个父RDD的某一分区的所有“键（key）”，落在子RDD的同一个分区内，不会产生同一个父RDD的某一分区，落在子RDD的两个分区的情况。
（2）对输入做非协同划分，属于宽依赖，如图9-10(b)所示。
对于窄依赖的RDD，可以以流水线的方式计算所有父分区，不会造成网络之间的数据混合。对于宽依赖的RDD，则通常伴随着Shuffle操作，即首先需要计算好所有父分区数据，然后在节点之间进行Shuffle。



## 2.5. 可缓存
如果在应用程序中多次使用同一个RDD，可以将该RDD缓存起来，该RDD只有在第一次计算的时候会根据血缘关系得到分区的数据，在后续其他地方用到该RDD的时候，会直接从缓存处取而不用再根据血缘关系计算，这样就加速后期的重用。如下图所示，RDD-1经过一系列的转换后得到RDD-n并保存到hdfs，RDD-1在这一过程中会有个中间结果，如果将其缓存到内存，那么在随后的RDD-1转换到RDD-m这一过程中，就不会计算其之前的RDD-0了。


## 2.6. 支持容错机制--checkpointing

RDD 对容错的支持
支持容错通常采用两种方式：数据复制或日志记录。对于以数据为中心的系统而言，这两种方式都非常昂贵，因为它需要跨集群网络拷贝大量数据，毕竟带宽的数据远远低于内存。

RDD 天生是支持容错的。首先，它自身是一个不变的 (immutable) 数据集，其次，它能够记住构建它的操作图（Graph of Operation），因此当执行任务的 Worker 失败时，完全可以通过操作图获得之前执行的操作，进行重新计算。由于无需采用 replication 方式支持容错，很好地降低了跨网络的数据传输成本。

不过，在某些场景下，Spark 也需要利用记录日志的方式来支持容错。例如，在 Spark Streaming 中，针对数据进行 update 操作，或者调用 Streaming 提供的 window 操作时，就需要恢复执行过程的中间状态。此时，需要通过 Spark 提供的 checkpoint 机制，以支持操作能够从 checkpoint 得到恢复。

针对 RDD 的 wide dependency，最有效的容错方式同样还是采用 checkpoint 机制。不过，似乎 Spark 的最新版本仍然没有引入 auto checkpointing 机制。

因为checkpoint后的RDD不需要知道它的父RDDs了，它可以从checkpoint处拿到数据。


# 3. RDD 操作
由一个RDD转换到另一个RDD，可以通过丰富的操作算子实现，不再像MapReduce那样只能写map和reduce了，如下图所示。


RDD**逻辑上是分区**的，每个分区的数据是抽象存在的，计算的时候会通过一个compute函数得到每个分区的数据。

1. 如果RDD是通过已有的文件系统构建，则compute函数是读取指定文件系统中的数据，
2. 如果RDD是通过其他RDD转换而来，则compute函数是执行转换逻辑将其他RDD的数据进行转换。


RDD主要有2个操作。

**Transform** 转化操作：由一个RDD生成一个新的RDD(Dataset)。惰性求值。
**Action** 行动操作：会对RDD(Dataset)计算出一个结果或者写到外部系统。会触发实际的计算。
Spark 会**惰性计算**这些RDD，只有第一次在一个行动操作中用到时才会真正计算。


## Transform

##　Action

## 持久化

一般，Spark会在每次行动操作时重新计算转换RDD。如果想复用，则用`persist`把RDD持久化缓存下来。可以持久化到内存、到磁盘、在多个节点上进行复制。这样，在下次查询时，集群可以更快地访问。


Persist一个RDD后，**每个节点**都会将这个RDD计算的**所有分区**存储在内存中，并且会在后续的计算中进行复用。这可以让future actions快很多(一般是10倍)。缓存是迭代算法和快速交互使用的关键工具。

### 具体方法

出于不同的目的，持久化可以设置不同的级别。例如可以缓存到磁盘，缓存到内存(以序列化对象存储，节省空间)等，然后会复制到其他节点上。可以对persist传递StorageLevel对象进行设置缓存级别，而cache方法默认的是MEMORY_ONLY，下面是几个常用的。

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




# Pair RDDs

## 动机
Spark provides special operations on RDDs containing key/value pairs. These RDDs are called pair RDDs. Pair RDDs are a useful building block in many programs, as they expose operations that allow you to act on each key in parallel or regroup data across the network. For example, pair RDDs have a reduceByKey() method that can aggregate data separately for each key, and a join() method that can merge two RDDs together by grouping elements with the same key. It is common to extract fields from an RDD (representing, for instance, an event time, customer ID, or other identifier) and use those fields as keys in pair RDD operations.


key-value RDDs 

键值对RDD是Spark操作中最常用的RDD，它是很多程序的构成要素，因为他们提供了并行操作各个键或跨界点重新进行数据分组的操作接口。

 普通RDD里面存储的数据类型是Int、String等，而“键值对RDD”里面存储的数据类型是“键值对”。

 

创建
Spark中有许多中创建键值对RDD的方式，其中包括

文件读取时直接返回键值对RDD
通过List创建键值对RDD
在Scala中，可通过Map函数生成二元组

val listRDD = sc.parallelize(List(1,2,3,4,5))
val result = listRDD.map(x => (x,1))
result.foreach(println)
 
//结果
(1,1)
(2,1)
(3,1)
(4,1)
(5,1)


＃
## 操作

### Transform
### action

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

combineByKey
============

> combineByKey( createCombiner, mergeValue, mergeCombiners, partitioner,mapSideCombine)
>
> combineByKey( createCombiner, mergeValue, mergeCombiners, partitioner)
>
> combineByKey( createCombiner, mergeValue, mergeCombiners)

**函数功能：**

聚合各分区的元素，而每个元素都是二元组。功能与基础RDD函数aggregate()差不多，可让用户返回与输入数据类型不同的返回值。

combineByKey函数的每个参数分别对应聚合操作的各个阶段。所以，理解此函数对Spark如何操作RDD会有很大帮助。

**参数解析：**

createCombiner：**分区内 **创建组合函数

mergeValue：**分区内 **合并值函数

mergeCombiners：**多分区 **合并组合器函数

partitioner：自定义分区数，默认为HashPartitioner

mapSideCombine：是否在map端进行Combine操作，默认为true

**工作流程：**

1.  combineByKey会遍历分区中的**所有元素**，因此每个元素的key要么没遇到过，要么和之前某个元素的key相同。
2.  如果这是一个新的元素，函数会调用createCombiner创建那个key对应的累加器**初始值**。
3.  如果这是一个在处理当前分区之前已经遇到的key，会调用mergeCombiners把该key累加器对应的当前value与这个新的value**合并**。

**代码例子：**

//统计男女个数

| 12345678910 | `val conf =` `new` `SparkConf ().setMaster (``"local"``).setAppName (``"app_1"``)``val sc =` `new` `SparkContext (conf)``val people = List((``"男"``,` `"李四"``), (``"男"``,` `"张三"``), (``"女"``,` `"韩梅梅"``), (``"女"``,` `"李思思"``), (``"男"``,` `"马云"``))``val rdd = sc.parallelize(people,``2``)``val result = rdd.combineByKey(``(x: String) => (List(x),` `1``),` `//createCombiner``(peo: (List[String], Int), x : String) => (x :: peo._1, peo._2 +` `1``),` `//mergeValue``(sex1: (List[String], Int), sex2: (List[String], Int)) => (sex1._1 ::: sex2._1, sex1._2 + sex2._2))` `//mergeCombiners``result.foreach(println)` |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

**结果**

(男, ( List( 张三,  李四,  马云),3 ) )
(女, ( List( 李思思,  韩梅梅),2 ) )

**流程分解：**

[![Spark算子-combineByKey](https://images2015.cnblogs.com/blog/368951/201702/368951-20170223163813804-1005141379.png "Spark算子-combineByKey")](http://images2015.cnblogs.com/blog/368951/201702/368951-20170223163812663-2101150083.png)

解析：两个分区，分区一按顺序V1、V2、V3遍历

-   V1，发现第一个key=男时，调用createCombiner，即
    ```
    (x: String) => (List(x), 1)
    ```

-   V2，第二次碰到key=男的元素，调用mergeValue，即
    ```
    (peo: (List[String], Int), x : String) => (x :: peo._1, peo._2 + 1)
    ```

-   V3，发现第一个key=女，继续调用createCombiner，即
    ```
    (x: String) => (List(x), 1)
    ```

-   ... ...
-   待各V1、V2分区都计算完后，数据进行混洗，调用mergeCombiners，即
    ```
    (sex1: (List[String], Int), sex2: (List[String], Int)) => (sex1._1 ::: sex2._1, sex1._2 + sex2._2))
    ```

* * * * *

add by jan 2017-02-27 18:34:39

以下例子都基于此RDD

| 1234 | `(Hadoop,``1``)``(Spark,``1``)``(Hive,``1``)``(Spark,``1``)` |
| ---- | ------------------------------------------------------------ |

reduceByKey(func)
=================

reduceByKey(func)的功能是，使用func函数合并具有相同键的值。

比如，reduceByKey((a,b) => a+b)，有四个键值对("spark",1)、("spark",2)、("hadoop",3)和("hadoop",5)，对具有相同key的键值对进行合并后的结果就是：("spark",3)、("hadoop",8)。可以看出，(a,b) => a+b这个Lamda表达式中，a和b都是指value，比如，对于两个具有相同key的键值对("spark",1)、("spark",2)，a就是1，b就是2。

| 1234 | `scala> pairRDD.reduceByKey((a,b)``=``>a+b).foreach(println)``(Spark,``2``)``(Hive,``1``)``(Hadoop,``1``)` |
| ---- | ---------------------------------------------------------------------------------------------------------- |

groupByKey()
============

roupByKey()的功能是，对具有相同键的值进行分组。比如，对四个键值对("spark",1)、("spark",2)、("hadoop",3)和("hadoop",5)，采用groupByKey()后得到的结果是：("spark",(1,2))和("hadoop",(3,5))。

| 1234567 | `scala> pairRDD.groupByKey()``res``15``:` `org.apache.spark.rdd.RDD[(String, Iterable[Int])] ``=` `ShuffledRDD[``15``] at groupByKey at <console>``:``34``//从上面执行结果信息中可以看出，分组后，value被保存到Iterable[Int]中``scala> pairRDD.groupByKey().foreach(println)``(Spark,CompactBuffer(``1``, ``1``))``(Hive,CompactBuffer(``1``))``(Hadoop,CompactBuffer(``1``))` |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

keys
====

keys只会把键值对RDD中的key返回形成一个新的RDD。比如，对四个键值对("spark",1)、("spark",2)、("hadoop",3)和("hadoop",5)构成的RDD，采用keys后得到的结果是一个RDD[Int]，内容是{"spark","spark","hadoop","hadoop"}。

| 1234567 | `scala> pairRDD.keys``res``17``:` `org.apache.spark.rdd.RDD[String] ``=` `MapPartitionsRDD[``17``] at keys at <console>``:``34``scala> pairRDD.keys.foreach(println)``Hadoop``Spark``Hive``Spark` |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

values
======

 values只会把键值对RDD中的value返回形成一个新的RDD。比如，对四个键值对("spark",1)、("spark",2)、("hadoop",3)和("hadoop",5)构成的RDD，采用keys后得到的结果是一个RDD[Int]，内容是{1,2,3,5}。

| 12345678 | `scala> pairRDD.values``res``0``:` `org.apache.spark.rdd.RDD[Int] ``=` `MapPartitionsRDD[``2``] at values at <console>``:``34``scala> pairRDD.values.foreach(println)``1``1``1``1` |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

sortByKey()
===========

 sortByKey()的功能是返回一个根据键排序的RDD。

| 1234567 | `scala> pairRDD.sortByKey()``res``0``:` `org.apache.spark.rdd.RDD[(String, Int)] ``=` `ShuffledRDD[``2``] at sortByKey at <console>``:``34``scala> pairRDD.sortByKey().foreach(println)``(Hadoop,``1``)``(Hive,``1``)``(Spark,``1``)``(Spark,``1``)` |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

mapValues(func)
===============

我们经常会遇到一种情形，我们只想对键值对RDD的value部分进行处理，而不是同时对key和value进行处理。对于这种情形，Spark提供了mapValues(func)，它的功能是，对键值对RDD中的每个value都应用一个函数，但是，key不会发生变化。比如，对四个键值对("spark",1)、("spark",2)、("hadoop",3)和("hadoop",5)构成的pairRDD，如果执行pairRDD.mapValues(x => x+1)，就会得到一个新的键值对RDD，它包含下面四个键值对("spark",2)、("spark",3)、("hadoop",4)和("hadoop",6)。 

| 1234567 | `scala> pairRDD.mapValues(x ``=``> x+``1``)``res``2``:` `org.apache.spark.rdd.RDD[(String, Int)] ``=` `MapPartitionsRDD[``4``] at mapValues at <console>``:``34``scala> pairRDD.mapValues(x ``=``> x+``1``).foreach(println)``(Hadoop,``2``)``(Spark,``2``)``(Hive,``2``)``(Spark,``2``)` |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

join
====

join(连接)操作是键值对常用的操作。"连接"(join)这个概念来自于关系数据库领域，因此，join的类型也和关系数据库中的join一样，包括内连接(join)、左外连接(leftOuterJoin)、右外连接(rightOuterJoin)等。最常用的情形是内连接，所以，join就表示内连接。
对于内连接，对于给定的两个输入数据集(K,V1)和(K,V2)，只有在两个数据集中都存在的key才会被输出，最终得到一个(K,(V1,V2))类型的数据集。

比如，pairRDD1是一个键值对集合{("spark",1)、("spark",2)、("hadoop",3)和("hadoop",5)}，pairRDD2是一个键值对集合{("spark","fast")}，那么，pairRDD1.join(pairRDD2)的结果就是一个新的RDD，这个新的RDD是键值对集合{("spark",1,"fast"),("spark",2,"fast")}。对于这个实例，我们下面在spark-shell中运行一下：

| 123456789101112 | `scala> ``val` `pairRDD``1` `=` `sc.parallelize(Array((``"spark"``,``1``),(``"spark"``,``2``),(``"hadoop"``,``3``),(``"hadoop"``,``5``)))``pairRDD``1``:` `org.apache.spark.rdd.RDD[(String, Int)] ``=` `ParallelCollectionRDD[``24``] at parallelize at <console>``:``27``scala> ``val` `pairRDD``2` `=` `sc.parallelize(Array((``"spark"``,``"fast"``)))``pairRDD``2``:` `org.apache.spark.rdd.RDD[(String, String)] ``=` `ParallelCollectionRDD[``25``] at parallelize at <console>``:``27``scala> pairRDD``1``.join(pairRDD``2``)``res``9``:` `org.apache.spark.rdd.RDD[(String, (Int, String))] ``=` `MapPartitionsRDD[``28``] at join at <console>``:``32``scala> pairRDD``1``.join(pairRDD``2``).foreach(println)``(spark,(``1``,fast))``(spark,(``2``,fast))` |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

# 内存管理 

感觉问题定义的不够清晰。spark只是大数据处理的搬运工，或是包工头比较贴切。它负责把任务转化为DAG序列的小任务，然后丢给yarn一个一个执行。       

真正执行任务叫container,实际是一个有内存上限的java进程，一般内存可以设置到10G。   
接下来需要考虑处理一个T的数据问题了。一个container无论如何都无法加载到内存里面，所以需要对一个T的数据做partition处理。简单的做法可以通过hash分片，比如分成1000个分片，那么每个partition只需要处理差不多一个G的数据。分片会产生shuffle,序列化和数据传输需要占用一定时间。  实际抛开spark,如果熟悉map reduce思想，只给8G内存的机器也能完成1T数据的处理，只是中间过程很难避免大量文件读写，处理的速度比较慢。而spark是一个集群，可以将具体任务分拆成很多能够并行执行的小任务，然后并行计算提高了运行的速度。



Apache Spark 内存管理详解
	卢 亮
2017 年 3 月 28 日发布
WeiboGoogle+用电子邮件发送本页面

 Comments  9
Spark 作为一个基于内存的分布式计算引擎，其内存管理模块在整个系统中扮演着非常重要的角色。理解 Spark 内存管理的基本原理，有助于更好地开发 Spark 应用程序和进行性能调优。本文旨在梳理出 Spark 内存管理的脉络，抛砖引玉，引出读者对这个话题的深入探讨。本文中阐述的原理基于 Spark 2.1 版本，阅读本文需要读者有一定的 Spark 和 Java 基础，了解 RDD、Shuffle、JVM 等相关概念。

在执行 Spark 的应用程序时，Spark 集群会启动 Driver 和 Executor 两种 JVM 进程，前者为主控进程，负责创建 Spark 上下文，提交 Spark 作业（Job），并将作业转化为计算任务（Task），在各个 Executor 进程间协调任务的调度，后者负责在工作节点上执行具体的计算任务，并将结果返回给 Driver，同时为需要持久化的 RDD 提供存储功能[1]。由于 Driver 的内存管理相对来说较为简单，本文主要对 Executor 的内存管理进行分析，下文中的 Spark 内存均特指 Executor 的内存。

1. 堆内和堆外内存规划
作为一个 JVM 进程，Executor 的内存管理建立在 JVM 的内存管理之上，Spark 对 JVM 的堆内（On-heap）空间进行了更为详细的分配，以充分利用内存。同时，Spark 引入了堆外（Off-heap）内存，使之可以直接在工作节点的系统内存中开辟空间，进一步优化了内存的使用。

图 1 . 堆内和堆外内存示意图

1.1 堆内内存
堆内内存的大小，由 Spark 应用程序启动时的 –executor-memory 或 spark.executor.memory 参数配置。Executor 内运行的并发任务共享 JVM 堆内内存，这些任务在缓存 RDD 数据和广播（Broadcast）数据时占用的内存被规划为存储（Storage）内存，而这些任务在执行 Shuffle 时占用的内存被规划为执行（Execution）内存，剩余的部分不做特殊规划，那些 Spark 内部的对象实例，或者用户定义的 Spark 应用程序中的对象实例，均占用剩余的空间。不同的管理模式下，这三部分占用的空间大小各不相同（下面第 2 小节会进行介绍）。

Spark 对堆内内存的管理是一种逻辑上的"规划式"的管理，因为对象实例占用内存的申请和释放都由 JVM 完成，Spark 只能在申请后和释放前记录这些内存，我们来看其具体流程：

申请内存：
Spark 在代码中 new 一个对象实例
JVM 从堆内内存分配空间，创建对象并返回对象引用
Spark 保存该对象的引用，记录该对象占用的内存
释放内存：
Spark 记录该对象释放的内存，删除该对象的引用
等待 JVM 的垃圾回收机制释放该对象占用的堆内内存
我们知道，JVM 的对象可以以序列化的方式存储，序列化的过程是将对象转换为二进制字节流，本质上可以理解为将非连续空间的链式存储转化为连续空间或块存储，在访问时则需要进行序列化的逆过程——反序列化，将字节流转化为对象，序列化的方式可以节省存储空间，但增加了存储和读取时候的计算开销。

对于 Spark 中序列化的对象，由于是字节流的形式，其占用的内存大小可直接计算，而对于非序列化的对象，其占用的内存是通过周期性地采样近似估算而得，即并不是每次新增的数据项都会计算一次占用的内存大小，这种方法降低了时间开销但是有可能误差较大，导致某一时刻的实际内存有可能远远超出预期[2]。此外，在被 Spark 标记为释放的对象实例，很有可能在实际上并没有被 JVM 回收，导致实际可用的内存小于 Spark 记录的可用内存。所以 Spark 并不能准确记录实际可用的堆内内存，从而也就无法完全避免内存溢出（OOM, Out of Memory）的异常。

虽然不能精准控制堆内内存的申请和释放，但 Spark 通过对存储内存和执行内存各自独立的规划管理，可以决定是否要在存储内存里缓存新的 RDD，以及是否为新的任务分配执行内存，在一定程度上可以提升内存的利用率，减少异常的出现。

1.2 堆外内存
为了进一步优化内存的使用以及提高 Shuffle 时排序的效率，Spark 引入了堆外（Off-heap）内存，使之可以直接在工作节点的系统内存中开辟空间，存储经过序列化的二进制数据。利用 JDK Unsafe API（从 Spark 2.0 开始，在管理堆外的存储内存时不再基于 Tachyon，而是与堆外的执行内存一样，基于 JDK Unsafe API 实现[3]），Spark 可以直接操作系统堆外内存，减少了不必要的内存开销，以及频繁的 GC 扫描和回收，提升了处理性能。堆外内存可以被精确地申请和释放，而且序列化的数据占用的空间可以被精确计算，所以相比堆内内存来说降低了管理的难度，也降低了误差。

在默认情况下堆外内存并不启用，可通过配置 spark.memory.offHeap.enabled 参数启用，并由 spark.memory.offHeap.size 参数设定堆外空间的大小。除了没有 other 空间，堆外内存与堆内内存的划分方式相同，所有运行中的并发任务共享存储内存和执行内存。

1.3 内存管理接口
Spark 为存储内存和执行内存的管理提供了统一的接口——MemoryManager，同一个 Executor 内的任务都调用这个接口的方法来申请或释放内存:

清单 1 . 内存管理接口的主要方法

//申请存储内存
def acquireStorageMemory(blockId: BlockId, numBytes: Long, memoryMode: MemoryMode): Boolean
//申请展开内存
def acquireUnrollMemory(blockId: BlockId, numBytes: Long, memoryMode: MemoryMode): Boolean
//申请执行内存
def acquireExecutionMemory(numBytes: Long, taskAttemptId: Long, memoryMode: MemoryMode): Long
//释放存储内存
def releaseStorageMemory(numBytes: Long, memoryMode: MemoryMode): Unit
//释放执行内存
def releaseExecutionMemory(numBytes: Long, taskAttemptId: Long, memoryMode: MemoryMode): Unit
//释放展开内存
def releaseUnrollMemory(numBytes: Long, memoryMode: MemoryMode): Unit
我们看到，在调用这些方法时都需要指定其内存模式（MemoryMode），这个参数决定了是在堆内还是堆外完成这次操作。

MemoryManager 的具体实现上，Spark 1.6 之后默认为统一管理（Unified Memory Manager）方式，1.6 之前采用的静态管理（Static Memory Manager）方式仍被保留，可通过配置 spark.memory.useLegacyMode 参数启用。两种方式的区别在于对空间分配的方式，下面的第 2 小节会分别对这两种方式进行介绍。

2 . 内存空间分配
2.1 静态内存管理
在 Spark 最初采用的静态内存管理机制下，存储内存、执行内存和其他内存的大小在 Spark 应用程序运行期间均为固定的，但用户可以应用程序启动前进行配置，堆内内存的分配如图 2 所示：

图 2 . 静态内存管理图示——堆内

可以看到，可用的堆内内存的大小需要按照下面的方式计算：

清单 2 . 可用堆内内存空间
1
2
可用的存储内存 = systemMaxMemory * spark.storage.memoryFraction * spark.storage.safetyFraction
可用的执行内存 = systemMaxMemory * spark.shuffle.memoryFraction * spark.shuffle.safetyFraction
其中 systemMaxMemory 取决于当前 JVM 堆内内存的大小，最后可用的执行内存或者存储内存要在此基础上与各自的 memoryFraction 参数和 safetyFraction 参数相乘得出。上述计算公式中的两个 safetyFraction 参数，其意义在于在逻辑上预留出 1-safetyFraction 这么一块保险区域，降低因实际内存超出当前预设范围而导致 OOM 的风险（上文提到，对于非序列化对象的内存采样估算会产生误差）。值得注意的是，这个预留的保险区域仅仅是一种逻辑上的规划，在具体使用时 Spark 并没有区别对待，和"其它内存"一样交给了 JVM 去管理。

堆外的空间分配较为简单，只有存储内存和执行内存，如图 3 所示。可用的执行内存和存储内存占用的空间大小直接由参数 spark.memory.storageFraction 决定，由于堆外内存占用的空间可以被精确计算，所以无需再设定保险区域。

图 3 . 静态内存管理图示——堆外

静态内存管理机制实现起来较为简单，但如果用户不熟悉 Spark 的存储机制，或没有根据具体的数据规模和计算任务或做相应的配置，很容易造成"一半海水，一半火焰"的局面，即存储内存和执行内存中的一方剩余大量的空间，而另一方却早早被占满，不得不淘汰或移出旧的内容以存储新的内容。由于新的内存管理机制的出现，这种方式目前已经很少有开发者使用，出于兼容旧版本的应用程序的目的，Spark 仍然保留了它的实现。

2.2 统一内存管理
Spark 1.6 之后引入的统一内存管理机制，与静态内存管理的区别在于存储内存和执行内存共享同一块空间，可以动态占用对方的空闲区域，如图 4 和图 5 所示

图 4 . 统一内存管理图示——堆内

图 5 . 统一内存管理图示——堆外

其中最重要的优化在于动态占用机制，其规则如下：

设定基本的存储内存和执行内存区域（spark.storage.storageFraction 参数），该设定确定了双方各自拥有的空间的范围
双方的空间都不足时，则存储到硬盘；若己方空间不足而对方空余时，可借用对方的空间;（存储空间不足是指不足以放下一个完整的 Block）
执行内存的空间被对方占用后，可让对方将占用的部分转存到硬盘，然后"归还"借用的空间
存储内存的空间被对方占用后，无法让对方"归还"，因为需要考虑 Shuffle 过程中的很多因素，实现起来较为复杂[4]
图 6 . 动态占用机制图示

凭借统一内存管理机制，Spark 在一定程度上提高了堆内和堆外内存资源的利用率，降低了开发者维护 Spark 内存的难度，但并不意味着开发者可以高枕无忧。譬如，所以如果存储内存的空间太大或者说缓存的数据过多，反而会导致频繁的全量垃圾回收，降低任务执行时的性能，因为缓存的 RDD 数据通常都是长期驻留内存的 [5] 。所以要想充分发挥 Spark 的性能，需要开发者进一步了解存储内存和执行内存各自的管理方式和实现原理。

1. 存储内存管理
3.1 RDD 的持久化机制
弹性分布式数据集（RDD）作为 Spark 最根本的数据抽象，是只读的分区记录（Partition）的集合，只能基于在稳定物理存储中的数据集上创建，或者在其他已有的 RDD 上执行转换（Transformation）操作产生一个新的 RDD。转换后的 RDD 与原始的 RDD 之间产生的依赖关系，构成了血统（Lineage）。凭借血统，Spark 保证了每一个 RDD 都可以被重新恢复。但 RDD 的所有转换都是惰性的，即只有当一个返回结果给 Driver 的行动（Action）发生时，Spark 才会创建任务读取 RDD，然后真正触发转换的执行。
Task 在启动之初读取一个分区时，会先判断这个分区是否已经被持久化，如果没有则需要检查 Checkpoint 或按照血统重新计算。所以如果一个 RDD 上要执行多次行动，可以在第一次行动中使用 persist 或 cache 方法，在内存或磁盘中持久化或缓存这个 RDD，从而在后面的行动时提升计算速度。事实上，cache 方法是使用默认的 MEMORY_ONLY 的存储级别将 RDD 持久化到内存，故缓存是一种特殊的持久化。 堆内和堆外存储内存的设计，便可以对缓存 RDD 时使用的内存做统一的规划和管 理 （存储内存的其他应用场景，如缓存 broadcast 数据，暂时不在本文的讨论范围之内）。

RDD 的持久化由 Spark 的 Storage 模块 [7] 负责，实现了 RDD 与物理存储的解耦合。Storage 模块负责管理 Spark 在计算过程中产生的数据，将那些在内存或磁盘、在本地或远程存取数据的功能封装了起来。在具体实现时 Driver 端和 Executor 端的 Storage 模块构成了主从式的架构，即 Driver 端的 BlockManager 为 Master，Executor 端的 BlockManager 为 Slave。Storage 模块在逻辑上以 Block 为基本存储单位，RDD 的每个 Partition 经过处理后唯一对应一个 Block（BlockId 的格式为 rdd_RDD-ID_PARTITION-ID ）。Master 负责整个 Spark 应用程序的 Block 的元数据信息的管理和维护，而 Slave 需要将 Block 的更新等状态上报到 Master，同时接收 Master 的命令，例如新增或删除一个 RDD。

图 7 . Storage 模块示意图

在对 RDD 持久化时，Spark 规定了 MEMORY_ONLY、MEMORY_AND_DISK 等 7 种不同的 存储级别 ，而存储级别是以下 5 个变量的组合：

清单 3 . 存储级别
1
2
3
4
5
6
7
class StorageLevel private(
private var _useDisk: Boolean, //磁盘
private var _useMemory: Boolean, //这里其实是指堆内内存
private var _useOffHeap: Boolean, //堆外内存
private var _deserialized: Boolean, //是否为非序列化
private var _replication: Int = 1 //副本个数
)
通过对数据结构的分析，可以看出存储级别从三个维度定义了 RDD 的 Partition（同时也就是 Block）的存储方式：

存储位置：磁盘／堆内内存／堆外内存。如 MEMORY_AND_DISK 是同时在磁盘和堆内内存上存储，实现了冗余备份。OFF_HEAP 则是只在堆外内存存储，目前选择堆外内存时不能同时存储到其他位置。
存储形式：Block 缓存到存储内存后，是否为非序列化的形式。如 MEMORY_ONLY 是非序列化方式存储，OFF_HEAP 是序列化方式存储。
副本数量：大于 1 时需要远程冗余备份到其他节点。如 DISK_ONLY_2 需要远程备份 1 个副本。
3.2 RDD 缓存的过程
RDD 在缓存到存储内存之前，Partition 中的数据一般以迭代器（Iterator）的数据结构来访问，这是 Scala 语言中一种遍历数据集合的方法。通过 Iterator 可以获取分区中每一条序列化或者非序列化的数据项(Record)，这些 Record 的对象实例在逻辑上占用了 JVM 堆内内存的 other 部分的空间，同一 Partition 的不同 Record 的空间并不连续。

RDD 在缓存到存储内存之后，Partition 被转换成 Block，Record 在堆内或堆外存储内存中占用一块连续的空间。将Partition由不连续的存储空间转换为连续存储空间的过程，Spark称之为"展开"（Unroll）。Block 有序列化和非序列化两种存储格式，具体以哪种方式取决于该 RDD 的存储级别。非序列化的 Block 以一种 DeserializedMemoryEntry 的数据结构定义，用一个数组存储所有的对象实例，序列化的 Block 则以 SerializedMemoryEntry的数据结构定义，用字节缓冲区（ByteBuffer）来存储二进制数据。每个 Executor 的 Storage 模块用一个链式 Map 结构（LinkedHashMap）来管理堆内和堆外存储内存中所有的 Block 对象的实例[6]，对这个 LinkedHashMap 新增和删除间接记录了内存的申请和释放。

因为不能保证存储空间可以一次容纳 Iterator 中的所有数据，当前的计算任务在 Unroll 时要向 MemoryManager 申请足够的 Unroll 空间来临时占位，空间不足则 Unroll 失败，空间足够时可以继续进行。对于序列化的 Partition，其所需的 Unroll 空间可以直接累加计算，一次申请。而非序列化的 Partition 则要在遍历 Record 的过程中依次申请，即每读取一条 Record，采样估算其所需的 Unroll 空间并进行申请，空间不足时可以中断，释放已占用的 Unroll 空间。如果最终 Unroll 成功，当前 Partition 所占用的 Unroll 空间被转换为正常的缓存 RDD 的存储空间，如下图 8 所示。

图 8. Spark Unroll 示意图

在图 3 和图 5 中可以看到，在静态内存管理时，Spark 在存储内存中专门划分了一块 Unroll 空间，其大小是固定的，统一内存管理时则没有对 Unroll 空间进行特别区分，当存储空间不足时会根据动态占用机制进行处理。

3.3 淘汰和落盘
由于同一个 Executor 的所有的计算任务共享有限的存储内存空间，当有新的 Block 需要缓存但是剩余空间不足且无法动态占用时，就要对 LinkedHashMap 中的旧 Block 进行淘汰（Eviction），而被淘汰的 Block 如果其存储级别中同时包含存储到磁盘的要求，则要对其进行落盘（Drop），否则直接删除该 Block。


存储内存的淘汰规则为：

被淘汰的旧 Block 要与新 Block 的 MemoryMode 相同，即同属于堆外或堆内内存
新旧 Block 不能属于同一个 RDD，避免循环淘汰
旧 Block 所属 RDD 不能处于被读状态，避免引发一致性问题
遍历 LinkedHashMap 中 Block，按照最近最少使用（LRU）的顺序淘汰，直到满足新 Block 所需的空间。其中 LRU 是 LinkedHashMap 的特性。
落盘的流程则比较简单，如果其存储级别符合_useDisk 为 true 的条件，再根据其_deserialized 判断是否是非序列化的形式，若是则对其进行序列化，最后将数据存储到磁盘，在 Storage 模块中更新其信息。

4. 执行内存管理
4.1 多任务间内存分配
Executor 内运行的任务同样共享执行内存，Spark 用一个 HashMap 结构保存了任务到内存耗费的映射。每个任务可占用的执行内存大小的范围为 1/2N ~ 1/N，其中 N 为当前 Executor 内正在运行的任务的个数。每个任务在启动之时，要向 MemoryManager 请求申请最少为 1/2N 的执行内存，如果不能被满足要求则该任务被阻塞，直到有其他任务释放了足够的执行内存，该任务才可以被唤醒。

4.2 Shuffle 的内存占用
执行内存主要用来存储任务在执行 Shuffle 时占用的内存，Shuffle 是按照一定规则对 RDD 数据重新分区的过程，我们来看 Shuffle 的 Write 和 Read 两阶段对执行内存的使用：

Shuffle Write
若在 map 端选择普通的排序方式，会采用 ExternalSorter 进行外排，在内存中存储数据时主要占用堆内执行空间。
若在 map 端选择 Tungsten 的排序方式，则采用 ShuffleExternalSorter 直接对以序列化形式存储的数据排序，在内存中存储数据时可以占用堆外或堆内执行空间，取决于用户是否开启了堆外内存以及堆外执行内存是否足够。
Shuffle Read
在对 reduce 端的数据进行聚合时，要将数据交给 Aggregator 处理，在内存中存储数据时占用堆内执行空间。
如果需要进行最终结果排序，则要将再次将数据交给 ExternalSorter 处理，占用堆内执行空间。
在 ExternalSorter 和 Aggregator 中，Spark 会使用一种叫 AppendOnlyMap 的哈希表在堆内执行内存中存储数据，但在 Shuffle 过程中所有数据并不能都保存到该哈希表中，当这个哈希表占用的内存会进行周期性地采样估算，当其大到一定程度，无法再从 MemoryManager 申请到新的执行内存时，Spark 就会将其全部内容存储到磁盘文件中，这个过程被称为溢存(Spill)，溢存到磁盘的文件最后会被归并(Merge)。

Shuffle Write 阶段中用到的 Tungsten 是 Databricks 公司提出的对 Spark 优化内存和 CPU 使用的计划[9]，解决了一些 JVM 在性能上的限制和弊端。Spark 会根据 Shuffle 的情况来自动选择是否采用 Tungsten 排序。Tungsten 采用的页式内存管理机制建立在 MemoryManager 之上，即 Tungsten 对执行内存的使用进行了一步的抽象，这样在 Shuffle 过程中无需关心数据具体存储在堆内还是堆外。每个内存页用一个 MemoryBlock 来定义，并用 Object obj 和 long offset 这两个变量统一标识一个内存页在系统内存中的地址。堆内的 MemoryBlock 是以 long 型数组的形式分配的内存，其 obj 的值为是这个数组的对象引用，offset 是 long 型数组的在 JVM 中的初始偏移地址，两者配合使用可以定位这个数组在堆内的绝对地址；堆外的 MemoryBlock 是直接申请到的内存块，其 obj 为 null，offset 是这个内存块在系统内存中的 64 位绝对地址。Spark 用 MemoryBlock 巧妙地将堆内和堆外内存页统一抽象封装，并用页表(pageTable)管理每个 Task 申请到的内存页。

Tungsten 页式管理下的所有内存用 64 位的逻辑地址表示，由页号和页内偏移量组成：

页号：占 13 位，唯一标识一个内存页，Spark 在申请内存页之前要先申请空闲页号。
页内偏移量：占 51 位，是在使用内存页存储数据时，数据在页内的偏移地址。
有了统一的寻址方式，Spark 可以用 64 位逻辑地址的指针定位到堆内或堆外的内存，整个 Shuffle Write 排序的过程只需要对指针进行排序，并且无需反序列化，整个过程非常高效，对于内存访问效率和 CPU 使用效率带来了明显的提升[10]。

Spark 的存储内存和执行内存有着截然不同的管理方式：对于存储内存来说，Spark 用一个 LinkedHashMap 来集中管理所有的 Block，Block 由需要缓存的 RDD 的 Partition 转化而成；而对于执行内存，Spark 用 AppendOnlyMap 来存储 Shuffle 过程中的数据，在 Tungsten 排序中甚至抽象成为页式内存管理，开辟了全新的 JVM 内存管理机制。

结束语
Spark 的内存管理是一套复杂的机制，且 Spark 的版本更新比较快，笔者水平有限，难免有叙述不清、错误的地方，若读者有好的建议和更深的理解，还望不吝赐教。




我们可以在Spark的配配置指南中配置各种参数。




