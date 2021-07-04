---
title: "Spark Lib--SQL "
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 基础概念
## Spark SQL是什么 
Spark SQL 是用来处理结构化数据的模块。


Spark SQL 是 Spark  中面向结构化数据处理的组件。Spark SQL 的目标是：让用户写更少的代码、让程序读取更少的数据、让优化器来负责对程序进行繁重的优化工作。总结起来就是：简单、高效。 
##  SQL不是什么
Spark SQL 不是仅用来处理 SQL 请求的模块


与基本RDD相比，Spark SQL提供了更多关于数据结构和计算方面的信息(在内部有优化效果)。通常通过SQL和Dataset API来和Spark SQL进行交互。

`SQL`: 进行SQL查询，从各种结构化数据源(Json, Hive, Parquet)读取数据。返回Dataset/DataFrame。

`Dataset`: 分布式的数据集合。

`DataFrame`：是一个组织有列名的Dataset。类似于关系型数据库中的表。
可以使用结构化数据文件、Hive表、外部数据库、RDD等创建。在Scala和Java中，DataFrame由Rows和Dataset组成。在Scala中，DataFrame只是Dataset[Row]的类型别名。在Java中，用Dataset表示DataFrame





Spark SQL  提出了 schema RDD 和 DataFrame API，相比于基础的 RDD API，
schema RDD  及其后来的替代者 DataFrame  携带有将要处理的数据的元信息，如
列名和各个字段的类型。其可以简单地被看成是在内存中的一个数据表，Spark SQL 
可以使用 DataFrame 携带的数据的元信息对执行过程进行针对性优化。在 Spark 
SQL 中，来自关系型数据库、Hive、Json 文件等各种数据源的数据都会被转换成
DataFrame 来进行处理，DataFrame 实际上成为了 Spark SQL 与外界进行数据交换

# 2. 初始化Spark 任务
```python
from pyspark.sql import SparkSession

spark = SparkSession \
    .builder \
    .appName("Python Spark SQL basic example") \
    .config("spark.some.config.option", "some-value") \
    .getOrCreate()
```


# 高效的从读取

二、spark sql属性介绍


1、dbtable：表名，可以是真实存在的关系表，也可以是通过查询语句 AS 出来的表。其实只要是在 SQL 语句里，FROM 后面能跟的语句用在 dbtable 属性都合法，其原理就是拼接 SQL 语句，dbtable 会填在 FROM 后面。


2、numPartitions：读、写的最大分区数，也决定了开启数据库连接的数目。使用 numPartitions 有一点点限制， 如果指定了 numPartitions 大于1的值，但是没有指定分区规则，仍只有一个 task 去执行查询。


3、partitionColumn, lowerBound, upperBound：指定读数据时的分区规则。要使用这三个参数，必须定义 numPartitions，而且这三个参数不能单独出现，要用就必须全部指定。而且 lowerBound, upperBound 不是过滤条件，只是用于决定分区跨度。在分区的时候，会根据 numPartitions 将 lowerBound 和 upperBound 拆分成，然后并行去执行查询。

```shell

# 情况一：
if partitionColumn || lowerBound || upperBound || numPartitions 有任意选项未指定，报错
# 情况二：
if numPartitions == 1 忽略这些选项，直接读取，返回一个分区
# 情况三：
if numPartitions > 1 && lowerBound > upperBound 报错
# 情况四： 
numPartitions = min(upperBound - lowerBound, numPartitions)
if numPartitions == 1 同情况二
else 返回numPartitions个分区
delta = (upperBound - lowerBound) / numPartitions
分区1数据条件：partitionColumn <= lowerBound + delta || partitionColumn is null
分区2数据条件：partitionColumn > lowerBound + delta && partitionColumn <= lowerBound + 2 * delta
...
最后分区数据条件：partitionColumn > lowerBound + n*delta
```