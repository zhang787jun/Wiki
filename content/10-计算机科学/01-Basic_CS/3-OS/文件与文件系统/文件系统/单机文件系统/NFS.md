---
title: "NFS"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# 1. 参考资料

http://linux.vbird.org/linux_server/0330nfs.php#nfssecure

# 2. NFS基础

## 2.1. NFS 是什么

网络文件系统（Network File System，NFS），是由SUN公司研制的UNIX表示层协议(presentation layer protocol)。
**效果**
能让使用者像在使用自己的计算机一样访问网络上别处的文件。

**实现**
NFS基于RPC(Remote Procedure Call)远程过程调用实现，其允许一个系统在网络上与它人共享目录和文件。通过使用NFS，用户和程序就可以像访问本地文件一样访问远端系统上的文件。
**效果与评价**
NFS是一个非常稳定的，可移植的网络文件系统。具备可扩展和高性能等特性，达到了企业级应用质量标准。由于网络速度的增加和延迟的降低，NFS系统一直是通过网络提供文件系统服务的有竞争力的选择 。

**应用**
NFS与Samba服务类似，但一般Samba服务常用于办公局域网共享，而NFS常用于**互联网中小型网站集群架构后端的数据共享**。



## 2.2. rpc简介
RPC（Remote Procedure Call Protocol）远程过程调用协议。它是一种通过网络从远程计算机程序上请求服务，而不需要了解底层网络技术的协议。
在NFS服务端和NFS客户端之间，RPC服务扮演一个中介角色，NFS客户端通过RPC服务得知NFS服务端使用的端口，从而双方可以进行数据通信。

## 2.3. rpc和nfs通讯
当NFS服务端启动服务时会随机取用若干端口，并主动向RPC服务注册取用相关端口及功能信息，这样，RPC服务就知道NFS每个端口对应的的NFS功能了，然后RPC服务使用固定的111端口来监听NFS客户端提交的请求，并将正确的NFS端口信息回复给请求的NFS客户端。这样，NFS客户就可以与NFS服务端进行数据传输了

## 2.4. 安装与配置
### 2.4.1. nfs-service 
**方案1** --在1个节点启动nfs-service 服务
```shell
# 安装 nfs server 端应用
sudo apt-get install -y nfs-kernel-server
# 配置 nfs 目录和读写权限相关配置。
export nfs_dir=/data/nfs_data
sudo mkdir -p $nfs_dir
sudo vim /etc/exports
将下列内容添加进最后一行：
<nfs_dir> *(rw,sync,no_root_squash,no_subtree_check)
例如
/data/nfs_data *(rw,sync,no_root_squash,no_subtree_check)
# 重启服务

sudo systemctl restart rpcbind
sudo systemctl restart nfs-kernel-server
# 检查验证服务
sudo systemctl status nfs-kernel-server
sudo systemctl status rpcbind
sudo rpcinfo -p localhost |grep nfs
```


```shell
# CentOS
yum -y install nfs-utils rpcbind
# 启动服务
systemctl start rpcbind
systemctl enable rpcbind

systemctl start nfs（或者systemctl start nfs-server）
sytemctl enable nfs
```

**方案2**--在1个docker容器启动nfs-service 服务

```shell
# 
docker run -d  --name nfs --privileged \
-p 2049:2049 -v /data/zhangj414/plate_char_recognition_lprnet:/nfsshare \
-e SHARED_DIRECTORY=/nfsshare \
itsthenetwork/nfs-server-alpine:latest
```
**参数说明**
`-e `环境变量SHARED_DIRECTORY指定的任何目录
`--net=host` 或`-p 2049:2049`通过主机网络堆栈从外部访问共享。
`-v /tmp/test` 共享的文件路径
`-e READ_ONLY=true`将导致导出文件包含ro而不是rw仅允许客户端进行读取访问。
`-e SYNC=true`将导致导出文件包含sync而不是async启用同步模式




