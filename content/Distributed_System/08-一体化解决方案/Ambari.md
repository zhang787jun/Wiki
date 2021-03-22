---
title: "Ambari 套件--Hadoop生态安装套件"
layout: page
date: 2099-06-02 00:00
---
[TOC]
# 1. Ambari 套件

# 2. 安装


##  2.1. 操作系统的搭建
使用Oracle VM VirtuBox 虚拟机搭建Ubuntu-18.04-x64 系统
1.1系统镜像下载
从科大镜像http://mirrors.ustc.edu.cn/ 下载Ubuntu-16.04-x64
1.2 系统安装
以最简单的配置，按步骤安装几款
新建用户 hadoop 密码 hadoop
1.3 用户管理
ubuntu系统 禁用了root用户，在安装过程中新建的用户并没有全部权限
1.3.1 开启root账户 并以root账户登入
sudo passwd root 
输入root账户密码
再次输入root账户密码确认
sudo vim /usr/share/lightdm/lightdm.conf.d/50-ubuntu.conf
添加运行以图形界面登入命令
greeter-show-manual-login=true

二、系统软件配置及更新
```shell
2.0 shell script 文件 （pre_setup.sh）
#!/bin/bash
# -*- coding:utf8 -*-
# Copyright 2018 ZHANG JUN
# Project:Big Data Project 
# Author: Zhang Jun (zjlbzf@gmail.com )

# 1. 镜像设置
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

# 2. 应用安装及环境配置
yes|apt-get update
yes|apt-get install vim
yes|apt-get install openssh-server
sed -i "10a\ PermitRootLogin Yes" /etc/ssh/sshd_config
service sshd restart 
yes|apt-get install ntp
service ntp start
update-rc.d ntp defaults
yes|apt-get install mysql-server
yes|apt-get isntall mysql-client
yes|apt-get install libmysqlclient-dev
sed -i "/tmpdir/ a\ character_set_server=utf8" /etc/mysql/mysql.conf.d/mysqld.cnf
yes|apt-get install default-jre default-jdk
sed -i "$ a\export JAVA_HOME=/usr/lib/jvm/default-java" ~/.bashrc
sources ~/.bashrc
yes|apt-get install libmysql-java
sed -i "$ a\CLASSPATH=$CLASSPAexiTH:/usr/share/java/mysql.jar" ~/.bashrc
sources ~/.bashrc
yes|apt-get install maven
yes|apt-get install gcc
yes|apt-get install build-essential
yes|apt-get install apache2
yes|apt-get install python-pip
ulimit -n 10000 
yes|apt-get install curl
/etc/init.d/apache2 restart

chmod +x  pre_setup.sh
/bin/bash pre_setup.sh
```

2.1 更新atp
sudo apt-get update
2.2 安装Vim 编辑器
sudo apt-get install vim

三、安装ssh 、配置ssh 无密码登入
3.1 安装ssh
sudo apt-get install openssh-server
► 测试：
ssh localhost     #ssh链接本地，链接过程中需要输入系统用户密码
exit                       #ssh链接退出
sudo vim /etc/ssh/sshd_config
确保以下命令存在
PermitRootLogin Yes

云服务器上打开运行密码输入
service sshd restart 
3.2 ssh 无密码登陆配置
cd ~/.ssh/               # 若没有该目录，请先执行一次ssh localhost  （~ 代表用户的主文件夹，即 “/home/用户名” ，本例中为“/home/hadoop”）
ssh-keygen -t rsa # 会有提示，都按回车就可以  （[ssh-keygen] ———生成（gen）基于ssh协议的钥匙(key)；[t] type指定要创建的密钥类型；[rsa]RSA 公钥加密算法 ） 
      #命令执行后在~/.ssh/文件生成了 XXX 和 XXX.pub 两个文件（一般是id_rsa[私钥-锁-给自己的] 和id_rsa.pub[公钥-钥匙-给大家的]）
cat ./id_rsa.pub >> ./authorized_keys # 加入授权

四、安装JAVA 
4.1 java 安装
sudo apt-get install default-jre default-jdk
4.2 环境变量配置
sudo vim ~/.bashrc
在第一行加入：
export JAVA_HOME=/usr/lib/jvm/default-java
保存退出
配置是的环境变量生效 
sudo source ~/.bashrc 
► 测试
echo $JAVA_HOME               # 检验变量值  ，返回环境变量的地址
java -version                 # 返回java版本
$JAVA_HOME/bin/java -version  # 与直接执行java -version一样

五、NTP 配置
NTP服务器【Network Time Protocol(NTP)】是用来使计算机时间同步化的一种协议，保证各集群的时间统一性
5.1 安装
$ sudo apt-get install ntp
$ service ntp start
► 测试 
$ ntp stat
六、 Mysql 数据库的安装及配置
6.1 mysql 安装
sudo apt-get install mysql-server 
sudo apt-get isntall mysql-client
sudo apt-get install libmysqlclient-dev
6.2 MySQL 配置
6.2.1 mysql 的初次登陆
mysql 5.7版本及更新版本的默认账户及密码 为随机生成，在etc/mysql/debian.cnf中查看
sudo vim  etc/mysql/debian.cnf
找到用户名，密码 ，使用此账号登录mysql
mysql -u （用户名） -p
输入密码
进入mysql shell
6.2.2  修改root用户的密码
show databases；
use mysql;
update user set authentication_string=PASSWORD("自定义密码") where user='root';
update user set plugin="mysql_native_password";
flush privileges;  #刷新MySQL的系统权限相关表
quit;
6.2.3  修改完密码，重启mysql
/etc/init.d/mysql restart
6.2.4 再次登录
mysql -u root -p 密码;
► 测试
service mysql start
sudo netstat -tap | grep mysql
service mysql stop
6.2.5 中文乱码问题解决
(1)编辑配置文件。
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
(2)在[mysqld]下添加一行
character_set_server=utf8


(3)重启MySQL服务。
Sudo service mysql restart
(4)登陆MySQL，并查看MySQL目前设置的编码。
show variables like "char%";
6.3 创建ambari数据库，创建ambari用户
登入mysql
create database ambari character set utf8
CREATE USER 'ambari'@'%'IDENTIFIED BY '（自定义密码）'

GRANT ALL PRIVILEGES ON *.* TO 'ambari'@'%';
FLUSH PRIVILEGES;             #刷新MySQL的系统权限相关表

6.4 安装Mysql jdbc 驱动 （java database connector）
6.4.1 安装
sudo apt-get install  libmysql-java
6.4.2  添加环境变量
sudo vim ~/.bashrc
在里面添加一行
    CLASSPATH=$CLASSPAexiTH:/usr/share/java/mysql.jar
source ~/.bashrc
echo $CLASSPATH

七. 安装rpmbuild 
ambari编译时依赖rpmbuild打包成rpm安装包，因而需要rpm套件，很幸运，ubuntu可以安装这一套件：
sudo apt-get install rpm yum


八、Apache Maven 3.3.9或更高版本
Apache Maven是一个软件项目管理和综合工具。基于项目对象模型（POM）的概念ifco，Maven可以从一个中心资料片管理项目构建，报告和文件。
sudo apt-get install maven


## 2.2. 安装g++ (gcc-c++ package)
```shell 
sudo apt-get install gcc
sudo apt-get install build-essential
• 测试
gcc-v
```



https://docs.hortonworks.com/HDPDocuments/Ambari-2.4.1.0/bk_ambari-installation/content/ch_Getting_Ready.html


网络环境配置
