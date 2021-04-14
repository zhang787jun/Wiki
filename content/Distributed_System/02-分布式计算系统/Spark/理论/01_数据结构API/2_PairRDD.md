---
title: "2. Pair RDDs"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 什么是Pair RDDs

## 1.1. 动机--为什么有 Pair RDDs
普通RDD里面存储的数据类型是Int、String等，而 `Pair RDDs`里面存储的数据类型是"Key-Value"。

Spark provides **special operations**on RDDs containing key/value pairs. These RDDs are called pair RDDs. Pair RDDs are a useful building block in many programs, as they expose operations that allow you to act on each key in parallel or regroup data across the network. For example, pair RDDs have a reduceByKey() method that can aggregate data separately for each key, and a join() method that can merge two RDDs together by grouping elements with the same key. It is common to extract fields from an RDD (representing, for instance, an event time, customer ID, or other identifier) and use those fields as keys in pair RDD operations.

键值对RDD是Spark操作中最常用的RDD，它是很多程序的构成要素，因为他们提供了并行操作各个键或跨界点重新进行数据分组的操作接口。



# 2. 操作
##  2.1. 创建Pair RDDs
Spark中有许多中创建键值对RDD的方式，其中包括
1. 文件读取时直接返回键值对RDD
2. 通过List创建键值对RDD
3. 在Scala中，可通过Map函数生成二元组

### 2.1.1. 通过RDD创建
```scala
val listRDD = sc.parallelize(List(1,2,3,4,5))
val result = listRDD.map(x => (x,1))
result.foreach(println)
>>>
(1,1)
(2,1)
(3,1)
(4,1)
(5,1)
```
 
## 2.2. Transform 

1. reduceByKey()
2. groupByKey()
3. sortByKey()
4. join()
5. cogroup()



### 2.2.1. keys

keys只会把键值对RDD中的key返回形成一个新的RDD。

```python
res=pair_rdd.keys()
type(res)
>>>
pyspark.rdd.PipelinedRDD

pair_rdd.keys().collect()
>>>
list
```


### 2.2.2. values
values 只会把键值对RDD中的value返回形成一个新的RDD

```python
rdd = sc.parallelize([("a1","b1","c1","d1","e1"), ("a2","b2","c2","d2","e2")])
pair_rdd = rdd.map(lambda x: (x[0], list(x[1:])))

res=pair_rdd.values()
type(res)
>>>
pyspark.rdd.PipelinedRDD

pair_rdd.values().collect()
>>>
[['b1', 'c1', 'd1', 'e1'], ['b2', 'c2', 'd2', 'e2']]
# list
```



### 2.2.3. combineByKey
```shell

> combineByKey( createCombiner, mergeValue, mergeCombiners, partitioner,mapSideCombine)
>
> combineByKey( createCombiner, mergeValue, mergeCombiners, partitioner)
>
> combineByKey( createCombiner, mergeValue, mergeCombiners)
```

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


```scala
val conf =new SparkConf ().setMaster ("local").setAppName ("app_1")
val sc =new SparkContext (conf)
val people = List(("男","李四"), ("男","张三"), ("女","韩梅梅"), ("女","李思思"), ("男","马云"))
val rdd = sc.parallelize(people,``2``)
val result = rdd.combineByKey(``(x: String) => (List(x),1``),//createCombiner``(peo: (List[String], Int), x : String) => (x :: peo._1, peo._2 +1``),//mergeValue``(sex1: (List[String], Int), sex2: (List[String], Int)) => (sex1._1 ::: sex2._1, sex1._2 + sex2._2))//mergeCombiners``result.foreach(println)
>>>>

(男, ( List( 张三,  李四,  马云),3 ) )
(女, ( List( 李思思,  韩梅梅),2 ) )

```




**流程分解：**

