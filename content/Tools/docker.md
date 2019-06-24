---
title: "Docker实践"
layout: page
date: 2099-06-02 00:00f
---
[TOC]
# Docker实践

参考资料 
1. [Docker — 从入门到实践](https://yeasy.gitbooks.io/docker_practice/content/
)

## 1. Docker 准备
Docker CE 镜像源站
使用官方安装脚本自动安装 （仅适用于公网环境）
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

### For windows 
1. 安装／升级Docker客户端
对于Windows 10以下的用户，推荐使用Docker Toolbox
Windows安装文件：http://mirrors.aliyun.com/docker-toolbox/windows/docker-toolbox/
对于Windows 10以上的用户 推荐使用Docker for Windows
Windows安装文件：http://mirrors.aliyun.com/docker-toolbox/windows/docker-for-windows/
2. 配置镜像加速器
针对安装了Docker Toolbox的用户，您可以参考以下配置步骤：
创建一台安装有Docker环境的Linux虚拟机，指定机器名称为default，同时配置Docker加速器地址。
```shell
docker-machine create --engine-registry-mirror=http://hub-mirror.c.163.com -d virtualbox default
```
查看机器的环境配置，并配置到本地，并通过Docker客户端访问Docker服务。
```shell
docker-machine env defaulteval "$(docker-machine env default)"docker info
```
针对安装了Docker for Windows的用户，您可以参考以下配置步骤：
在系统右下角托盘图标内右键菜单选择 Settings，打开配置窗口后左侧导航菜单选择 Docker Daemon。编辑窗口内的JSON串，填写下方加速器地址：
```shelkl
{
  "registry-mirrors": ["http://hub-mirror.c.163.com"]
}
```
编辑完成后点击 Apply 保存按钮，等待Docker重启并应用配置的镜像加速器。
注意
Docker for Windows 和 Docker Toolbox互不兼容，如果同时安装两者的话，需要使用hyperv的参数启动。
```shell 
docker-machine create --engine-registry-mirror=http://hub-mirror.c.163.com -d hyperv default
```
Docker for Windows 有两种运行模式，一种运行Windows相关容器，一种运行传统的Linux容器。同一时间只能选择一种模式运行。


docker-machine ssh 

sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["http://hub-mirror.c.163.com"]
}
EOF
3.  相关文档
Docker 命令参考文档
Dockerfile 镜像构建参考文档

来自 <https://cr.console.aliyun.com/cn-hongkong/instances/mirrors> 

###  For Ubuntu
1. 安装／升级Docker客户端
推荐安装1.10.0以上版本的Docker客户端，参考文档 docker-ce
2. 配置镜像加速器
针对Docker客户端版本大于 1.10.0 的用户
您可以通过修改daemon配置文件/etc/docker/daemon.json来使用加速器
sudo mkdir -p /etc/docker


## 2. Docker 概念

**Boot2Docker** 是一个专为Docker而设计的轻量级Linux发型包，解决Windows或者OS X用户不能安装Docker的问题。 Boot2Docker完全运行于内存中，24M大小，启动仅5-6秒。