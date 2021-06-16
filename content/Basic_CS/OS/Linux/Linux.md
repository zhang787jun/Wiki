---
title: "Linux"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. Linux 技能
Linux工具快速教程
https://linuxtools-rst.readthedocs.io/zh_CN/latest/index.html

| 命令 |                           说明 |
| ---: | -----------------------------: |
| grep | 用于查找文件里符合条件的字符串 |


## 查看版本

```shell
cat /proc/version 

```

## 1.1. Ubuntu

### 1.1.1. 安装

从科大镜像http://mirrors.ustc.edu.cn/ 下载 Ubuntu-16.04-x64


### 1.1.2. root用户管理
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
### 1.1.3. 镜像加速

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


```shell
echo "deb http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse"> /etc/apt/sources.list
yes| sudo apt-get update

```
### 1.1.4. 网络

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

## 1.2. CentOS



## 1.3. 软件包管理
### 1.3.1. 软件包的分类
1. 源码包
2. 二进制包


#### 1.3.1.1. 源码包

**优点**
1. 开源，如果有足够能力，可以修改源代码
2. 可以自由选择所需的功能
3. 软件是编译安装，所有更加适合自己的系统，更加稳定也效率更高
4. 卸载方便

**缺点**
1. 安装麻烦，尤其是一些比较大的集合软件
2. 编译过程时间比较长，安装比二进制安装时间长
3. 因为是编译安装，一旦出错会很麻烦
#### 1.3.1.2. 二进制包
**优点**
1. 包管理系统简单，只通过几个命令就可以实现包的安装，升级，查询和卸载
2. 安装速度比源码包要快

**缺点**
1. 经过编译，不能看到源代码了
2. 功能选择不如源码包灵活
3. 依赖性


## 1.4. rpm命令管理
**RPM包命名规则**
```shell
httpd-2.2.15-15.el6.centos.1.i686.rpm
# - httpd		软件包名
# - 2.2.15	软件版本
# - 15		软件发布的次数
# - el6.centos 适合的linux的平台
# - i686		适合的硬件平台
# - rpm		rpm包的扩展名
```
**RPM包的依赖性**

1. 树形依赖：a -> b -> c
2. 环形依赖：a - > b -> c -> a
3. 模块依赖：查询网站：www.rpmfind.net

**安装命令**
包全名与包名
包全名：操作的包是没有按照的软件包时，使用包全名，而且要注意路径
包名：操作已经安装的软件包时，使用包名是搜索/var/lib/rpm 中的数据库
RPM安装
```shell
rpm -ivh <full-pakage-name>
# 选项：
# -i			安装
# -v			显示详细信息
# -h			显示进度
# --nodeps	不检测依赖性
```
**升级和卸载**
RPM包升级
```shell 
rpm -Uvh 包全名
# 选项：
# 	-U	升级
```
**RPM包卸载**
```shell
rpm -e 包名
# 选项：
# -e			卸载
# --nodeps	不检查依赖性
```
**RPM包查询**
```shell
# 查询是否安装
rpm -q 包名

# 查询所有安装的rpm包
rpm -qa


#查询软件包的详细信息
rpm -qi 包名
# 选项：
# 	-i	查询软件信息
# 	-p	查询未安装包信息


# 查询包中文件安装位置
rpm -ql 包名
# 选项：
# 	-l	列表
# 	-p	查询未安装包信息
# q Location
```



**RPM包默认安装位置**
| 地址            | 详细                       |
| --------------- | -------------------------- |
| /etc/           | 配置文件安装目录           |
| /usr/bin/       | 可执行的命令安装目录       |
| /usr/lib/       | 程序所使用的函数库保存位置 |
| /usr/share/doc/ | 基本的软件使用手册保存位置 |
| /usr/share/man/ | 帮助文件保存位置           |


