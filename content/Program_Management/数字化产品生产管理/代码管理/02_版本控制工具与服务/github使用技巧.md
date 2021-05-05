---
title: "[代码仓储服务]Github 使用笔记"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 连接仓库

仓库地址通过`URL的方式`确定。连接仓库的方式主要有：
1. HTTPS
2. SSH

## 1.1. SSH

SSH这是最原始的方式，如果使用`git bash`只要按照官方文档一步一步配置就好了。
小心坑：SSH有可能需要配置代理，否则无法解析服务器域名。错误如下：

在 `C:\Users\xxx\.ssh\` 路径下创建 config 文件，内容如下：
```shell
# github
Host github.com
    HostName github.com
    PreferredAuthentications publickey
    IdentityFile  C:\Users\xxx\.ssh\github_id-rsa
```

```
>>>
ssh: Could not resolve hostname github.com: no address associated with name
```
解决办法：给SSH以及git 客户端配置代理。



## 1.2. HTTPS
HTTPS 这也是比较方便的方式，
### 1.2.1. 密码机制
但是每一次都需要输入用户名和密码。
小心坑：本机的SSL证书不是正规机构颁发的，验证失败。错误如下：
```shell
>>>
fatal: unable to access 'https://github.com/owner/repo.git/': SSL certificate problem: unable to get local issuer certificate
#解决办法：将Git的SSL验证关闭，命令如下。
git config --global http.sslVerify false
```
### 1.2.2. Access Token
Access Token，我个人认为最为便捷的方式之一，不失安全性。
https://help.github.com/articles/creating-an-access-token-for-command-line-use/

使用步骤：
1. 从Github 主页 Settings页面生成唯一的Token
2. 手动拼接出远程仓库的地址，比如：`https://$GH_TOKEN@github.com/owner/repo.git`
3. 从以上地址克隆或使用git remote add 的方式关联本地仓库，之后都不需要输入用户名和密码信息。


# 2. 设置代理 

```shell
# 使用代理
git config --global https.proxy http://127.0.0.1:1080
git config --global http.proxy http://127.0.0.1:1080
# 禁用代理
git config --global  --unset http.proxy
git config --global  --unset https.proxy
```



# 3. GitHub Actions
GitHub Actions 是 GitHub 推出的一款 CI/CD 工具。

我们可以在每个 job 的 step 中使用 Docker 执行构建步骤。
```yml

on: push
# on: [push, pull_request] 表示：当Github 收到push代码

name: CI

#Job是一系列操作
jobs:
  my-job:
    name: Build
    # job 命名编译
    runs-on: ubuntu-latest 
    # runs-on定义运行工作流的机器的操作系统 最常见的(ubuntu-latest,macos-latest,windows-latest)
    steps:
      - uses: actions/checkout@master
        with:
          fetch-depth: 2
      - name: run docker container
        uses: docker://golang:alpine
        with:
          args: go version
```
## 3.1. 使用GitHub Actions自动构建镜像并推送到阿里云容器镜像服务

```yml
name: Docker Image CI # Actions名称

on: [push] # 执行时机

jobs:

  build: # 一个名叫build的任务（名字可以随便起）
    runs-on: ubuntu-latest # 基于最新版Ubuntu系统执行下列任务
    steps:
    - uses: actions/checkout@v1 # 将仓库内容拷贝到Ubuntu系统的虚拟环境
    - name: Build the Docker image # 步骤名字
      run: |
        docker login --username=${{ secrets.DOCKER_USN }} registry.ap-northeast-1.aliyuncs.com --password=${{ secrets.DOCKER_PWD }} # 登录docker，并使用Secret里配置的参数
        docker build -t xingwen:latest . #执行构建
        docker tag xingwen registry.ap-northeast-1.aliyuncs.com/example/xingwen
        docker push registry.ap-northeast-1.aliyuncs.com/example/xingwen:latest # 推送
```