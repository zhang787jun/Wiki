---
title: "[组件]kubectl--Kubernetes可执行命令终端"
layout: page
date: 2099-06-02 00:00
---
[TOC]
# 概述

kubectl 只是个go编写的可执行程序，只要为kubectl配置合适的kubeconfig，就可以在集群中的任意节点使用 。kubectl的权限为admin，具有访问kubernetes所有api的权限。