[![Spark算子-combineByKey](https://images2015.cnblogs.com/blog/368951/201702/368951-20170223163813804-1005141379.png"Spark算子-combineByKey")](http://images2015.cnblogs.com/blog/368951/201702/368951-20170223163812663-2101150083.png)

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
### 2.2.4. reduceByKey

reduceByKey(func)的功能是，使用func函数合并具有相同键的值。

比如，reduceByKey((a,b) => a+b)，有四个键值对("spark",1)、("spark",2)、("hadoop",3)和("hadoop",5)，对具有相同key的键值对进行合并后的结果就是：("spark",3)、("hadoop",8)。可以看出，(a,b) => a+b这个Lamda表达式中，a和b都是指value，比如，对于两个具有相同key的键值对("spark",1)、("spark",2)，a就是1，b就是2。
```scala
pairRDD.reduceByKey((a,b)=>a+b).foreach(println)

(Spark,``2``)``(Hive,``1``)``(Hadoop,``1``)` 
```


### 2.2.5. groupByKey

groupByKey()的功能是，对具有相同键的值进行分组，返回RDD。比如，对四个键值对("spark",1)、("spark",2)、("hadoop",3)和("hadoop",5)，采用groupByKey()后得到的结果是：("spark",(1,2))和("hadoop",(3,5))。
```python
pair_rdd.groupByKey()
```


### 2.2.6. sortByKey

sortByKey()的功能是返回一个根据键排序的RDD。
### 2.2.7. mapValues


我们经常会遇到一种情形，我们只想对键值对RDD的value部分进行处理，而不是同时对key和value进行处理。对于这种情形，Spark提供了mapValues(func)，它的功能是，对键值对RDD中的每个value都应用一个函数，但是，key不会发生变化。比如，对四个键值对("spark",1)、("spark",2)、("hadoop",3)和("hadoop",5)构成的pairRDD，如果执行pairRDD.mapValues(x => x+1)，就会得到一个新的键值对RDD，它包含下面四个键值对("spark",2)、("spark",3)、("hadoop",4)和("hadoop",6)。 

### 2.2.8. join


join(连接)操作是键值对常用的操作。"连接"(join)这个概念来自于关系数据库领域，因此，join的类型也和关系数据库中的join一样，包括内连接(join)、左外连接(leftOuterJoin)、右外连接(rightOuterJoin)等。最常用的情形是内连接，所以，join就表示内连接。
对于内连接，对于给定的两个输入数据集(K,V1)和(K,V2)，只有在两个数据集中都存在的key才会被输出，最终得到一个(K,(V1,V2))类型的数据集。

比如，pairRDD1是一个键值对集合{("spark",1)、("spark",2)、("hadoop",3)和("hadoop",5)}，pairRDD2是一个键值对集合{("spark","fast")}，那么，pairRDD1.join(pairRDD2)的结果就是一个新的RDD，这个新的RDD是键值对集合{("spark",1,"fast"),("spark",2,"fast")}。对于这个实例，我们下面在spark-shell中运行一下：



## 2.3. Action

### 2.3.1. collectAsMap
collectAsMap	Returns the pair RDD as a Map to the Spark Master.
### 2.3.2. countByKey
countByKey	Returns the count of each key elements. This returns the final result to local Map which is your driver.
### 2.3.3. countByKeyApprox
countByKeyApprox	Same as countByKey but returns the partial result. This takes a timeout as parameter to specify how long this function to run before returning.
### 2.3.4. lookup
lookup	Returns a list of values from RDD for a given input key.
### 2.3.5. reduceByKeyLocally
reduceByKeyLocally	Returns a merged RDD by merging the values of each key and final result will be sent to the master.
### 2.3.6. saveAsHadoopDataset
saveAsHadoopDataset	Saves RDD to any hadoop supported file system (HDFS, S3, ElasticSearch, e.t.c), It uses Hadoop JobConf object to save.
### 2.3.7. saveAsHadoopFile

saveAsHadoopFile	Saves RDD to any hadoop supported file system (HDFS, S3, ElasticSearch, e.t.c), It uses Hadoop OutputFormat class to save.
### 2.3.8. saveAsNewAPIHadoopDataset
saveAsNewAPIHadoopDataset	Saves RDD to any hadoop supported file system (HDFS, S3, ElasticSearch, e.t.c) with new Hadoop API, It uses Hadoop Configuration object to save.
### 2.3.9. saveAsNewAPIHadoopFile
saveAsNewAPIHadoopFile	Saves RDD to any hadoop supported fule system (HDFS, S3, ElasticSearch, e.t.c), It uses new Hadoop API OutputFormat class to save.

# 3. 参考资料

https://intellipaat.com/blog/tutorial/spark-tutorial/working-with-keyvalue-pairs/
