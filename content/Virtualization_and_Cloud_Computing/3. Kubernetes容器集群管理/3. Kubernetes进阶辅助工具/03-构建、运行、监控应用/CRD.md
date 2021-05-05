---
title: "CRD"
date: 2019-06-12 00:00
render: True 
---

[TOC]

为了更好的理解和阅读KubeFlow中各种Operator，我们要先了解下K8S中的CRD机制，以及如何编写一个自定义的CRD。通过本篇文件的阅读，您可以

较好的了解CRD是什么？
如何快速编写自己的CRD？
如何在K8S集群中验证开发出来的CRD的API？
# 1. CRD（CustomResourceDefinitions）是什么？
我们在日常使用K8S做编排工作时，经常会管理Deployment、StatefulSet、Service、Job等资源对象，我们可以通过对Yaml文件的编辑实现对各类资源的编排，在通过kubectl等命令，完成像集群资源的申请等操作。但是在日常业务开发过程中，虽然可以通过最基础的资源满足基本需求，但是管理起来往往会很麻烦，特别是K8S很多API都是异常完成了，对于命令执行的状态的感知会让业务代码编写的很丑。

到了K8S 1.8之后，官方提供了CRD，较好的完善了关于资源自定义的API，开发者可以将原子资源（Deploment、Service、ConfigMap、Job）等统一管理起来，用于表述整个应用程序或某个服务对象。

业务场景中想要备份一个资源，在创建它的对象时，就希望通过spec的定义进行日常的备份操作声明，通过K8S集群，所有依赖的资源自动创建好，完成相关的备份服务。

再比如，KubeFlow中在进行分布式训练时，往往需要将PS节点和Worker节点一次性的创建好，然后将创建好的网络通知到各自节点。
CRD，称之为自定义资源定义，其本质上是一段声明：用户定义用户定义的资源对象，配合K8S提供的对象控制器（CRD Controller）来实现资源的管理。接下来，我们一起实现一个简单的CRD，体验下开发的整体流程！

# 2. 开发自定义的CRD
编写CRD/Controller已经是K8S中高级玩家所需要掌握的能力了，这里面会设计到一些k8s中的较为基础的定义和常见的开发流程，需要对k8s的client，已经API具有一定的了解。如果对K8S不是很了解的同学，建议先去看些基础的K8S入门的书籍，在跟着本教程一步一步实战。

从最开始去参考K8S的源码去复制基本的开发框架，再到使用 client-gen 生成框架代码，到使用kubebuilder和operator-sdk等开源框架就可以较为快速的完成开发。可以看出K8S的流行程度。

本教程使用CoreOS公司开源的一个比较厉害的工具：Operator Framework（具体地址见附录）来快速开发一个Operator的应用。

使用Operator SDK开发的基本流程
使用SDK创建一个新的Operator项目
通过添加CRD定义新的资源API
指定使用SDK API来监听的资源
定义Operator的Reconcile逻辑
使用Operator SDK构建并生成Operator部署清单文件
安装Operator SDK
brew install operator-sdk

wuming@MacBook-Pro-2  ~/go/src/github.com/liuguiyangnwpu  operator-sdk version
operator-sdk version: "v1.3.0", commit: "1abf57985b43bf6a59dcd18147b3c574fa57d3f6", kubernetes version: "v1.19.4", go version: "go1.15.5", GOOS: "darwin", GOARCH: "amd64"
初始化工程目录
cd /Users/wuming/go/src/github.com/liuguiyangnwpu
mkdir opdemo

operator-sdk init --domain example.com --license apache2 --owner "wuming.lgy@alibaba-inc.com"

operator-sdk create api --group farm --version v1 --kind Manor
# 3. 在执行了上述命令后，会弹出如下的选项，
Create Resource [y/n]
y
Create Controller [y/n]
y
Writing scaffold for you to edit...
api/v1/manor_types.go
controllers/manor_controller.go
Running make:
$ make
/Users/wuming/go/src/github.com/liuguiyangnwpu/opdemo/bin/controller-gen object:headerFile="hack/boilerplate.go.txt" paths="./..."
go fmt ./...
go vet ./...
go build -o bin/manager main.go
当完成了上述操作后，我们就可以实现了基本的代码脚手架，具体的目录结构如下：

 wuming@MacBook-Pro-2  ~/go/src/github.com/liuguiyangnwpu/opdemo  tree -L 2
.
├── Dockerfile
├── Makefile
├── PROJECT
├── api
│   └── v1
├── bin
│   ├── controller-gen
│   └── manager
├── config
│   ├── certmanager
│   ├── crd
│   ├── default
│   ├── manager
│   ├── prometheus
│   ├── rbac
│   ├── samples
│   └── scorecard
├── controllers
│   ├── manor_controller.go
│   └── suite_test.go
├── go.mod
├── go.sum
├── hack
│   └── boilerplate.go.txt
└── main.go

