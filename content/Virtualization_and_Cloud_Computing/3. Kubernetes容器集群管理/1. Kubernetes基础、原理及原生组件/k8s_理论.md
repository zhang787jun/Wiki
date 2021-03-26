---
title: "k8s 理论"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. Kubernetes 的版本号

Kubernetes版本表示为`x.y.z`，其中x是主要版本，y是次要版本，z是补丁版本，遵循语义版本控制术语。

github 里面的[kubernetes 项目]()主要存在3类分支(branch)，分别为
```shell
1. master 
2. release-X.Y
3. release-X.Y.Z
```
master分支上的代码是最新的，每隔2周会生成一个发布版本(release)，由新到旧以此为：

**master**: [alpha-->beta-->Final release]

这当中存在一些cherry picking的规则，也就是说从一个分支上挑选一些必要pull request应用到另一个分支上。

我们可以认为X.Y.0为稳定的版本，这个版本号意味着一个**Final release**。一个X.Y.0版本会在X.(Y-1).0版本的3到4个月后出现。

release-X.Y.Z为经过cherrypick后解决了必须的安全性漏洞、以及影响大量用户的无法解决的问题的补丁版本。

总体而言，我们一般关心X.Y.0(稳定版本)，和X.Y.Z(补丁版本)的特性。例子:
```
v1.14.0
: 1为主要版本
: 14为次要版本
: 0为补丁版本
```

每个版本的支持时期
Kubernetes项目维护最新三个次要版本的发布分支。结合上述一个X.Y.0版本会在X.(Y-1).0版本的3到4个月后出现的描述，也就是说1年前的版本就不再维护，每个次要版本的维护周期为9~12个月，就算有安全漏洞也不会有补丁版本。

## 1.1. 组件版本号

kubernetes在很多场合都会看到版本号，我们先梳理一下有哪些版本号。

`XXX --version`
每个组件有`--version`参数，这时输出本组件的版本号。
### 1.1.1. api 版本号

```shell
kubectl api-versions
```
**各种apiVersion的含义**

- alpha
  * 该软件可能包含错误。启用一个功能可能会导致bug
  * 随时可能会丢弃对该功能的支持，恕不另行通知
- beta
  * 软件经过很好的测试。启用功能被认为是安全的。
  * 默认情况下功能是开启的
  * 细节可能会改变，但功能在后续版本不会被删除
- stable
  * 该版本名称命名方式：vX这里X是一个整数
  * 稳定版本、放心使用
  * 将出现在后续发布的软件版本中
- v1
  * Kubernetes API的稳定版本，包含很多核心对象：pod、service等

- apps/v1beta2
  * 在kubernetes1.8版本中，新增加了apps/v1beta2的概念，apps/v1beta1同理
  DaemonSet，Deployment，ReplicaSet 和 StatefulSet的当时版本迁入apps/v1beta2，兼容原有的extensions/v1beta1
- apps/v1
  * 在kubernetes1.9版本中，引入`apps/v1`，deployment等资源从 extensions/v1beta1, apps/v1beta1 和 apps/v1beta2迁入apps/v1，原来的v1beta1等被废弃。
  * apps/v1代表：包含一些通用的应用层的api组合，如：Deployments, RollingUpdates, and ReplicaSets
- batch/v1*
  * 代表job相关的api组合在kubernetes1.8版本中，新增了batch/v1beta1，后CronJob 已经迁移到了 batch/v1beta1，然后再迁入batch/v1
- autoscaling/v1
  * 代表自动扩缩容的api组合，kubernetes1.8版本中引入。这个组合中后续的alpha 和 beta版本将支持基于memory使用量、其他监控指标进行扩缩容
- extensions/v1beta1
  * deployment等资源在1.6版本时放在这个版本中，后迁入到apps/v1beta2,再到apps/v1中统一管理

- certificates.k8s.io/v1beta1
  * 安全认证相关的api组合

- authentication.k8s.io/v1
  * 资源鉴权相关的api组合


### 1.1.2. kubectl 版本号

