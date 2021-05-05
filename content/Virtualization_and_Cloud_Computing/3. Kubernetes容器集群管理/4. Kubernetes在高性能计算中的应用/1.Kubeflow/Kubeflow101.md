---
title: "Kubeflow--101"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 概述

Kubeflow 是 Google 发布的用于在 Kubernetes 集群中部署和管理分布式机器学习工作流的框架，其致力于使机器学习（ML）工作流在Kubernetes上的部署简单，可移植且可扩展。

tensorflow 任务的框架。主要功能包括
1. 用于管理 Jupyter 的 JupyterHub
2. 用于管理训练任务的 Controller
3. 用于模型服务的 Serving 容器

**Kubeflow核心组件介绍**：
1. JupyterHub 服务： 多租户NoteBook服务
2. Tensorflow PyTorch MPI MXnet Chainer 当前主要支持的机器学习引擎
3. Seldon 提供在Kubernetes上对机器学习模型的部署
4. TF-Serving 提供对Tensorflow模型的在线部署，支持版本控制及无需停止线上服务，切换模型等功能
5. Argo 基于Kubernetes的工作流引擎
6. Ambassador 对外提供统一服务的网关(API Gateway)
7. Istio 提供微服务的管理，Telemetry收集
8. Ksonnet Kubeflow使用ksonnet来向kubernetes集群部署需要的k8s资源
9. Hyperparameter Tuning 在Kubeflow 进行机器学习调参
10. Pipelines ： Kubeflow的机器学习管道


`Kubeflow` 使用 `ksonnet` 模板作为打包、发布不同组件

**Kubeflow利用Kubernetes的优势**:
1. 原生的资源隔离
2. 集群化自动化管理
3. 计算资源(CPU/GPU)自动调度
4. 对多种分布式存储的支持
5. 集成较为成熟的监控，告警
6. 将机器学习各个阶段涉及的组件已微服务的方式进行组合并已容器化的方式进行部署，提供整个流程各个系统的高可用及方便的进行扩展。


我们的目标是使缩放机器学习（ML）模型和将其部署到生产中尽可能简单，让Kubernetes做它擅长的事情：
1. 在不同的基础设施上轻松、可重复、可移植的部署（例如，在笔记本电脑上进行实验，然后移动到本地群集或云端）
2. 部署和管理松散耦合的微服务
3. 按需缩放

因为ML实践者使用不同的工具集，其中一个关键目标是根据用户需求（在合理的范围内）定制堆栈，并让系统处理“无聊的事情”。虽然我们从一系列技术开始，但我们正在处理许多不同的项目，以包括其他工具。
最后，我们希望有一组简单的清单，让您在Kubernetes已经运行的任何地方都可以使用一个易于使用的ML堆栈，并且可以根据它部署到的集群进行自我配置。

## 1.1. 架构

List of Kubeflow components available
1. Ambassador
2. Argo UI 界面 http://testing-argo.kubeflow.org/workflows
3. Profiles




# 2. 参考资料 

