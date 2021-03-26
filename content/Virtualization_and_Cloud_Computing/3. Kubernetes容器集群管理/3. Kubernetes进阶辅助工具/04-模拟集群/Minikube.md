---
title: "Minikube 实践"
layout: page
date: 2099-06-02 00:00
---
[TOC]

![](../../attach/images/2019-12-11-15-06-38.png)

# 安装 

## 前提

硬件设备支持虚拟化
```shell
grep -E --color 'vmx|svm' /proc/cpuinfo

```
## 安装

1. KVM 安装
https://help.ubuntu.com/community/KVM/Installation
[^2]


建议国内使用阿里镜像 
```shell 

minikube start --registry-mirror=https://registry.docker-cn.com --vm-driver hyperv --hyperv-virtual-switch=new

curl -Lo minikube http://kubernetes.oss-cn-hangzhou.aliyuncs.com/minikube/releases/v0.24.1/minikube-linux-amd64 && chmod +x minikube && sudo mv minikube /usr/local/bin/


minikube start --registry-mirror=https://registry.docker-cn.com
```

# 参考资料 
[^1]: Install Minikube
  https://kubernetes.io/docs/tasks/tools/install-minikube/
[^2]： d  https://minikube.sigs.k8s.io/docs/start/linux/