### 2.4.2. 检验nfs服务
```shell
rpcinfo -p localhost

# 或者是通过公网测试服务端的nfs服务是否可用。

显示如下即正常
>>>
program vers proto   port  service
100000    4   tcp    111  portmapper
100000    3   tcp    111  portmapper
100000    2   tcp    111  portmapper
100000    4   udp    111  portmapper
100000    3   udp    111  portmapper
100000    2   udp    111  portmapper
100024    1   udp  45993  status
100024    1   tcp  39431  status
100005    1   udp  20048  mountd
100005    1   tcp  20048  mountd
100005    2   udp  20048  mountd
100005    2   tcp  20048  mountd
100005    3   udp  20048  mountd
100005    3   tcp  20048  mountd
100003    3   tcp   2049  nfs
100003    4   tcp   2049  nfs
100227    3   tcp   2049  nfs_acl
100003    3   udp   2049  nfs
100003    4   udp   2049  nfs
100227    3   udp   2049  nfs_acl
100021    1   udp  43258  nlockmgr
100021    3   udp  43258  nlockmgr
100021    4   udp  43258  nlockmgr
100021    1   tcp  33941  nlockmgr
100021    3   tcp  33941  nlockmgr
100021    4   tcp  33941  nlockmgr
```

可以看到如上有3个主要进程

1. `portmap` ：主要功能是进行**端口映射**工作。当客户端尝试连接并使用RPC服务器提供的服务（如NFS服务）时，portmap会将所管理的与服务对应的端口提供给客户端，从而使客户可以通过该端口向服务器请求服务。该进程就是rpc服务的进程，该服务使用111端口来件套nfs客户端提交的请求，并将正确的nfs端口信息回复给请求的nfs客户端。
2. `mountd`：它是RPC安装守护进程，主要功能是**管理NFS的文件系统**。当客户端顺利通过nfsd登录NFS服务器后，在使用NFS服务所提供的文件前，还必须通过文件使用权限的验证。它会读取NFS的配置文件/etc/exports来对比客户端权限。
3. `nfs`：它是基本的NFS守护进程，主要功能是管理客户端是否能够登录服务器；nfs服务的端口默认是2049，客户端使用mount命令挂载报time out时，可能原因就是该进程的端口未暴露。


### 2.4.3. nfs-client 


```shell
# Ubuntu
# 安装 
sudo apt-get install -y nfs-common

# 检验/显示 nfs server 配置
showmount -e <nfs server IP>

showmount -e 10.0.77.98
>>>
Export list for 10.0.77.98:
/data/nfs_data *

# 检验/显示 nfs server 配置
rpcinfo -p  <ip>
rpcinfo -p  47.96.156.20


# -d:仅显示已被NFS客户端加载的目录
# -e:显示NFS服务器上所有的共享目录

# 挂载 nfs server 

sudo mount -t <type> <ip>:<server_dir> <local_dir>

sudo mount -t nfs 10.0.77.98:/data/nfs_data /data/nfs_data


# 检验挂载
df -h |grep nfs

# 取消挂载
sudo umount <local_dir>

sudo umount /data/nfs_data

# 强制取消挂载
sudo umount -lf /usr/geoc
```


```shell
# CentOS
# 安装nfs-utils
yum install nfs-utils rpcbind -y
# 启动服务
systemctl start rpcbind
systemctl enable rpcbind

systemctl start nfs（或者使systemctl start nfs-server）
sytemctl enable nfs
```


#### 2.4.3.1. nfs 服务端共享配置
在NFS服务器端的主要配置文件为`/etc/exports`，通过此配置文件可以设置服务端的共享文件目录。每条配置记录由NFS共享目录、NFS客户端地址和参数这3部分组成，格式如下
```txt

[NFS共享目录] [NFS客户端地址1(参数1,参数2,参数3……)] [客户端地址2(参数1,参数2,参数3……)]

/nfs-share *(rw,async,no_root_squash)
```


```shell
echo "/nfs-share *(rw,async,no_root_squash)" >> /etc/exports
```
要保证/nfs-share目录已经存在节点上，然后输入以下命令使共享目录生效。

```shell
exportfs -r
# 重新启动服务
systemctl restart rpcbind
systemctl restart nfs（或者systemctl restart nfs-server）
```










