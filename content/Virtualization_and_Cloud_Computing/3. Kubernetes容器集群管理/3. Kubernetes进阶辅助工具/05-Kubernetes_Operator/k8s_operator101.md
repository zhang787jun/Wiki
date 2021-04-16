---
title: "Kubernetes Operator 101"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 什么是 Kubernetes Operator
operator 算子
![](https://pic4.zhimg.com/v2-455883d59723ffcc9b05b9a4d4d0503c_1440w.jpg?source=172ae18b)
**解释1** 

Kubernetes Operators是在Kubernetes集群上构建和驱动每个应用程序的高级原生方法。通过与Kubernetes API的密切合作，它提供了一种一致的方法来自动处理所有应用程序操作流程，而无需任何人工响应。换句话说，Operator是**打包**，**运行**和**管理**Kubernetes**应用程序**的一种方式。

**解释2** 

operator:operator 是**描述**、**部署**和**管理** kubernetes **应用**的一套机制，从实现上来说，可以将其理解为 CRD 配合可选的 webhook 与 controller 来实现用户业务逻辑
```shell
Operator = CRD + Webhook + Controller
```


**名词解释**
1. CRD
   - `CRD (Custom Resource Definition)`: 允许用户自**定义** Kubernetes 资源，是一个类型；描述
2. CR
    - `CR (Custom Resourse)`: CRD 的一个具体实例

3. webhook
   - `webhook`: 它本质上是一种 HTTP 回调，会注册到 apiserver 上。在 apiserver 特定事件发生时，会查询已注册的 webhook，并把相应的消息转发过去。
   - 按照处理类型的不同，一般可以将其分为两类：
     - 1. 可能会修改传入对象，称为 mutating webhook；
     - 2. 会只读传入对象，称为 validating webhook。

工作队列: controller 的核心组件。它会监控集群内的资源变化，并把相关的对象，包括它的动作与 key，例如 Pod 的一个 Create 动作，作为一个事件存储于该队列中；
controller :它会循环地处理上述工作队列，按照各自的逻辑把集群状态向预期状态推动。不同的 controller 处理的类型不同，比如 replicaset controller 关注的是副本数，会处理一些 Pod 相关的事件；

# 参考资料

https://zhuanlan.zhihu.com/p/246550722