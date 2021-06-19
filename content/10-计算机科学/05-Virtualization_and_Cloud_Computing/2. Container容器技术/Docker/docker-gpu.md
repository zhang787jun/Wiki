---
title: "nvidia-docker "
layout: page
date: 2099-06-02 00:00
---
[TOC]


NVIDIA于2016年开始设计NVIDIA-Docker已便于容器使用NVIDIA GPUs。

# 1. nvidia-docker 1.0

第一代nvidia-docker 1.0实现了对docker client的封装，并在容器启动时，将必要的GPU device和libraries挂载到容器中。

## 1.1. nvidia-docker 存在的问题
完善容器运行时对GPU的支持。如: 自动的获取用户层面的NVIDIA Driver libraries, NVIDIA kernel modules, device ordering等。
但是这种设计的方式高度的与docker运行耦合，缺乏灵活性。

存在的缺陷具体如下:

1. 设计高度与docker耦合，不支持其它的容器运行时。如: LXC, CRI-O及未来可能会增加的容器运行时。
2. 不能更好的利用docker生态的其它工具。如: docker compose。
3. 不能将GPU作为调度系统的一种资源来进行灵活的调度。



基于上面描述的这些弊端，NVIDIA开始了对下一代容器运行时的设计: nvidia-docker2.0。


# 2. nvidia-docker 2.0 
nvidia-docker 2.0 的实现机制

## 2.1. 基础知识

先简单介绍下nvidia-docker 2.0, nvidia-container-runtime,libnvidia-container以及runc直接的关系。

nvidia-docker2.0

