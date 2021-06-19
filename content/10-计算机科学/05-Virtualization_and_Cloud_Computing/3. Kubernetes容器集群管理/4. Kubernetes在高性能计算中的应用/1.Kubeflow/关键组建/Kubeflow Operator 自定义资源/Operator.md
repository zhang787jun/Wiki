---
title: "Kubeflow- Operator"
layout: page
date: 2099-06-02 00:00
---

[TOC]

在Kubernetes 中，所有对象都可以看作资源，同时Kubernetes 也定义了一些默认的基础资源，但这些基础资源即使经过了内置Controller 扩展，其表达能力也是有限的。在Kubernetes 1.7 中增加了对自定义资源（CRD）的二次开发能力，从而扩展了Kubernetes API。通过CRD 我们可以在Kubernetes API 中增加新资源类型，而不需要修改Kubernetes源码来创建自定义的API Server，该功能大大提高了Kubernetes 的扩展能力。根据CRD的这个特性，用户可以自定义资源类型，并且对其提供支持。Kubernetes 会将CRD 视为资源的一种，API Server 中的各种检查对CRD 也是起作用的，因此CRD 的应用非常广泛。与CRD 相关的生命周期是由用户代码管理的，与此同时，Kubernetes 的一些公共特性（如kubectl 输出、Namespace、权限管理等）都是可以被复用的。


以Kubeflow 的TF Operator 为代表的Operator 就是利用了CRD 这个特性，对TensorFlow、Prometheus、etcd等不同的系统或框架提供了支持。
