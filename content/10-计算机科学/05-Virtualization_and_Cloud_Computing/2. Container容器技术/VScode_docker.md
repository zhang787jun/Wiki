---
title: "利用VScode插件进行Docker全生命周期开发"
layout: page
date: 2099-06-02 00:00
---
[TOC]
VScode 的 The `Remote - Containers` 插件支持 2种 主要的操作模式：
1. 使用`容器`作为你的全周期开发环境
2. 将您的程序嵌入到一个运行的容器中


# 使用`容器`作为全周期开发环境

## 在现有文件夹中打开容器
**步骤**
1. 打开 VScode 选择remote-contain 
2. 设置起点
    可以从以下几种方式：
       1. 下拉列表设置默认的 `Dockerfile`构建镜像
       2. 文件夹中的存在 `Dockerfile`文件，则通过Dockerfile 构建镜像
3. VSCode 会在你的项目文件夹中`.devcontainer/devcontainer.json` 添加容器配置文件。
4. VS Code的窗口会从新加载，并开始构建开发容器（首次配置的时候）。
5. 完成构建，VScode会自动连接容器。


## 集成云服务厂家

### 阿里云私有镜像仓库 

推荐使用 Alibaba Cloud Toolkit 进行操作。Cloud Toolkit 与主流 IDE 及阿里云容器镜像服务无缝集成，可以简化操作。 这里以在 IntelliJ IDEA 中使用 Alibaba Cloud Toolkit 为例。只需配置一次，之后都可一键推送

在本地 IDE 中安装 Alibaba Cloud Toolkit 并进行阿里云账户配置。参见：
在 IntelliJ IDEA 中安装和配置 Cloud Toolkit

设置用于打包本地镜像的 Docker 环境。

在 IntelliJ IDEA 工具栏单击 Tools > Alibaba Cloud > Preferences… 。

在 Settings 对话框的左侧导航栏中单击 Docker。