```shell
kubectl version
>>>
Client Version: version.Info{Major:"", Minor:"", GitVersion:"v0.0.0-master+$Format:%h$", GitCommit:"$Format:%H$", GitTreeState:"", BuildDate:"1970-01-01T00:00:00Z", GoVersion:"go1.12.9", Compiler:"gc", Platform:"linux/amd64"}
Server Version: version.Info{Major:"1", Minor:"17+", GitVersion:"v1.17.0-alpha.3.227+7d13dfe3c34f44-dirty", GitCommit:"7d13dfe3c34f44ff505afe397c7b05fe6e5414ed", GitTreeState:"dirty", BuildDate:"2019-11-18T14:42:24Z", GoVersion:"go1.12.9", Compiler:"gc", Platform:"linux/amd64"}

# Client Version即kubectl的版本号，
# Server Version即apiserver的版本号。
```

### 1.1.3. kubelet 版本号
```shell
kubectl version
>>>
Client Version: version.Info{Major:"1", Minor:"17", GitVersion:"v1.17.0", GitCommit:"70132b0f130acc0bed193d9ba59dd186f0e634cf", GitTreeState:"clean", BuildDate:"2019-12-07T21:20:10Z", GoVersion:"go1.13.4", Compiler:"gc", Platform:"linux/amd64"}
Server Version: version.Info{Major:"1", Minor:"17", GitVersion:"v1.17.0", GitCommit:"70132b0f130acc0bed193d9ba59dd186f0e634cf", GitTreeState:"clean", BuildDate:"2019-12-07T21:12:17Z", GoVersion:"go1.13.4", Compiler:"gc", Platform:"linux/amd64"}

kubectl get nodes
>>>
NAME          STATUS   ROLES    AGE   VERSION
10.10.10.15   Ready    <none>   12d   v1.17.0-alpha.3.227+7d13dfe3c34f44-dirty
10.10.10.16   Ready    <none>   11d   v1.17.0-alpha.3.227+7d13dfe3c34f44-dirty
# 此处的版本号为kubelet的版本号。
```


### 1.1.4. kubeadm 版本号

```shell
kubeadm version
>>>
kubeadm version: &version.Info{Major:"1", Minor:"17", GitVersion:"v1.17.0", GitCommit:"70132b0f130acc0bed193d9ba59dd186f0e634cf", GitTreeState:"clean", BuildDate:"2019-12-07T21:17:50Z", GoVersion:"go1.13.4", Compiler:"gc", Platform:"linux/amd64"}
```

## 1.2. Kubernetes与Docker版本对应

Kubernetes 1.15.2  -->Docker版本1.13.1、17.03、17.06、17.09、18.06、18.09

Kubernetes 1.15.1  -->Docker版本1.13.1、17.03、17.06、17.09、18.06、18.09

Kubernetes 1.15.0  -->Docker版本1.13.1、17.03、17.06、17.09、18.06、18.09

Kubernetes 1.14.5  -->Docker版本1.13.1、17.03、17.06、17.09、18.06、18.09

Kubernetes 1.14.4  -->Docker版本1.13.1、17.03、17.06、17.09、18.06、18.09

Kubernetes 1.14.3  -->Docker版本1.13.1、17.03、17.06、17.09、18.06、18.09

Kubernetes 1.14.2  -->Docker版本1.13.1、17.03、17.06、17.09、18.06、18.09

Kubernetes 1.14.1  -->Docker版本1.13.1、17.03、17.06、17.09、18.06、18.09

Kubernetes 1.14.0  -->Docker版本1.13.1、17.03、17.06、17.09、18.06、18.09

Kubernetes 1.13.5  -->Docker版本1.11.1、1.12.1、1.13.1、17.03、17.06、17.09、18.06

Kubernetes 1.13.5  -->Docker版本1.11.1、1.12.1、1.13.1、17.03、17.06、17.09、18.06

Kubernetes 1.13.4  -->Docker版本1.11.1、1.12.1、1.13.1、17.03、17.06、17.09、18.06

