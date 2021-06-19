---
title: "Hbase"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# HBase
Apache HBase 是一种开源 NoSQL 数据库，它构建在 Apache Hadoop 的基础之上，并基于 Google BigTable 模型化。 HBase 针对无架构数据库中的大量数据提供随机访问和强一致性。 数据库按列系列进行组织。
从用户角度来看，HBase 类似于数据库。 数据存储在表的行和列中，行中的数据按列系列分组。 HBase 是一个无架构数据库。 列和数据类型可以不定义便使用。 开放源代码可进行线性伸缩，以处理上千节点上数 PB 的数据。 开放源代码可依赖 Hadoop 环境中的分布式应用程序提供的数据冗余、批处理以及其他功能。
如何在 Azure HDInsight 中实现 Apache HBase？
HDInsight HBase 以集成到 Azure 环境中的托管群集形式提供。 这些群集配置为在 Azure 存储中直接存储数据，这样就减少了延迟，并提高了选择性能和价格的弹性。 此属性使客户能够构建用于处理大型数据集的交互式网站。 构建用于存储数百万个终结点的传感器和遥测数据的服务。 以及使用 Hadoop 作业分析这些数据。 对于 Azure 中的大数据项目，HBase 和 Hadoop 是不错的起点。 实时应用程序可以利用这些服务来处理大型数据集。
HDInsight 实现使用 HBase 的横向扩展体系结构自动提供表分片， 并提供读写强一致性和自动故障转移。 性能可通过对读取使用内存中缓存并对写入使用高吞吐量流式处理来提高。 可以在虚拟网络内部创建 HBase 群集。 有关详细信息，请参阅在 Azure 虚拟网络上创建 HDInsight 群集。
如何在 HDInsight HBase 中管理数据？
数据可以在 HBase 中通过使用 HBase shell 中的 create、get、put 和 scan 命令来管理。 数据通过使用 put 写入到数据库，并通过使用 get 读取。 scan 命令用于从表中的多行获得数据。 Data 也可以使用 HBase C# API 进行管理，该 API 在 HBase REST API 顶部提供客户端库。 HBase 数据库还可以通过使用 Apache Hive 进行查询。 有关这些编程模型的简介，请参阅开始在 HDInsight 中将 Apache HBase 与 Apache Hadoop 配合使用。 共同处理器也适用，这样，便可在托管数据库的节点中处理数据。