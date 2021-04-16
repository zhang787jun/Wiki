---
title: "Spark 安装与部署"
layout: page
date: 2099-06-02 00:00
---


[TOC]
# 1. 常规部署

## 1.1. 本地部署
##  1.2. Spark On Yarn 


###  1.2.1. 概念

Spark on Yarn的两种运行模式：cluster和client;
一句话概述两种的区别就是Spark driver到底运行再什么地方
In cluster mode：Driver运行在NodeManage的AM(Application Master)中，它负责向YARN申请资源，并监督作业的运行状况。当用户提交了作业之后，就可以关掉Client，作业会继续在YARN上运行。
In client mode:Driver运行在Client上，通过ApplicationMaster向RM获取资源。本地Driver负责与所有的executor container进行交互
#### 1.2.1.1. Mesos



### 1.2.2. 基于docker



#### 1.2.2.1. 单击版

参考：https://hub.docker.com/r/sequenceiq/spark/
```shell
docker pull sequenceiq/spark:1.6.0
```


## 1.3. 搭建spark集群

##### 1.3.0.0.1. 设置系统路由转发功能
```shell
修改配置文件 
vim /etc/sysctl.conf
>>>
#新增一条：
net.ipv4.ip_forward=1 
# 0 时表示禁止进行IP转发
# 1 IP转发功能已经打开

#重启网络：
systemctl restart network
#验证配置：
sysctl net.ipv4.ip_forward
```
##### 1.3.0.0.2. 创建一个网络

为本地群集创建一个网络
创建网络非常简单，可以通过运行以下命令来完成：
桥接网络类似于默认bridge网络
```shell
docker network create spark_network
```
###### 1.3.0.0.2.1. 启动 spark-master
```shell
docker run --rm -it --name spark-master --hostname spark-master \
    -p 7077:7077 -p 8080:8080 --network spark_network \
    <spark-image-name> /bin/sh
```

###### 1.3.0.0.2.2. 启动 spark-worker
```shell
docker run --rm -it --name spark-worker1 --hostname spark-worker1 \
    --network spark_network \
    <spark-image-name> /bin/sh
# 输入
/spark/bin/spark-class org.apache.spark.deploy.worker.Worker \
    --webui-port 8080 spark://spark-master:7077
```


# 2. Spark on k8s 


## 2.1. 通过 Helm 部署 Spark on k8s  

下面我们将利用 Helm，来部署 Spark 以用于大数据处理。

输入如下命令。

```shell
helm install stable/spark --namespace spark-on-k8s --generate-name

# 得到如下的结果。
>>>
NAME:   myspark
LAST DEPLOYED: Mon Nov 20 19:24:22 2017
NAMESPACE: default
STATUS: DEPLOYED
...
```

利用如下命令查看 Spark 的 release 和 service。

```shell
helm list
kubectl get svc
```
利用如下命令查看 Spark 相关的 Pod，并等待其状态变为 Running。因为 Spark 的相关镜像体积较大，所以拉取镜像需要一定的时间。

```shell
kubectl get pod
```
利用如下命令获得 Spark Web UI 的访问地址。

```shell
echo http://$(kubectl get svc myspark-webui -o jsonpath='{.status.loadBalancer.ingress[0].ip}'):8080
```
通过上面的 URL，可以在浏览器上看到 Spark 的 Web UI，上面显示 worker 实例当前为 3 个。

接下来，我们将利用如下命令，使用 Helm 对 Spark 应用做升级，将 worker 实例数量从 3 个变更为 4 个。请注意参数名称是大小写敏感的。

```shell
helm upgrade myspark --set "Worker.Replicas=4" stable/spark
得到如下结果。

Release "myspark" has been upgraded. Happy Helming!
LAST DEPLOYED: Mon Nov 20 19:27:29 2017
NAMESPACE: default
STATUS: DEPLOYED
```
...
利用如下命令查看 Spark 新增的 Pod，并等待其状态变为 Running。

```shell
kubectl get pod
```
在浏览器上刷新 Spark 的 Web UI，可以看到此时 worker 数量已经变为 4 个。

如需彻底删除 Spark 应用，可输入如下命令。

```shell 
helm delete --purge myspark
```


# spark on google colab

```shell
如何在调试代码

最近由于部门有个项目涉及到ETL，就想学一下spark，本来没打算处理环境安装的问题，就直接上了databricks上面的免费notebook环境，并且照着那上面的教程把spark get started走了一遍，后面想继续学习的时候越来越感觉到databricks的notebook不够友好，比jupyter Notebook难操作。遂想到colab的notebook不错，便萌生想法在colab上运行spark代码，但是colab不像databricks的notebook预装了spark相关库，需要自己安装。在搜索了一通之后找了个方案调试了很久才调通，先把调通的notebook上预装环境的代码贴下来，目前可以直接使用，后续可能需要更改下面某些源程序的版本号。

先放代码：

!apt install openjdk-8-jdk-headless
!wget -q https://www-us.apache.org/dist/spark/spark-2.4.3/spark-2.4.3-bin-hadoop2.7.tgz
!tar xf spark-2.4.3-bin-hadoop2.7.tgz
  
!pip install -q findspark
import os
os.environ["JAVA_HOME"] = "/usr/lib/jvm/java-8-openjdk-amd64"
os.environ["SPARK_HOME"] = "/content/spark-2.4.3-bin-hadoop2.7"
!update-alternatives --config java
#select openjdk1.8  enter

import findspark
findspark.init()
from pyspark.sql import SparkSession
spark = SparkSession.builder.master("local[*]").getOrCreate()

```