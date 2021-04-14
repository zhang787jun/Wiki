---
title: "NFS"
layout: page
date: 2099-06-02 00:00
---

[TOC]


# 1.NFS基础概念
NFS



背景
服务端：centos 7.6。ip:47.96.156.20。
客户端：centos 7.6。ip:
服务端不在同一vpc下。

nfs简介
NFS是Network File System的简写，即网络文件系统，NFS是FreeBSD支持的文件系统中的一种。NFS基于RPC(Remote Procedure Call)远程过程调用实现，其允许一个系统在网络上与它人共享目录和文件。通过使用NFS，用户和程序就可以像访问本地文件一样访问远端系统上的文件。NFS是一个非常稳定的，可移植的网络文件系统。具备可扩展和高性能等特性，达到了企业级应用质量标准。由于网络速度的增加和延迟的降低，NFS系统一直是通过网络提供文件系统服务的有竞争力的选择 。

NFS与Samba服务类似，但一般Samba服务常用于办公局域网共享，而NFS常用于互联网中小型网站集群架构后端的数据共享。

NFS客户端将NFS服务端设置好的共享目录挂载到本地某个挂载点，对于客户端来说，共享的资源就相当于在本地的目录下。

rpc简介
RPC（Remote Procedure Call Protocol）远程过程调用协议。它是一种通过网络从远程计算机程序上请求服务，而不需要了解底层网络技术的协议。
在NFS服务端和NFS客户端之间，RPC服务扮演一个中介角色，NFS客户端通过RPC服务得知NFS服务端使用的端口，从而双方可以进行数据通信。

rpc和nfs通讯
当NFS服务端启动服务时会随机取用若干端口，并主动向RPC服务注册取用相关端口及功能信息，这样，RPC服务就知道NFS每个端口对应的的NFS功能了，然后RPC服务使用固定的111端口来监听NFS客户端提交的请求，并将正确的NFS端口信息回复给请求的NFS客户端。这样，NFS客户就可以与NFS服务端进行数据传输了

nfs服务端
通过yum目录安装nfs服务和rpcbind服务
yum -y install nfs-utils rpcbind
启动服务
systemctl start rpcbind
systemctl enable rpcbind

systemctl start nfs（或者systemctl start nfs-server）
sytemctl enable nfs
查看nfs服务是否安装正常
rpcinfo -p localhost
或者是通过公网测试服务端的nfs服务是否可用。

rpcinfo -p 47.96.156.20
显示如下即正常

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
可以看到如上有3个主要进程

portmap：主要功能是进行端口映射工作。当客户端尝试连接并使用RPC服务器提供的服务（如NFS服务）时，portmap会将所管理的与服务对应的端口提供给客户端，从而使客户可以通过该端口向服务器请求服务。该进程就是rpc服务的进程，该服务使用111端口来件套nfs客户端提交的请求，并将正确的nfs端口信息回复给请求的nfs客户端。
mountd：它是RPC安装守护进程，主要功能是管理NFS的文件系统。当客户端顺利通过nfsd登录NFS服务器后，在使用NFS服务所提供的文件前，还必须通过文件使用权限的验证。它会读取NFS的配置文件/etc/exports来对比客户端权限。
nfs：它是基本的NFS守护进程，主要功能是管理客户端是否能够登录服务器；nfs服务的端口默认是2049，客户端使用mount命令挂载报time out时，可能原因就是该进程的端口未暴露。
nfs 服务端共享配置
在NFS服务器端的主要配置文件为/etc/exports，通过此配置文件可以设置服务端的共享文件目录。每条配置记录由NFS共享目录、NFS客户端地址和参数这3部分组成，格式如下
[NFS共享目录] [NFS客户端地址1(参数1,参数2,参数3……)] [客户端地址2(参数1,参数2,参数3……)]