Kubernetes 1.13.3  -->Docker版本1.11.1、1.12.1、1.13.1、17.03、17.06、17.09、18.06

Kubernetes 1.13.2  -->Docker版本1.11.1、1.12.1、1.13.1、17.03、17.06、17.09、18.06

Kubernetes 1.13.1  -->Docker版本1.11.1、1.12.1、1.13.1、17.03、17.06、17.09、18.06

Kubernetes 1.13.0  -->Docker版本1.11.1、1.12.1、1.13.1、17.03、17.06、17.09、18.06

Kubernetes 1.12.*  -->Docker版本1.11.1、1.12.1、1.13.1、17.03、17.06、17.09、18.06

Kubernetes 1.11.*  -->Docker版本1.11.2到1.13.1、17.03

Kubernetes 1.10.*  -->Docker版本1.11.2到1.13.1、17.03



## 1.3. 实践中如何管理版本

1. 在生产环境中是否应该尽量使用新版本？

> 从结论上来说，是的。原因也是由于上述的发行版都存在这对应的生命周期。
2. 升级集群最大版本跨度是多少？
>但值得注意的时，升级集群理论上只支持跨度为2个次要版本的操作。




# 2. Kubernetes Objects 对象

Kubernetes contains a number of abstractions that represent the state of your system: deployed containerized applications and workloads, their associated network and disk resources, and other information about what your cluster is doing. 

A Kubernetes object is a "**record of intent**" – once you create the object, the Kubernetes system will constantly work to ensure that object exists. By creating an object, you’re telling the Kubernetes system your cluster’s desired state.

The basic Kubernetes objects include:

**Pod** - the smallest and simplest unit in the Kubernetes object model that you create or deploy. A Pod encapsulates an application container (or multiple containers), storage resources, a unique network IP, and options that govern how the container(s) should run.

Service - an abstraction which defines a logical set of Pods and a policy by which to access them.
**Volume** - an abstraction which allows data to be preserved across container restarts and allows data to be shared between different containers.

Namespace - a way to divide a physical cluster resources into multiple virtual clusters between multiple users.
**Deployment** - Manages pods and ensures a certain number of them are running. This is typically used to deploy pods that should always be up, such as a web server.

**Job** - A job creates one or more pods and ensures that a specified number of them successfully terminate. In other words, we use Job to run a task that finishes at some point, such as training a model.
## 2.1. Deployment

`Deployment` 提供了Pods 和 ReplicaSets的更新说明。

```
A Deployment provides declarative updates for Pods and ReplicaSets.
```


　　Kubernetes提供了一种更加简单的更新RC和Pod的机制，叫做Deployment。通过在Deployment中描述你所期望的集群状态，Deployment Controller会将现在的集群状态在**一个可控的速度下逐步更新成你所期望的集群状态**。

Deployment主要职责同样是为了
1. 保证pod的数量和健康，90%的功能与Replication Controller完全一样，可以看做新一代的Replication Controller。
 
但是，它又具备了Replication Controller之外的新特性：
1. Replication Controller全部功能：Deployment继承了上面描述的Replication Controller全部功能。
2. 事件和状态查看：可以查看Deployment的升级详细进度和状态。
3. 回滚：当升级pod镜像或者相关参数的时候发现问题，可以使用回滚操作回滚到上一个稳定的版本或者指定的版本。
4. 版本记录: 每一次对Deployment的操作，都能保存下来，给予后续可能的回滚使用。
5. 暂停和启动：对于每一次升级，都能够随时暂停和启动。
6. 多种升级方案：Recreate----删除所有已存在的pod,重新创建新的; RollingUpdate----滚动升级，逐步替换的策略，同时滚动升级时，支持更多的附加参数，例如设置最大不可用pod数量，最小升级间隔时间等等。

## 2.2. Service
事实上，Pod（容器组）有自己的生命周期。当 worker node（节点）故障时，节点上运行的 Pod（容器组）也会消失。然后，Deployment 可以通过创建新的 Pod（容器组）来动态地将群集调整回原来的状态，以使应用程序保持运行。

