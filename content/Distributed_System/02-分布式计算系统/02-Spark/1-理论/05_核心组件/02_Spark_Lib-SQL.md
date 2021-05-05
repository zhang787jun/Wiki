---
title: "Spark Lib--SQL "
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 基础概念
**Spark SQL是什么** 
Spark SQL 是用来处理结构化数据的模块。
**Spark SQL不是什么**
Spark SQL 不是仅用来处理 SQL 请求的模块


与基本RDD相比，Spark SQL提供了更多关于数据结构和计算方面的信息(在内部有优化效果)。通常通过SQL和Dataset API来和Spark SQL进行交互。

`SQL`: 进行SQL查询，从各种结构化数据源(Json, Hive, Parquet)读取数据。返回Dataset/DataFrame。

`Dataset`: 分布式的数据集合。

`DataFrame`：是一个组织有列名的Dataset。类似于关系型数据库中的表。
可以使用结构化数据文件、Hive表、外部数据库、RDD等创建。在Scala和Java中，DataFrame由Rows和Dataset组成。在Scala中，DataFrame只是Dataset[Row]的类型别名。在Java中，用Dataset表示DataFrame


# 2. 初始化Spark 任务
```python
from pyspark.sql import SparkSession

spark = SparkSession \
    .builder \
    .appName("Python Spark SQL basic example") \
    .config("spark.some.config.option", "some-value") \
    .getOrCreate()
```
