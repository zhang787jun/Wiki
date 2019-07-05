---
title: "Mysql 杂谈"
layout: page
date: 2099-06-02 00:00
---
[TOC]
# Mysql 杂谈

## Mysql的通信

Mysql有两种连接方式：
（1）TCP/IP
（2）socket
对mysql.sock来说，其作用是程序与mysqlserver处于同一台机器，发起本地连接时可用。
例如你无须定义连接host的具体IP得，只要为空或localhost就可以。
在此种情况下，即使你改变mysql的外部port也是一样可能正常连接。
因为你在my.ini中或my.cnf中改变端口后，mysql.sock是随每一次 mysql server启动生成的。已经根据你在更改完my.cnf后重启mysql时重新生成了一次，信息已跟着变更。

## CentOS 下的安装

查资料发现是CentOS 7 版本将MySQL数据库软件从默认的程序列表中移除，用mariadb代替了。
有两种解决办法：
1. 方法一：安装mariadb
MariaDB数据库管理系统是MySQL的一个分支，主要由开源社区在维护，采用GPL授权许可。开发这个分支的原因之一是：甲骨文公司收购了MySQL后，有将MySQL闭源的潜在风险，因此社区采用分支的方式来避开这个风险。MariaDB的目的是完全兼容MySQL，包括API和命令行，使之能轻松成为MySQL的代替品。
安装mariadb，大小59 M。
```shell
yum install mariadb-server mariadb
```

2. 官网下载
```shell
wget http://dev.mysql.com/get/mysql-community-release-el7-5.noarch.rpm
rpm -ivh mysql-community-release-el7-5.noarch.rpm
yum install mysql-community-server
```