举个例子，假设有一个图像处理后端程序，具有 3 个运行时副本。这 3 个副本是可以替换的（无状态应用），即使 Pod（容器组）消失并被重新创建，或者副本数由 3 增加到 5，前端系统也无需关注后端副本的变化。由于 Kubernetes 集群中每个 Pod（容器组）都有一个唯一的 IP 地址（即使是同一个 Node 上的不同 Pod），我们需要一种机制，**为前端系统屏蔽后端系统的 Pod（容器组）在销毁、创建过程中所带来的 IP 地址的变化。**

```
后端pod可能一直在创建、变化、湮灭，但是要让前端没有感觉ip变化
```
Kubernetes 中的 Service（服务） 提供了这样的一个抽象层，它**1.选择**具备某些特征的 Pod（容器组）并为它们**2.定义**一个访问方式。

Service（服务）使 Pod（容器组）之间的相互依赖解耦（原本从一个 Pod 中访问另外一个 Pod，需要知道对方的 IP 地址）。一个 Service（服务）选定哪些 Pod（容器组） 通常由 LabelSelector(标签选择器) 来决定。

在创建Service的时候，通过设置配置文件中的 spec.type 字段的值，可以以不同方式向外部暴露应用程序：

如果Pods是短暂的，那么重启时IP地址可能会改变，怎么才能从前端容器正确可靠地指向后台容器呢？ 现在，假定有2个后台Pod，并且定义后台Service的名称为‘backend-service’，label选择器为(tier=backend, app=myapp) 的Service会完成如下两件重要的事情：

1. 会为Service创建一个本地集群的DNS入口，因此前端Pod只需要DNS查找主机名为`backend-service`，就能够解析出前端应用程序可用的IP地址。
2. 现在前端已经得到了后台服务的IP地址，但是它应该访问2个后台Pod的哪一个呢？Service在这2个后台Pod之间提供**透明的负载均衡**，会将请求分发给其中的任意一个（如下面的动画所示）。通过每个Node上运行的代理（kube-proxy）完成。


**ClusterIP（默认）**
在群集中的内部IP上公布服务，这种方式的 Service（服务）只在集群内部可以访问到

**NodePort**
使用 NAT 在集群中每个的同一端口上公布服务。这种方式下，可以通过访问集群中任意节点+端口号的方式访问服务 <NodeIP>:<NodePort>。此时 ClusterIP 的访问方式仍然可用。

**LoadBalancer**
在云环境中（需要云供应商可以支持）创建一个集群外部的负载均衡器，并为使用该负载均衡器的 IP 地址作为服务的访问地址。此时 ClusterIP 和 NodePort 的访问方式仍然可用。


## 2.3. Namespace

```shell
# wiki
In computing, a namespace is a set of symbols that are used to organize objects of various kinds, so that these objects may be referred to by name. 
```
名称空间是一个符合集合，用于组织不同类型的对象，使得这些对象可以通过name被调用。

名字空间（英语：Namespace），也称**命名空间**、名称空间等，它表示着一个标识符（identifier）的可见范围。一个标识符可在多个名字空间中定义，它在不同名字空间中的含义是互不相干的。这样，在一个新的名字空间中可定义任何标识符，它们不会与任何已有的标识符发生冲突，因为已有的定义都处于其他名字空间中。

在编程语言中，名字空间是对作用域的一种特殊的抽象，它包含了处于该作用域内的标识符，且本身也用一个标识符来表示，这样便将一系列在逻辑上相关的标识符用一个标识符组织了起来。

### 2.3.1. kubernetes 中的Namespace
名称空间的用途是，为不同团队的用户（或项目）提供虚拟的集群空间，也可以用来区分开发环境/测试环境、准上线环境/生产环境。

名称空间 **Namespace** 为名称 **Name**提供了作用域。名称空间内部的同类型对象不能重名，但是跨名称空间可以有同名同类型对象。名称空间不可以嵌套，**任何一个Kubernetes对象只能在一个名称空间中**。

