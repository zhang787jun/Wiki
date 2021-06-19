---
title: "Kubernetes Operator 101"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 什么是 Kubernetes Operator
注意：operator 不应该翻译成算子

> **build** **run** **manage** app
> 全生命周期
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
   - `CR (Custom Resourse)`: CRD 的一个具体实例

2. webhook
   - `webhook`: 它本质上是一种 HTTP 回调，会注册到 apiserver 上。在 apiserver 特定事件发生时，会查询已注册的 webhook，并把相应的消息转发过去。按照处理类型的不同，一般可以将其分为两类：
     - 1. 可能会修改传入对象，称为 mutating webhook；
     - 2. 会只读传入对象，称为 validating webhook。
3. `controller` :它会循环地处理上述工作队列，按照各自的逻辑把集群状态向预期状态推动。不同的 controller 处理的类型不同，比如 replicaset controller 关注的是副本数，会处理一些 Pod 相关的事件；

   1. `工作队列`: controller 的核心组件。它会监控集群内的资源变化，并把相关的对象，包括它的动作与 key，例如 Pod 的一个 Create 动作，作为一个事件存储于该队列中；


# 2. 为什么要 Operator


1. helm没法管理资源的完整生命期，它就是推送YAML就拍拍屁股走人了；
2. 只有CRD才能持续的监听K8S资源对象的变化事件，进行全生命期的监控响应，高可靠的完成部署交付。

operator是开发CRD的一个脚手架项目，目的是帮我们实现CRD

比如我们想给研发提供一键创建mysql的服务，我们就可以实现一个CRD，它可以帮我们创建stateful的mysql实例，挂载PVC持久卷，并且发一封邮件通知我们mysql POD的启停事件，这就很强大了嘛。
我们知道CRD要做的就是监听相应类型的K8S资源变化，并做出响应动作。实现这一块的K8S相关代码和概念比较庞杂吧，所以operator对相关的开发模型进行了抽象封装，提供脚手架生成代码，这样我们的精神负担就小多了。


# 3. 参考资料

https://zhuanlan.zhihu.com/p/246550722