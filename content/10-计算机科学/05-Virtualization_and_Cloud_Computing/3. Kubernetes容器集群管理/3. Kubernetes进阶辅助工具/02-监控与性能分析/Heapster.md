---
title: "Heapster--容器集群监控和性能分析工具"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 集成 Heapster
Heapster是容器集群监控和性能分析工具，天然的支持Kubernetes和CoreOS。

Heapster支持多种储存方式，本示例中使用influxdb，直接执行下列命令即可：
```shell
kubectl create -f http://mirror.faasx.com/kubernetes/heapster/deploy/kube-config/influxdb/influxdb.yaml
kubectl create -f http://mirror.faasx.com/kubernetes/heapster/deploy/kube-config/influxdb/grafana.yaml
kubectl create -f http://mirror.faasx.com/kubernetes/heapster/deploy/kube-config/influxdb/heapster.yaml
kubectl create -f http://mirror.faasx.com/kubernetes/heapster/deploy/kube-config/rbac/heapster-rbac.yaml
```

上面命令中用到的yaml是从 https://github.com/kubernetes/heapster/tree/master/deploy/kube-config/influxdb 复制的，并将k8s.gcr.io修改为国内镜像。

然后，查看一下Pod的状态：
```shell

kubectl get pods --namespace=kube-system
>>>
NAME                                      READY     STATUS    RESTARTS   AGE
...
heapster-5869b599bd-kxltn                 1/1       Running   0          5m
monitoring-grafana-679f6b46cb-xxsr4       1/1       Running   0          5m
monitoring-influxdb-6f875dc468-7s4xz      1/1       Running   0          6m
```
等待状态变成Running，刷新一下浏览器，最新的效果如下：

