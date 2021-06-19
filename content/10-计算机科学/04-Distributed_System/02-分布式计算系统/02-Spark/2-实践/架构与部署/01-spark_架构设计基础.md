---
title: "01-Spark 架构设计 101"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# 1. 概况
单机版的Spark运行模式主要有：
1. Spark Local
2. Spark 伪分布式

分布式的Spark主要有4种运行模型：
1. Spark on Standalone 
2. Spark on Mesos
3. Spark on Yarn
4. Spark on k8s
   1. Spark on k8s--Standalone
   2. Spark on k8s--Kubernetes Native
   3. Spark on k8s--Spark Operator

# 2. 组成


Spark的架构设计不断迭代，但最核心的还是3大组件：
	1. Drive Program 
	2. Cluster Manager
	3. Executor
	
## 2.1. Drive Program
Drive Program 驱动程序（股东大会，指挥团队领导的机制），Driver 官方解释是 `The process running the main() function of the application and creating the SparkContext`

一般在Client Node /Work Node上，运行Application 的main()函数
1. 负责提交应用，触发集群开始处理作业。
2. 通过生成一个SparkContext 对象访问Spark
3. 一个SparkContext 对象代表一个对集群的连接
4. 初始化SparkContext 对象 需要 （1） 集群url （2）应用名

## 2.2. Cluster Manager 
Cluster Manager 集群管理器（团队领导 ）
1. 一般运行在master node
2. 集群管理器（ClusterManager）给任务分配资源，即将具体任务分配到Worker上，Worker创建Executor来处理任务的运行。
3. Standalone、YARN、Mesos、EC2等都可以作为Spark的集群管理器。
## 2.3. Executor
Executor：执行器（打工仔）
为某个应用Application运行在worker node上的一个进程