名称空间可以用来在不同的团队（用户）之间划分集群的资源。
在Kubernetes将来的版本中，同名称空间下的对象将默认使用相同的访问控制策略。
当Kubernetes对象之间的差异不大时，无需使用名称空间来区分，例如，同一个软件的不同版本，只需要使用 labels 来区分即可。

```shell
kubectl get namespaces
>>>
NAME              STATUS   AGE
default           Active   24h # 默认生成
istio-system      Active   22h
knative-serving   Active   22h
kube-node-lease   Active   24h
kube-public       Active   24h #默认生成
kube-system       Active   24h #默认生成
kubeflow          Active   22h
tensorflow        Active   4h13m
```


Kubernetes 安装成功后，默认有初始化了3个名称空间：
1. `default` 默认名称空间，如果 Kubernetes 对象中不定义 metadata.namespace 字段，该对象将放在此名称空间下
2. `kube-system` Kubernetes系统创建的对象放在此名称空间下
3. `kube-public` 此名称空间自动在安装集群是自动创建，并且所有用户都是可以读取的（即使是那些未登录的用户）。主要是为集群预留的，例如，某些情况下，某些Kubernetes对象应该被所有集群用户看到。

## 2.4. pod

```shell
# 在指定Namespace下 运行 pod
kubectl run nginx --image=nginx --namespace=<您的名称空间>
kubectl get pods --namespace=<您的名称空间>
```

```shell
kubectl config set-context --current --namespace=<您的名称空间>
# 验证结果
kubectl config view --minify | grep namespace:
```

并非所有对象都在名称空间里
大部分的 Kubernetes 对象（例如，Pod、Service、Deployment、StatefulSet等）都必须在名称空间里。但是某些更低层级的对象，是不在任何名称空间中的，例如 nodes、persistentVolumes、storageClass 等

执行一下命令可查看哪些 Kubernetes 对象在名称空间里，哪些不在：

```shell
# 在名称空间里
kubectl api-resources --namespaced=true

# 不在名称空间里
kubectl api-resources --namespaced=false
```





# 4. 容器镜像

## 4.1. 镜像拉取策略

1. 默认的镜像拉取策略是“IfNotPresent”，在镜像已经存在的情况下，kubelet将不在去拉取镜像。 
2. 如果总是想要拉取镜像，必须设置拉取策略为“Always”或者设置镜像标签为“:latest”。

## 4.2. 镜像仓库

Kubernetes 的 Pod 中使用容器镜像之前，您必须将其推送到一个镜像仓库（或者使用仓库中已经有的容器镜像）。

在 Kubernetes 的 Pod 定义中定义容器时，必须指定容器**所使用的镜像**，容器中的 image 字段支持与 docker 命令一样的语法，包括私有镜像仓库和标签。


在 Kubernetes 中，**没有针对镜像仓库的集群级别配置**，节点各自维护自己的仓库地址，如果需要增加仓库地址，需要修改集群中所有节点配置文件，重启 docker 生效。


针对 k8s 中私有仓库的使用更新：

当 k8s 想要配置 http 私有仓库时，只能通过在节点上修改 docker 配置文件 /etc/docker/daemon.json ，添加 “insecure-registries” 字段，并重启 docker 后，k8s 可以自动拉取所需镜像。

当 k8s 配置 https 私有仓库时，只需将根证书拷贝到 k8s 节点的 /etc/docker/certs.d/<domain.com>/ 下，创建 k8s secret docker-registry ，在 YAML 中指定拉取镜像所需的 secret，就可以自动拉取了。
可以在 k8s 中配置指定仓库的 secret 类型为 docker-registry 来配置私有仓库的用户名密码，在之后创建 Pod 时指定该 secret 名称即可自动下载，具体操作如下：
```shell
[root@node3 ~]# kubectl create secret docker-registry regsecret --docker-server=192.168.30.111 --docker-username=admin --docker-password=Harbor12345 --docker-email=yiran@smartx.com
[root@node3 ~]# kubectl get secret regsecret -o yaml
[root@node3 ~]# cat private-reg-pod.yaml 
apiVersion: v1
kind: Pod
metadata:
  name: private-reg
spec:
  nodeSelector:
    type: "233"
  containers:
  - name: private-reg-container
    image: 192.168.30.111/test/busybox:latest
    args: [/bin/sh, -c,
           'i=0; while true; do echo "$i: $(date)"; i=$((i+1)); sleep 1; done']
  imagePullSecrets:
  - name: regsecret
```


