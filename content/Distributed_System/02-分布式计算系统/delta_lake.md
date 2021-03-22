---
title: "Delta Lake"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# Delta Lake简介
Delta Lake 是一个存储层，为 Apache Spark 和大数据 workloads 提供 ACID 事务能力，其通过写和快照隔离之间的乐观并发控制（optimistic concurrency control），在写入数据期间提供一致性的读取，从而为构建在 HDFS 和云存储上的数据湖（data lakes）带来可靠性。


```
Parquet文件 + Meta 文件 + 一组操作的API = Delta Lake
```