NFS共享目录：nfs服务端上共享出去的文件目录；
NFS客户端地址：允许其访问的NFS服务端的客户端地址，可以是客户端IP地址，也可以是一个网段(192.168.64.0/24)，或者是*表示所有客户端IP都可以访问；
访问参数：括号中逗号分隔项，主要是一些权限选项。
序号	选项	描述
1	ro	客户端对于共享文件目录为只读权限。（默认设置）
2	rw	客户端对共享文件目录具有读写权限
3	root_squash	使客户端使用root账户访问时，服务器映射为服务器本地的匿名账号。
4	no_root_squash	客户端连接服务端时如果使用的是root的话，那么也拥有对服务端分享的目录的root权限
5	all_squash	将所有客户端用户请求映射到匿名用户或用户组（nfsnobody）
6	no_all_squash	与上相反（默认设置）
7	anonuid=xxx	将远程访问的所有用户都映射为匿名用户，并指定该用户为本地用户（UID=xxx）
8	anongid=xxx	将远程访问的所有用户组都映射为匿名用户组账户，并指定该匿名用户组账户为本地用户组账户（GID=xxx）
9	sync	同步写操作，数据写入存储设备后返回成功信息。（默认设置）
10	async	异步写操作，数据在未完全写入存储设备前就返回成功信息，实际还在内存。
11	wdelay	延迟写入选项，将多个写操请求合并后写入硬盘，减少I/O次数，NFS非正常关闭数据可能丢失（默认设置）
12	no_wdelay	与上相反，不与async同时生效，如果NFS服务器主要收到小且不相关的请求，该选项实际会降低性能
13	subtree	若输出目录是一个子目录，则nfs服务器将检查其父目录的权限(默认设置)
14	no_subtree	即使输出目录是一个子目录，nfs服务器也不检查其父目录的权限，这样可以提高效率
15	secure	限制客户端只能从小于1024的tcp/ip端口连接nfs服务器（默认设置）
16	insecure	允许客户端从大于1024的tcp/ip端口连接服务器
比如我们在服务端的共享目录为/nfs-share，接着输入以下命令配置共享目录

echo "/nfs-share *(rw,async,no_root_squash)" >> /etc/exports
要保证/nfs-share目录已经存在节点上，然后输入以下命令使共享目录生效。

exportfs -r
重新启动服务
systemctl restart rpcbind

systemctl restart nfs（或者systemctl restart nfs-server）
测试
showmount -e localhost
或者
showmount -e 公网ip
showmount命令查询“mountd”守护进程，以显示NFS服务器加载的信息。

-d:仅显示已被NFS客户端加载的目录
-e:显示NFS服务器上所有的共享目录

问题
一般showmount -e localhost命令都是好使的，在使用showmount -e 公网ip时会显示如下问题

showmount -e 47.96.156.205
clnt_create: RPC: Port mapper failure - Timed out
解决：
很明显报的是portmapper进程连接超时，很大可能是端口111没有放行。我们使用telnet命令测试显示,111端口确实没有放开。

[root@s1 ~]# telnet 47.96.156.205 111
Trying 47.96.156.205...
所有我们需要在安全组中放行TCP类型的端口111，放行之后再次测试发现还是连接超时。。
接着我们继续放行mountd进程的TCP端口20048，，放行之后再次测试发现仍然是连接超时。。。。
经过一番排查，细心的朋友会发现portmapper进程有TCP的111端口，也有UDP的111端口，mountd进程有TCP的20048端口，也有UDP的20048端口（rpcinfo -p 命令）。
接着放行UDP的111端口和UDP的20048端口后果然显示成功了

[root@s1 ~]# showmount -e 47.96.156.205
Export list for 47.96.156.205:
/k8s *
至此，nfs的服务端就安装成功了。

nfs客户端
服务端安装完后，我们需要安装NFS客户端。

由于此实验条件不足，导致nfs客户端与nfs的服务端不是同一vpc下，所以我们需要使用nfs服务端的公网挂载，但是我们在生产环境中要保证在nfs服务端与客户端都在同一个vpc下，可以有效避免网络之间的延迟。

安装nfs-utils
yum install nfs-utils rpcbind -y
启动服务
systemctl start rpcbind
systemctl enable rpcbind

systemctl start nfs（或者使systemctl start nfs-server）
sytemctl enable nfs
客户端讲挂载点挂载到服务端的共享目录
执行如下命令挂载