14 directories, 11 files
在Goland中加载整个工程，具体的目录结构如下，其中我们需要关注的是 api 这个文件下面的manor_types.go 这个文件，还有就是对应的controllers中的 manor_controller.go 这个文件。


工程代码目录
完善基础Manor结构代码
完善Manor中的核心结构，这部分结构完全来自我们自定义该CRD需要接受那些参数，具体的结构如下：
// Manor is the Schema for the manors API
type Manor struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ManorSpec   `json:"spec,omitempty"`
	Status ManorStatus `json:"status,omitempty"`
}
其中ManorSpec这个最为重要，直接取决于用户的Yaml文件的输入定义
// ManorSpec defines the desired state of Manor
type ManorSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	Size      *int32                  `json:"size"`
	Image     string                  `json:"image"`
	Resources v1.ResourceRequirements `json:"resources,omitempty"`
	Envs      []v1.EnvVar             `json:"envs,omitempty"`
	Ports     []v1.ServicePort        `json:"ports,omitempty"`
}
这部分的代码的逻辑完全取决于我们定义的输入：

apiVersion: farm.example.com/v1
kind: Manor
metadata:
  name: nginx-app
spec:
  size: 2
  image: nginx:1.7.9
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30002
我们编写CRD的场景来自一个简单的Web服务的部署流程。在部署一个WebServer到K8S集群时，要创建Deployment、Service，并将Pod和Service的label进行关联，最后通过Ingress或者NodePort类型的Service来暴露服务。

完善Manor的Controller部分代码
我们要找到Reconcile部分代码， 至于为何会有这个逻辑，要去看K8S关于资源状态管理的机制了。具体可以阅读附录中的参考；
Reconcile 中文意思是 “调和”，“和解” 的意思，简单的说就是它不断使系统当的状态，向用户期望的状态移动。
这部分的代码内容有点长，具体可以去参考Github哈，这里简单描述下所需要做的事情；
1. 去检查当前CRD所需要的资源，如果不分在就要进行创建； 
2. 如果资源存在，则判断是否需要更新；
在集群中验证CRD
当编写完上面的代码后，需要使用 make install 的命令，将编写的CRD编译好后，安装到K8S集群中，这时需要在你的 ~/.kube/config 中有可以管理一个可用集群的配置文件。

检查是否已经安装成功
 ✘ wuming@MacBook-Pro-2  ~/go/src/github.com/liuguiyangnwpu/opdemo  kubectl get crd
NAME                                             CREATED AT
aliyunlogconfigs.log.alibabacloud.com            2020-12-23T12:47:11Z
batchreleases.alicloud.com                       2020-11-27T02:36:39Z
manors.farm.example.com                          2020-12-27T12:25:42Z
probes.monitoring.coreos.com                     2020-11-27T02:36:27Z
prometheusrules.monitoring.coreos.com            2020-11-27T02:36:28Z
servicemonitors.monitoring.coreos.com            2020-11-27T02:36:27Z
volumesnapshotclasses.snapshot.storage.k8s.io    2020-11-27T02:35:21Z
volumesnapshotcontents.snapshot.storage.k8s.io   2020-11-27T02:35:21Z
volumesnapshots.snapshot.storage.k8s.io          2020-11-27T02:35:21Z


其中，这个 CRD manors.farm.example.com 是我们安装到集群中的！
为了测试我们的CRD是否可以正常的工作，我们可以编写一个简单的Yaml文件进行测试
apiVersion: farm.example.com/v1
kind: Manor
metadata:
  name: nginx-app
spec:
  size: 2
  image: nginx:1.7.9
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30002
在控制台中使用 kubectl create -f file_name.yaml，然后在使用查看命令，查看相关资源是否已经创建好了。

 wuming@MacBook-Pro-2  /tmp  kubectl get Manor
NAME        AGE
nginx-app   41m

 wuming@MacBook-Pro-2  /tmp  kubectl get svc
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
kubernetes   ClusterIP   172.21.0.1      <none>        443/TCP        30d
nginx-app    NodePort    172.21.12.150   <none>        80:30002/TCP   40m

 wuming@MacBook-Pro-2  /tmp  kubectl get deploy
NAME        READY   UP-TO-DATE   AVAILABLE   AGE
nginx-app   2/2     2            2           40m

 wuming@MacBook-Pro-2  /tmp  kubectl get pods
NAME                         READY   STATUS    RESTARTS   AGE
nginx-app-5d998559cc-gs9z8   1/1     Running   0          41m
nginx-app-5d998559cc-xv8pn   1/1     Running   0          41m
下一讲
接下来，我们一起去阅读KubeFlow中相关Operator的代码，看看在K8S中如何利用CRD来实现各种机器学习框架的Operator的！

附录
Operator SDK 主页 https://sdk.operatorframework.io/
Operator SDK 代码 https://github.com/operator-framework/operator-sdk
K8S 配置管理最佳方法 https://www.kubernetes.org.cn/3031.html
CRD DEMO 参考教程 https://github.com/cnych/opdemo
本项目工程Github地址 https://github.com/liuguiyangnwpu/opdemo