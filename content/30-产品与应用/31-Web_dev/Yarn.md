---
title: "Facebook Yarn 包管理器"
layout: page
date: 2099-06-02 00:00
---
[TOC]
# Yarn--包管理器

Yarn: A new package manager for JavaScript
Facebook 推出了一款名叫 Yarn 的包管理器，声称比现有的 npm 客户端更快，更可靠，更安全。Yarn可以将安装时间从数分钟减少至几秒钟。Yarn还兼容npm注册表，但包安装方法有所区别。其使用了lockfiles和一个决定性安装算法，能够为参与一个项目的所有用户维持相同的节点模块（node_modules）目录结构，有助于减少难以追踪的bug和在多台机器上复制。

## 安装 
```shell 
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn
```

测试安装

```
yarn --version
```

