---
title: "kubeadm 基本操作"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. kubeadm 基本操作

参考资料 [(官方)kubeadm 实现细节](http://docs.kubernetes.org.cn/829.html#i-4)


接下可以做什么
• `kubeadm init` 启动一个 Kubernetes 主节点
• `kubeadm join` 启动一个 Kubernetes 工作节点并且将其加入到集群
• `kubeadm upgrade` 更新一个 Kubernetes 集群到新版本
• `kubeadm config` 如果使用 v1.7.x 或者更低版本的 kubeadm 初始化集群，您需要对集群做一些配置以便使用 `kubeadm upgrade` 命令
• `kubeadm token` 管理 kubeadm join 使用的令牌
• `kubeadm reset` 还原 kubeadm init 或者 kubeadm join 对主机所做的任何更改
• `kubeadm version` 打印 kubeadm 版本
• `kubeadm alpha` 预览一组可用的新功能以便从社区搜集反馈


## 1.1. kubeadm init

```shell
# 初始化集群
kubeadm init [flags]
```
### 1.1.1. flags 参数输入

--`image-repository` = registry.aliyuncs.com/google_containers

--`apiserver-advertise-address`="0.0.0.0" 
string, API Server将要广播的监听地址。如指定为 `0.0.0.0` 将使用缺省的网卡地址。

--`apiserver-bind-port`=6443  
int32, 缺省值: 6443 Kuberneter API Server绑定的端口

--`apiserver-cert-extra-sans`=""
string,Slice可选的额外提供的证书主题别名（SANs）用于指定API Server的服务器证书。可以是IP地址也可以是DNS名称。

--`cert-dir`="/etc/kubernetes/pki"  
string, 缺省值: "/etc/kubernetes/pki"证书的存储路径。

--`config`="/var/run/dockershim.sock"
string,kubeadm配置文件的路径。警告：配置文件的功能是实验性的。

--`cri-socket`="/var/run/dockershim.sock"
string, 缺省值: "/var/run/dockershim.sock" 指明要连接的CRI socket文件


--`dry-run`
不会应用任何改变；只会输出将要执行的操作。

--`feature-gates` 
string,键值对的集合，用来控制各种功能的开关。可选项有:
Auditing=true|false (当前为ALPHA状态 - 缺省值=false)
CoreDNS=true|false (缺省值=true)
DynamicKubeletConfig=true|false (当前为BETA状态 - 缺省值=false)

-`h`, --`help`
获取init命令的帮助信息

--`ignore-preflight-errors` stringSlice
忽视检查项错误列表，BS列表中的每一个检查项如发生错误将被展示输出为警告，而非错误。 例如: 'IsPrivilegedUser,Swap'. 如填写为 'all' 则将忽视所有的检查项错误。

--`kubernetes-version` ="stable-1"
string  缺省值: "stable-1" ,为control plane选择一个特定的Kubernetes版本。

--`node-name` =""
string,指定节点的名称。


--`pod-network-cidr` ="10.244.0.0/16"
string, 指明pod网络可以使用的**IP地址段**。 如果设置了这个参数，control plane将会为每一个节点自动分配CIDRs。

--`service-cidr`= "10.96.0.0/12"
string ,缺省值: "10.96.0.0/12" 为service的虚拟IP地址另外指定**IP地址段**

--`service-dns-domain`="cluster.local"
string ,缺省值: "cluster.local" 为services另外指定域名, 例如： "myorg.internal".


--`skip-token-print`
不打印出由 `kubeadm init` 命令生成的默认令牌。

--`token` string
这个令牌用于建立主从节点间的双向受信链接。格式为 [a-z0-9]{6}\.[a-z0-9]{16} - 示例： abcdef.0123456789abcdef

--`token-ttl duration`     缺省值: 24h0m0s
令牌被自动删除前的可用时长 (示例： 1s, 2m, 3h). 如果设置为 '0', 令牌将永不过期。



## 1.2. kubeadm join

基本形式
```shell
# 在worknode节点（需要添加进入集群的节点）上执行
kubeadm join  xxx.xxx.xxx.xxx:prot --discovery-token=*****
--discovery-token-ca-cert-hash=**@@@@@@@@
<API-service-ip> :prot: api服务的ip地址 及端口号
```
为集群添加结点，使得work 节点与master 节点建立**双向**信任机制。

**双向**信任机制分为2部分：
1. 节点发现（让work节点信任master节点）
2. TLS bootstrap引导（让master节点信任work节点）


### 1.2.1. 基本步骤
#### 1.2.1.1. 预检检查
kubeadm 在开始连接之前执行一组预检检查，目的是验证先决条件并避免常见的集群启动问题。

*注意：*
    kubeadm join 预检检查基本上是一个 kubeadm init 预检检查的子集

#### 1.2.1.2. 发现集群信息

针对发现，有两个主要的解决方案:
1. 使用共享token +  API server IP 地址。
2. 标准 kubeconfig 文件

##### 1.2.1.2.1. 基于共享Token的集群发现

```shell
kubeadm join  xxx.xxx.xxx.xxx --discovery-token=*****
```
步骤
1. 检索集群 CA 证书
kubeadm 执行节点基本上从Namespace kube-public 下 cluster-info ConfigMap 中检索集群 CA 证书 。

为了防止 “中间人” 攻击，采取了几个步骤：

首先，通过不安全的连接检索 CA 证书（这是可能的，因为 kubeadm init 对 system:unauthenticated 授予了访问 cluster-info 用户的权限）
然后 CA 证书通过以下验证步骤：
    基本验证：针对 JWT 签名使用令牌 ID
    发布密钥验证：使用提供的 --discovery-token-ca-cert-hash。此值可在 kubeadm init 的输出中获取，也可以使用标准工具计算（散列是在 SPKI（Subject Public Key Info）对象的字节上计算的，如 RFC 7469 中所示）。--discovery-token-ca-cert-hash 标志可以重复多次，以允许多个公钥。 -作为附加验证，CA 证书通过安全连接进行检索，然后与最初检索的 CA 进行比较

请注意：

    通过 --discovery-token-unsafe-skip-ca-verification 标志可以跳过发布密钥验证; 这削弱了 kubeadm 安全模型，因为其他人可能潜在模仿 Kubernetes Master。

##### 1.2.1.2.2. 基于标准文件/https的集群发现

```shell
kubeadm join  xxx.xxx.xxx.xxx --discovery-file=*****
```

如果 kubeadm join 被调用为 --discovery-file，则使用文件发现; 此文件可以是本地文件或通过 HTTPS URL 下载; 在 HTTPS 的情况下，主机安装的 CA 用于验证连接。

通过文件发现，集群 CA 证书被提供到文件本身; 事实上，发现的文件是一个 kubeconfig 文件，其中只设置了 server 和 certificate-authority-data 属性，如 kubeadm join 参考文档中所述; 当与集群建立连接时，kubeadm 尝试访问 cluster-info ConfigMap，如果可用，则使用它。


#### 1.2.1.3. TLS 引导

一旦知道了集群信息，就会编写文件 bootstrap-kubelet.conf，从而允许 kubelet 执行 TLS 引导（相反，直到 v1.7 TLS 引导被 kubeadm 管理）。

TLS 引导机制

**基本步骤**
1. 使用共享Token提交csr。
使用共享Token临时向 Kubernetes Master 进行身份验证，以提交本地创建的密钥对的证书签名请求（CSR）。

2. 自动批准该请求，并完成保存 `ca.crt` 文件和用于加入集群的 `kubelet.conf` 文件，而 bootstrap-kubelet.conf 被删除。

csr审批控制器`csrapproving` 控制器将作为`kube-controller-manage`r 的一部分，被默认启用,将处理 csr 的审批问题
 
```shell
/etc/kubernetes
├── kubelet.conf # 用于加入集群的配置文件
├── manifests
└── pki
    └── ca.crt  # ca 证书
```
请注意：
    临时验证是根据 kubeadm init 过程中保存的Token进行验证的（或者使用 kubeadm token 创建的附加令牌）
    对 kubeadm init 过程中被授予访问 CSR api 的 system:bootstrappers:kubeadm:default-node-token 组的用户成员的临时身份验证解析
    自动 CSR 审批由 csrapprover 控制器管理，与 kubeadm init 过程的配置相一致

如果 kubeadm 被调用为 --feature-gates=DynamicKubeletConfig：
    使用引导令牌凭据从 kube-system 命名空间中的 kubelet-base-config-v1.9 ConfigMap 中读取 kubelet 基本配置，并将其写入磁盘，作为 kubelet init 配置文件 /var/lib/kubelet/config/init/kubelet
    当 kubelet 以节点自己的凭据（/etc/kubernetes/kubelet.conf）开始时，更新当前节点配置，指定 node/kubelet 配置的源是上面的 ConfigMap。

请注意：
    要使动态 kubelet 配置正常工作，应在 /etc/systemd/system/kubelet.service.d/10-kubeadm.conf 中指定标志 --dynamic-config-dir=/var/lib/kubelet/config/dynamic




关键问题：
  1. 什么样子的节点可以加入
  2. 哪个节点

集群对节点的认证：
  2.1 X509 客户证书
  2.2 Static Token File
      2.2.1 Putting a Bearer Token in a Request
  2.3 Bootstrap Tokens
  2.4 Static Password File
  2.5 OpenID Connect Tokens
      2.5.1 Configuring the API Server
      2.5.2 使用kubectl
          2.5.2.1 选项1-OIDC AUTHENTICATOR
          2.5.2.2 选项 2 - USE THE --TOKEN OPTION
  2.6 Webhook Token Authentication
  2.7 Authenticating Proxy
  2.8 Keystone Password

`kubeadm join` 命令最简单的方式是通过Token，主控节点上使用`kubeadm token`命令可以管理集群所产生的Token。

基于文件或HTTPS的发现
这提供了一种带外方式来在控制平面节点和自举节点之间建立信任根。如果要使用kubeadm构建自动置备，请考虑使用此模式。发现文件的格式是常规的Kubernetes kubeconfig文件。

X.509格式证书是被广泛使用的数字证书标准，是用于标志通讯各方身份信息的一系列数据。

如果发现文件不包含凭据，则将使用TLS发现令牌。

基本步骤: 
1. 获取token value
```shell
kubeadm 
```
2. 获取ca证书sha256编码hash值

```shell
openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'
>>>
2cc3029123db737f234186636330e87b5510c173c669f513a9c0e0da395515b0
# 别人的 我怎么敢把自己的hash值放上去
```

3c190bad5c715d3315f566ba8fed575dee0022d078109cb200a18675b757d55f

 

3.node节点加入

```shell
kubeadm join 10.167.11.153:6443 --token o4avtg.65ji6b778nyacw68 --discovery-token-ca-cert-hash sha256:2cc3029123db737f234186636330e87b5510c173c669f513a9c0e0da395515b0
```

kubeadm join 172.24.195.43:6443 --token d8hvdo.6ub9nq2dgnlodq2h --discovery-token-ca-cert-hash 3c190bad5c715d3315f566ba8fed575dee0022d078109cb200a18675b757d55f

示例kubea1dm join命令：

```shell
# 使用token 将节点加入集群
kubeadm join –token 4fccd2.b0e0f8918bd95d3e 192.168.119.132:6443

# 使用外部配置文件 将节点加入集群
kubeadm join --discovery-file path/to/file.conf （本地文件）
kubeadm join --discovery-file https://url/file.conf （远程HTTPS URL）
```

kubeadm join 172.24.195.43:6443 --token bdibtv.8iu07mfcpssfdrmg \
    --discovery-token-ca-cert-hash sha256:6732957bd86580ac23b70bb7a1a0135149db580e3f25a7ce24c4c1409cd5b923

## 1.3. kubeadm token

参考： https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-token/

```shell
# 创建一个永久有效的token。（生成的token 可以通过kubeadm token list 查看）
kubeadm token create
# 查看token
kubeadm token list
# 删除 token
kubeadm token delete [token-value]
# 生成并打印出 一个随机生成的引导token,该token可以用于 kubeadm init 和kubeadm join 命令中。kubeadm token list 中不显示
kubeadm token generate

# 方法重新生成链接Token并打印输出加入命令
kubeadm token create --print-join-command
>>>
kubeadm join XXX.XXX.xxx.xxx:6443 --token XXXXXXX --discovery-token-ca-cert-hash XXXXXX
```
