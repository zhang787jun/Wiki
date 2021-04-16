---
title: "k8s 网络基础"
layout: page
date: 2099-06-02 00:00
---
[TOC]


# 1. Kubernetes 的网络[^2]

参考资料

1. [A Guide to the Kubernetes Networking Model](https://sookocheff.com/post/kubernetes/understanding-kubernetes-networking-model/)
2. 
sd[^2]

## 1.1. Network routing in Linux

![](../../../../attach/images/2019-12-18-11-27-23.png)!

## 1.2. Understanding network requirements
## 1.3. Exploring the Endpoints

### 1.3.1. Balancing in-cluster traffic
### 1.3.2. Routing traffic with `kube-proxy`
### 1.3.3. CRI, CNI, CSI: interfaces for the kubelet

kubelet 的接口
### 1.3.4. Choosing between latency and load balancing
### 1.3.5. Pros and cons of the 4 types of Services


### 1.3.6. Discovering Services
发现服务 
### 1.3.7. Routing traffic with an `Ingress` controller

带有Ingress控制器的远程通讯


### 1.3.8. End-to-end traffic journey

端对端的通讯日志

## 1.4. 添加网络插件

上面安装成功后如果通过查询kube-system下Pod的运行情况，会放下和网络相关的Pod都处于Pending的状态，这是因为缺少相关的网络插件，而网络插件有很多个（以下任选一个），可以选择自己需要的。
安装参考： https://kubernetes.feisky.xyz/bu-shu-pei-zhi/cluster/kubeadm#pei-zhi-network-plugin

CNI(container network interface)

### 1.4.1. CNI bridge

kubenet：这是一个基于CNI bridge的网络插件（在bridge插件的基础上扩展了port mapping和traffic shaping），是目前推荐的默认插件

CNI：CNI网络插件，需要用户将网络配置放到`/etc/cni/net.d`目录中，并将CNI插件的二进制文件放入/opt/cni/bin


```shell
mkdir -p /etc/cni/net.d
cat >/etc/cni/net.d/10-mynet.conf <<-EOF
{
    "cniVersion": "0.3.0",
    "name": "mynet",
    "type": "bridge",
    "bridge": "cni0",
    "isGateway": true,
    "ipMasq": true,
    "ipam": {
        "type": "host-local",
        "subnet": "10.244.0.0/16",
        "routes": [
            {"dst": "0.0.0.0/0"}
        ]
    }
}
EOF
cat >/etc/cni/net.d/99-loopback.conf <<-EOF
{
    "cniVersion": "0.3.0",
    "type": "loopback"
}
EOF
```
### 1.4.2. flannel

Flannel是CoreOS团队针对Kubernetes设计的一个网络规划服务，简单来说，它的功能是让集群中的不同节点主机创建的Docker容器都具有全集群唯一的虚拟IP地址。 ... 并使这些容器之间能够之间通过IP地址相互找到，也就是相互ping通。

需要在kubeadm init 时设置 --pod-network-cidr=10.244.0.0/16 
```shell
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/v0.10.0/Documentation/kube-flannel.yml
```

### 1.4.3. weave

Weave Net是一个多主机容器网络方案，支持去中心化的控制平面，各个host上的wRouter间通过建立Full Mesh的TCP链接，并通过Gossip来同步控制信息。这种方式省去了集中式的K/V Store，能够在一定程度上减低部署的复杂性，Weave将其称为“data centric”，而非RAFT或者Paxos的“algorithm centric”。

数据平面上，Weave通过UDP封装实现L2 Overlay，封装支持两种模式，一种是运行在user space的sleeve mode，另一种是运行在kernal space的 fastpathmode。Sleeve mode通过pcap设备在Linux bridge上截获数据包并由wRouter完成UDP封装，支持对L2 traffic进行加密，还支持Partial Connection，但是性能损失明显。

Fastpath mode即通过OVS的odp封装VxLAN并完成转发，wRouter不直接参与转发，而是通过下发odp 流表的方式控制转发，这种方式可以明显地提升吞吐量，但是不支持加密等高级功能。


```shell
sysctl net.bridge.bridge-nf-call-iptables=1
kubectl apply -f "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')"
```

### 1.4.4. calico


需要 kubeadm init 时设置 --pod-network-cidr=192.168.0.0/16
```shell
kubectl apply -f https://docs.projectcalico.org/v3.1/getting-started/kubernetes/installation/hosted/rbac-kdd.yaml
kubectl apply -f https://docs.projectcalico.org/v3.1/getting-started/kubernetes/installati
```


单节点，设置master节点也可以运行Pod
kubernetes官方默认策略是worker节点运行Pod，master节点不运行Pod。如果只是为了开发或者其他目的而需要部署单节点集群，可以通过以下的命令设置：
kubectl taint nodes --all node-role.kubernetes.io/master-