```shell
#查询系统文件属于哪个rpm包
rpm -qf 系统文件名
# 选项：
# 	-f	查询系统文件属于哪个软件包


# 查询软件包的依赖性
rpm -qR 包名
# 选项：
# 	-R	查询软件包的依赖性
# 	-p	查询未安装包的信息

# RPM包校验
rpm -V 已安装的包名
# 选项：
# 	-V	校验指定RPM包的文件
	
# 验证内容中的8个信息的具体内容
# 	s	文件大小是否改变
# 	M	文件的类型或文件权限（rwx）是否被改变
# 	5	文件MD5校验是否改变（可以看成文件内容是否被改变）
# 	D	设备的主从代码是否改变
# 	L	文件路径是否改变
# 	U	文件的属主（所有者）是否改变
# 	G	文件的属组是否改变
# 	T	文件的修改实际是否改变

# 文件类型
# 	c	配置文件
# 	d	普通文件
# 	g	“鬼”文件，就是该文件不应该被这个RPM所包含的
# 	L	授权文件
# 	r	描述文件
```


## 1.5. yum在线安装
yum源文件
```shell
vim /etc/yum.repos.d/CentOS-Base.repo 
```

```shell
[base]		容器说明，一定要放在[]中
name 		容器说明，可以自己随便写
mirrorlist	镜像站点，这个可以注释
baseurl		yum源服务器的地址，可以自己更改自己喜欢的yum源
enabled		此容器是否生效，1代表生效，0代表不生效
gpgcheck	如果是1是指RPM数字保证书生效，如果是0则是不生效
gpgkey		数字保证书的公钥文件保存位置，不用修改
failovermethod=priority
```


常用yum命令 查询
```shell
# 查询所有可用软件包列表
yum list

# 3. 搜索服务器上所有和关键字相关的包

yum search 关键字

# 4. 安装
yum -y install 包名
# 5. 选项：
# 6. install	安装
# 7. -y		自动回答yes
	
# 8. 升级
yum -y update 包名
# 9. 选项：
# 10. update	升级
	
# 11. 卸载
yum -y remove 包名
# 12. 选项：
# 13. remove	卸载

# 14. ------------yum软件组管理命令
# 15. 列出所有可用的软件组列表
yum grouplist

yum grouplist 软件组名
# 16. 安装指定软件组，组名可用由grouplist查询出来

yum groupremove 软件组名
# 2. 卸载指定软件组
```

## 1.6. 源码包安装
### 1.6.1. 源码包和RPM包的区别

1. 安装之前的区别：概念上的区别
2. 安装之后的区别：安装位置的不同
3. 安装位置不同带来的影响
RPM包安装的服务可以使用系统服务管理命令（service）来管理，例如RPM包安装的apache的启动方法

```shell
/etc/rc.d/init.d/httpd start
service httpd start
```
源码包安装位置
安装在指定位置，一般是/usr/local/软件名/


### 1.6.2. 源码包安装过程
1. 安装准备
	安装gcc
	下载源码包
2. 安装注意事项
	源码包保存位置：/usr/local/src
	软件安装位置：/usr/local
	如何确定安装过程报错
		安装过程停止
		并出现error，warning或no提示
3. 源码包安装过程
	下载源码包
	解压下载好的源码包
	进入解压目录
	./configure	软件配置与检查
		定义需要功能的选项
		检测系统环境是否符合安装需求
		把定义好的功能选项和检测系统环境的信息都写入Makefile文件，用于后续编辑
		--prefix=指定安装的位置
4. make编译
	make clean	清除编译好的文件
	make install 编译安装

### 1.6.3. 卸载
卸载：直接删除安装目录即可

### 1.6.4. 脚本安装
所谓的一键安装包，实际上还是安装的源码包与RPM包，知识把安装过程写成了脚本，便于初学者安装
优点：
	简单，快捷，方便
缺点：
	不能定义安装软件的版本
	不能定义所需要的软件功能
	源码包的优势丧失

# 2. 常用命令
关闭SElinux和防火墙
```shell 
vim /etc/selinux/config  把enforcing改为disabled

```
关闭SElinux和防火墙
```shell 
wget -P /root 网址

nohup Command [ Arg … ] [　& ]
# 3. 用途：不挂断地运行命令。
```

```shell
# 查看开放的端口
netstat -tnlp
```


# 守护进程管理

Systemd是一个系统管理守护进程、工具和库的集合，用于取代System V初始进程。Systemd的功能是用于集中管理和配置类UNIX系统。

Systemctl是一个systemd工具，主要负责控制systemd系统和服务管理器。

