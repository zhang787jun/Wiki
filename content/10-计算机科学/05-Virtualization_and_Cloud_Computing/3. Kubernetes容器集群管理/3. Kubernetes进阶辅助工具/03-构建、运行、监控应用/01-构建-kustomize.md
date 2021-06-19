---
title: "kustomize--Kubernetes配置文件管理"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 概述
kustomize 是Kubernetes 原生的**配置文件**管理组件
```
kustomize is Kubernetes native configuration management
```

kustomize[Github链接](https://github.com/kubernetes-sigs/kustomize)在代码仓库的描述为：
**Customization of kubernetes YAML configurations**

kustomize 明显就是解决 kubernetes yaml 应用管理的问题的。

kustomize项目嵌入到了 `kubectl`命令中去了，通过使用`kubectl apply -k `命令使用。

# 安装

安装文档参考：https://github.com/kubernetes-sigs/kustomize/blob/master/docs/zh/INSTALL.md

```shell
# 推荐
curl -s "https://raw.githubusercontent.com/\
kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
```


# 参考资料

[^1]:[官网](https://kustomize.io/)







# kustomize是什么？
先来看看官网的描述：

Kubernetes native configuration management

Kustomize introduces a template-free way to customize application configuration that simplifies the use of off-the-shelf applications. Now, built into kubectl as apply -k.
根据官网的描述：kustomize 是 kubernetes 原生的配置管理，以无模板方式来定制应用的配置。kustomize 使用 k8s 原生概念帮助创建并复用资源配置(YAML)，允许用户以一个应用描述文件 （YAML 文件）为基础（Base YAML），然后通过 Overlay 的方式生成最终部署应用所需的描述文件。


kustomize 解决了什么痛点？
一般应用都会存在多套部署环境：开发环境、测试环境、生产环境，多套环境意味着存在多套 K8S 应用资源 YAML。而这么多套 YAML 之间只存在微小配置差异，比如镜像版本不同、Label 不同等，而这些不同环境下的YAML 经常会因为人为疏忽导致配置错误。再者，多套环境的 YAML 维护通常是通过把一个环境下的 YAML 拷贝出来然后对差异的地方进行修改。一些类似 Helm 等应用管理工具需要额外学习DSL 语法。总结以上，在 k8s 环境下存在多套环境的应用，经常遇到以下几个问题：

如何管理不同环境或不同团队的应用的 Kubernetes YAML 资源
如何以某种方式管理不同环境的微小差异，使得资源配置可以复用，减少 copy and change 的工作量
如何简化维护应用的流程，不需要额外学习模板语法
Kustomize 通过以下几种方式解决了上述问题：

kustomize 通过 Base & Overlays 方式(下文会说明)方式维护不同环境的应用配置
kustomize 使用 patch 方式复用 Base 配置，并在 Overlay 描述与 Base 应用配置的差异部分来实现资源复用
kustomize 管理的都是 Kubernetes 原生 YAML 文件，不需要学习额外的 DSL 语法
kustomize 术语
在 kustomize 项目的文档中，经常会出现一些专业术语，这里总结一下常见的术语，方便后面讲解

kustomization
术语 kustomization 指的是 kustomization.yaml 文件，或者指的是包含 kustomization.yaml 文件的目录以及它里面引用的所有相关文件路径

base
base 指的是一个 kustomization , 任何的 kustomization 包括 overlay (后面提到)，都可以作为另一个 kustomization 的 base (简单理解为基础目录)。base 中描述了共享的内容，如资源和常见的资源配置

overlay
overlay 是一个 kustomization, 它修改(并因此依赖于)另外一个 kustomization. overlay 中的 kustomization指的是一些其它的 kustomization, 称为其 base. 没有 base, overlay 无法使用，并且一个 overlay 可以用作 另一个 overlay 的 base(基础)。简而言之，overlay 声明了与 base 之间的差异。通过 overlay 来维护基于 base 的不同 variants(变体)，例如开发、QA 和生产环境的不同 variants

variant
variant 是在集群中将 overlay 应用于 base 的结果。例如开发和生产环境都修改了一些共同 base 以创建不同的 variant。这些 variant 使用相同的总体资源，并与简单的方式变化，例如 deployment 的副本数、ConfigMap使用的数据源等。简而言之，variant 是含有同一组 base 的不同 kustomization

resource
在 kustomize 的上下文中，resource 是描述 k8s API 对象的 YAML 或 JSON 文件的相对路径。即是指向一个声明了 kubernetes API 对象的 YAML 文件

patch
修改文件的一般说明。文件路径，指向一个声明了 kubernetes API patch 的 YAML 文件

kustomize 官方示例
现在通过官方的示例来演示一下 kustomize 应该怎么用，以及相应的一些规范。如果你没有使用 Kubernetes v1.14 版本，参考 官方安装教程 进行安装 kustomize，或者直接下载 v1.14 版本kubectl 二进制，通过kubectl -k 命令使用 kustomize

前提
三个不同的环境(开发、演示、生产)
一个 deployments 资源和 service 资源
环境之间有不同的 replicas 或者 ConfigMap
最终文件结构