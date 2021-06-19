---
title: "[网络组件]Istio--微服务管理框架service mesh"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# Istio 是什么
https://istio.io/docs/concepts/what-is-istio/

官方对 Istio 的介绍浓缩成了一句话：
An open **platform** to connect, secure, control and observe services.

连接、安全加固、控制和观察 **服务**的开放**平台**。



中间的四个动词就是 Istio 的主要功能，官方也各有一句话的说明。这里再阐释一下：
连接（Connect）：智能控制服务之间的调用流量，能够实现灰度升级、AB 测试和红黑部署等功能
安全加固（Secure）：自动为服务之间的调用提供认证、授权和加密。
控制（Control）：应用用户定义的 policy，保证资源在消费者中公平分配。
观察（Observe）：查看服务运行期间的各种数据，比如日志、监控和 tracing，了解服务的运行情况。
# 安装
```shell
curl -L https://git.io/getLatestIstio | sh -
export PATH=$PWD/bin:$PATH
kubectl apply -f install/kubernetes/istio.yaml
```