(https://github.com/NVIDIA/nvidia-docker) 是一个简单的包，它主要通过修改docker的配置文件/etc/docker/daemon.json来让docker使用NVIDIA Container runtime。

nvidia-container-runtime 

(https://github.com/NVIDIA/nvidia-container-runtime) 才是真正的核心部分，它在原有的docker容器运行时runc的基础上增加一个 prestart hook 

(https://github.com/NVIDIA/nvidia-container-runtime), 用于调用libnvidia-container库。

libnvidia-container 

(https://github.com/NVIDIA/nvidia-docker) 提供一个库和一个简单的CLI程序，使用这个库可以使NVIDIA GPU使用Linux容器。

runc 

(https://github.com/opencontainers/runc) 一个命令行工具，会根据标准格式的Open Containers Initiative 

(https://developer.nvidia.com/nvidia-container-runtime) 创建容器。也是docker默认的容器运行时。

实现机制

它们之间的关系可以通过下面这张图关联起来:


上面已经介绍了各个组件的作用以及它们之间的关系，接下来详细的描述下这张图:



正常创建一个容器的流程

docker --> dockerd --> docker-containerd-shm -->runc --> container-process

docker客户端将创建容器的请求发送给dockerd, 当dockerd收到请求任务之后将请求发送给docker-containerd-shm 

(其实就是containerd)。

前面没有介绍到containerd。这里简单的介绍下,containerd,它主要负责的工作是:

管理容器的生命周期(从容器的创建到销毁)

拉取/推送容器镜像

存储管理(管理镜像及容器数据的存储)

调用runc 运行容器

管理容器的网络接口及网络

containerd的定位是:

containerd 被设计成嵌入到一个大系统中，而不是给开发人员和终端的设备使用。

关于containerd的详细说明，请查看 containerd (https://github.com/containerd/containerd)。

当containerd接收到请求之后，做好相关的准备工作，会去调用runc,而runc基于OCI文件对容器进行创建。这是容器创建的整体流程。

创建一个使用GPU容器的流程

docker--> dockerd --> docker-containerd-shim-->nvidia-container-runtime -- > container-process

基本流程和普通不使用GPU的容器差不多，只是把docker默认的运行时替换成了NVIDIA自家的nvidia-container-runtime。 这样当nvidia-container-runtime创建容器时，先执行nvidia-container-runtime-hook这个hook去检查容器是否需要使用GPU(通过环境变量NVIDIA_VISIBLE_DEVICES来判断)。如果需要则调用libnvidia-container来暴露GPU给容器使用。否则则走默认的runc逻辑。



```shell
sudo apt-get install nvidia-docker2
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
    "default-runtime": "nvidia",
    "runtimes": {
        "nvidia": {
            "path": "/usr/bin/nvidia-container-runtime",
            "runtimeArgs": []
        }
    },
    "registry-mirrors": [
      "https://registry.docker-cn.com",
      "https://hub-mirror.c.163.com",
      "https://docker.mirrors.ustc.edu.cn"
      ]

}

EOF
sudo systemctl daemon-reload
sudo systemctl restart docker


```
## 2.2. 总结

说到这里nvidia-docker2.0的大体机制基本就通了。但是涉及到的nvidia-container-runtime, libnvidia-container, containerd,runc这些项目， 这本篇文章里面就不一一介绍了。如果感兴趣可以自行去探索学习。这些地址在文章中都已经做过相关的链接。

# 3. 参考

```shell

distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.repo | \
sudo tee /etc/yum.repos.d/nvidia-docker.repo


DIST=$(sed -n 's/releasever=//p' /etc/yum.conf)
DIST=${DIST:-$(. /etc/os-release; echo $VERSION_ID)}
sudo yum makecache
```



https://developer.nvidia.com/nvidia-container-runtime https://devblogs.nvidia.com/gpu-containers-runtime/

https://github.com/opencontainers/runtime-spec/blob/master/config.md 

https://github.com/opencontainers/runtime-spec

https://github.com/NVIDIA/nvidia-container-runtime

https://github.com/opencontainers/runc 

https://github.com/NVIDIA/libnvidia-container

https://github.com/NVIDIA/nvidia-docker/issues/815



# 4. 新docker 


## 4.1. 引言

借助 docker 方式安装的很多大型项目都需要使用 nvidia 显卡，在 docker 中使用 nvidia 显卡资源，一方面需要在 host 主机上安装 nvidia 驱动，另外还需要安装 nvidia-docker。整个系统架构如下图所示
nvidia-docker.png (图片来源 https://github.com/NVIDIA/nvidia-docker )
本文总结了在 ubuntu 16.04 系统中 nvidia-docker 1.0 和 2.0 两个版本的安装方式。根据项目的不同要求，选择相应版本安装即可。

安装 nvidia-docker 1.0
参考来源

添加 repo
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -

distribution=$(. /etc/os-release;echo $ID$VERSION_ID)

curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update
安装 nvidia-docker 1.0
sudo apt-get install nvidia-docker

安装 nvidia-docker 2.0
参考来源


sudo gpg --homedir /var/lib/yum/repos/$(uname -m)/$DIST/nvidia-docker/gpgdir --delete-key f796ecb0
sudo gpg --homedir /var/lib/yum/repos/$(uname -m)/$DIST/nvidia-container-runtime/gpgdir --delete-key f796ecb0
sudo gpg --homedir /var/lib/yum/repos/$(uname -m)/$DIST/libnvidia-container/gpgdir --delete-key f796ecb0
————————————————
版权声明：本文为CSDN博主「keineahnung2345」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/keineahnung2345/java/article/details/84788061


```shell
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.repo | tee /etc/yum.repos.d/nvidia-docker.repo
yum install -y nvidia-docker2
```


如果之前安装过 nvidia-docker 1.0 版本，要先删除
```shell
docker volume ls -q -f driver=nvidia-docker | xargs -r -I{} -n1 docker ps -q -a -f volume={} | xargs -r docker rm -f

sudo apt-get purge -y nvidia-docker
```

```shell
添加 repo （这一步与前边安装 v1.0 版本的设置完全相同）
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey |  sudo apt-key add -

distribution=$(. /etc/os-release;echo $ID$VERSION_ID)

curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update
安装 nvidia-docker 2.0 并加载相关配置文件
sudo apt-get install -y nvidia-docker2

sudo pkill -SIGHUP dockerd
测试是否安装成功

docker run --runtime=nvidia --rm nvidia/cuda nvidia-smi
# 或者
docker run --runtime=nvidia --rm nvidia/cuda:9.0-base nvidia-smi

```

如果安装成功，应该可以正确显示本机的 nvidia 显卡信息。如果报错，先 docker login，再运行上述命令。