[root@002 home]# mount -t nfs -o 47.96.156.205:/k8s /home/k8s/
mount: can't find /home/k8s/ in /etc/fstab
发现报如上问题
首先解释下命令含义，mount常用来挂载文件系统，本质nfs就是一个文件系统。上面命令就是将客户端目录/home/k8s做为挂载点，挂载到nfs服务端的共享目录/k8s下，nfs服务端的ip是47.96.156.205。通俗讲就是将客户端目录/home/k8s与服务端的共享目录/k8s实现共享。
执行此命令之前必须保证nfs服务端的export文件内已经配置/k8s为共享目录了。

接着继续看我们的问题，/etc/fstab文件是配置nfs挂载点的文件，问题也就很明显了，我们需要在该文件的末尾新增一行配置一个挂载点，配置如下。

47.96.156.205:/k8s      /home/k8s       nfs     default 0       0
第一列是需要挂载的文件系统或者是存储设备或者是需要挂载的目录。

第二列是挂载点，挂载点就是客户端挂载的目录。

第三列是文件系统或者是分区的类型（其实分区类型就是中文件系统）

第四列是以何种形式挂载，比如rw读写, auto自动挂载,ro只读等等参数。不过最常用的是default。default是rw，suid，dev，exec，auto，nouser，async等的组合。

第五列为dump选项，设置是否让备份程序dump备份文件系统，0为忽略，1为备份。

第六列为fsck选项，告诉fsck程序以什么顺序检查文件系统，0为忽略。

此时继续执行上个命令

[root@002 home]# mount -t nfs -o 47.96.156.205:/k8s /home/k8s/
mount.nfs: Connection timed out
第一反应是我们NFS服务的mountd进程端口没有放行，但是我们已经放行了。经发现，nfs服务的端口2049的端口没有放行，而nfs进程的主要功能是管理客户端是否能够登录服务器，所有问题确认了，我们只需要放行NFS服务端TCP端口的2049即可，不用放行UDP端口为2049。

此时我们执行如下命令,此命令和上述命令相比没有参数-o,发现挂载成功。

 mount -t nfs 47.96.156.205:/k8s /home/k8s/
具体参数可以使用help命令查看

mount -help
测试
执行如下命令

[root@002 home]# df -h
Filesystem                 Size  Used Avail Use% Mounted on
devtmpfs                   909M     0  909M   0% /dev
tmpfs                      919M     0  919M   0% /dev/shm
tmpfs                      919M   90M  830M  10% /run
tmpfs                      919M     0  919M   0% /sys/fs/cgroup
/dev/vda1                   40G   18G   21G  47% /
tmpfs                      184M     0  184M   0% /run/user/0
shm                         64M     0   64M   0% 
shm                         64M     0   64M   0% 
47.96.156.205:/k8s          40G  1.8G   36G   5% /home/k8s
在下面最后一行我们看到已经挂载成功了。

此时我们在客户端的/home/k8s目录下新增或删除内容后，服务端的/k8s目录下也会立即发生相应的内容的改变。
服务端的/k8s目录下新增或删除内容后，会发现客户端的/home/k8s目录会立即发生相应的内容的改变

总结：说明服务端的共享目录和客户端的挂载点是双向共享的。



可以看到如上有3个主要进程

portmap：主要功能是进行端口映射工作。当客户端尝试连接并使用RPC服务器提供的服务（如NFS服务）时，portmap会将所管理的与服务对应的端口提供给客户端，从而使客户可以通过该端口向服务器请求服务。该进程就是rpc服务的进程，该服务使用111端口来件套nfs客户端提交的请求，并将正确的nfs端口信息回复给请求的nfs客户端。
mountd：它是RPC安装守护进程，主要功能是管理NFS的文件系统。当客户端顺利通过nfsd登录NFS服务器后，在使用NFS服务所提供的文件前，还必须通过文件使用权限的验证。它会读取NFS的配置文件/etc/exports来对比客户端权限。
nfs：它是基本的NFS守护进程，主要功能是管理客户端是否能够登录服务器；nfs服务的端口默认是2049，客户端使用mount命令挂载报time out时，可能原因就是该进程的端口未暴露。




# 3. 参考资料

