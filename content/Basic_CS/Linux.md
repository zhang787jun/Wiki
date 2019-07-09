---
title: "Linux"
layout: page
date: 2099-06-02 00:00
---
[TOC]
# Linux 技能
Linux工具快速教程
https://linuxtools-rst.readthedocs.io/zh_CN/latest/index.html

| 命令 |                           说明 |
| ---: | -----------------------------: |
| grep | 用于查找文件里符合条件的字符串 |

## Ubuntu

### 安装 

从科大镜像http://mirrors.ustc.edu.cn/ 下载 Ubuntu-16.04-x64


### root用户管理
ubuntu系统 禁用了root用户，在安装过程中新建的用户并没有全部权限
```shell
#1.3.1 开启root账户 并以root账户登入
sudo passwd root 
#输入root账户密码
#再次输入root账户密码确认

#添加运行以图形界面登入命令
sudo vim /usr/share/lightdm/lightdm.conf.d/50-ubuntu.conf
>
greeter-show-manual-login=true
```
### 镜像加速

``` shell 
echo "# 默认注释了源码镜像以提高 yes|apt update 速度，如有需要可自行取消注释
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-updates main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-backports main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-backports main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-security main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-security main restricted universe multiverse
# 预发布软件源，不建议启用
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-proposed main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-proposed main restricted universe multiverse"> /etc/apt/sources.list

yes| sudo apt-get update

```

### 网络

```shell 
# 1. 配置静态ip：
sudo vi /etc/network/interfaces 
>
auto eth0                  #设置自动启动eth0接口
iface eth0 inet static     #配置静态IP
address 172.28.44.120      #IP地址
netmask 255.255.255.0：      #子网掩码
gateway 172.28.44.254        #默认网关
#2 修改DNS 配置nameserver
/etc/resolvconf/resolv.conf.d/base 
>
nameserver 172.25.9.10
nameserver 172.26.9.10
# 3 重启网络，使配置生效
sudo /etc/init.d/networking restart

dns-nameserver 114.114.114.114 8.8.8.8 192.168.0.1 #定义DNS服务器的IP地址
dns-search www.ringkee.com ringkee.com #定义域名的搜索列表

# 1.2 修改host文件 
sudo vim /etc/hosts
> 
#写入主机名称与ip 之间的关系
192.168.0.102  master
192.168.0.179  slaver_1
192.168.0.141  slaver_2
```

## CentOS
