---
title: "0-Spark 101"
layout: page
date: 2099-06-02 00:00
---
[TOC]


# 1. Hello, Spark

Apache Spark 是用于大规模资料处理的计算引擎

Apache Spark 是一个小巧玲珑的项目，美国加州大学伯克利分校（UC Berkeley）的AMP实验室于2009年开发。使用的语言是Scala，项目的core部分的代码只有63个Scala文件，充分体现了精简之美。

Spark在诞生之初属于研究性项目，其诸多核心理念均源自学术研究论文。

2013年，Spark加入Apache孵化器项目后，开始获得迅猛的发展，如今已成为Apache软件基金会最重要的三大分布式计算系统开源项目之一（即Hadoop、Spark、Storm）。Spark 作为大数据计算平台的后起之秀，在2014年打破了 Hadoop 保持的基准排序（Sort Benchmark）纪录，使用206个节点在23分钟的时间里完成了100TB数据的排序，而Hadoop则是使用2000个节点在72分钟的时间里完成同样数据的排序。也就是说，Spark仅使用了十分之一的计算资源，获得了3倍于Hadoop的速度。新纪录的诞生，使得Spark获得多方追捧，也表明了Spark可以作为一个更加快速、高效的大数据计算平台。Spark具有如下几个主要特点：运行速度快：Spark使用先进的有向无环图（Directed Acyclic Graph,DAG）执行引擎，以支持循环数据流与内存计算，基于内存的执行速度可比HadoopMapReduce快上百倍，基于磁盘的执行速度也能快十倍；容易使用：Spark支持使用Scala、Java、Python和R语言进行编程，简洁的API设计有助于用户轻松构建并行程序，并且可以通过Spark Shell进行交互式编程；通用性：Spark提供了完整而强大的技



# 2. 优秀的参考资料
自己的OneNote笔记 

OneDriver
图解Spark
   
1. https://aiyanbo.gitbooks.io/spark-programming-guide-zh-cn/content/programming-guide/rdds/rdd-persistences.html
2. https://intellipaat.com/blog/tutorial/spark-tutorial/spark-architecture/
3. https://github.com/apache/spark