在集群中创建保存授权令牌的 Secret
Kubernetes 集群使用 docker-registry 类型的 Secret 来通过容器仓库的身份验证，进而提取私有映像。

创建 Secret，命名为 regcred：

kubectl create secret docker-registry regcred --docker-server=<your-registry-server> --docker-username=<your-name> --docker-password=<your-pword> --docker-email=<your-email>
在这里：

<your-registry-server> 是你的私有 Docker 仓库全限定域名（FQDN）。(参考 https://index.docker.io/v1/ 中关于 DockerHub 的部分)
<your-name> 是你的 Docker 用户名。
<your-pword> 是你的 Docker 密码。
<your-email> 是你的 Docker 邮箱。
这样您就成功地将集群中的 Docker 凭据设置为名为 regcred 的 Secret。

检查 Secret regcred
要了解你创建的 regcred Secret 的内容，可以用 YAML 格式进行查看：

kubectl get secret regcred --output=yaml
输出和下面类似：

apiVersion: v1
data:
  .dockerconfigjson: eyJodHRwczovL2luZGV4L ... J0QUl6RTIifX0=
kind: Secret
metadata:
  ...
  name: regcred
  ...
type: kubernetes.io/dockerconfigjson
.dockerconfigjson 字段的值是 Docker 凭据的 base64 表示。

要了解 dockerconfigjson 字段中的内容，请将 Secret 数据转换为可读格式：

kubectl get secret regcred --output="jsonpath={.data.\.dockerconfigjson}" | base64 --decode
输出和下面类似：

{"auths":{"yourprivateregistry.com":{"username":"janedoe","password":"xxxxxxxxxxx","email":"jdoe@example.com","auth":"c3R...zE2"}}}
要了解 auth 字段中的内容，请将 base64 编码过的数据转换为可读格式：

echo "c3R...zE2" | base64 --decode
输出结果中，用户名和密码用 : 链接，类似下面这样：

janedoe:xxxxxxxxxxx
注意，Secret 数据包含与本地 ~/.docker/config.json 文件类似的授权令牌。

这样您就已经成功地将 Docker 凭据设置为集群中的名为 regcred 的 Secret。

创建一个使用您的 Secret 的 Pod
下面是一个 Pod 配置文件，它需要访问 regcred 中的 Docker 凭据：

pods/private-reg-pod.yaml Copy pods/private-reg-pod.yaml to clipboard
apiVersion: v1
kind: Pod
metadata:
  name: private-reg
spec:
  containers:
  - name: private-reg-container
    image: <your-private-image>
  imagePullSecrets:
  - name: regcred

下载上述文件：

wget -O my-private-reg-pod.yaml https://k8s.io/examples/pods/private-reg-pod.yaml
在my-private-reg-pod.yaml 文件中，使用私有仓库的镜像路径替换 <your-private-image>，例如：

janedoe/jdoe-private:v1
要从私有仓库拉取镜像，Kubernetes 需要凭证。 配置文件中的 imagePullSecrets 字段表明 Kubernetes 应该通过名为 regcred 的 Secret 获取凭证。

创建使用了你的 Secret 的 Pod，并检查它是否正常运行：

kubectl create -f my-private-reg-pod.yaml
kubectl get pod private-reg






# 5. 参考资料


1. [官方]网络插件：https://kubernetes.io/zh/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/

2. https://kuboard.cn/learning/k8s-basics/k8s-core-concepts.html#service



