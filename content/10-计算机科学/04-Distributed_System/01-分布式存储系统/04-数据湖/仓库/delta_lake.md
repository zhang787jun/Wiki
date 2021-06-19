---
title: "Delta Lake"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# Delta Lake简介


Delta Lake 其实只是一个Lib库

Delta Lake 是一个lib 而不是一个service,不同于HBase,他不需要单独部署，而是直接依附于计算引擎的。目前只支持Spark引擎。这意味什么呢？Delta Lake 和普通的parquet文件使用方式没有任何差异，你只要在你的Spark代码项目里引入delta包，按标准的Spark datasource操作即可，可谓部署和使用成本极低。

Delta Lake到底是什么

Parquet文件 + Meta 文件 + 一组操作的API = Delta Lake.



Delta Lake 是一个存储层，为 Apache Spark 和大数据 workloads 提供 ACID 事务能力，其通过写和快照隔离之间的乐观并发控制（optimistic concurrency control），在写入数据期间提供一致性的读取，从而为构建在 HDFS 和云存储上的数据湖（data lakes）带来可靠性。


```
Parquet文件 + Meta 文件 + 一组操作的API = Delta Lake
```