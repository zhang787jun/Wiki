---
title: "Kubeflow--101"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 概述

Kubeflow 是 Google 发布的用于在 Kubernetes 集群中部署和管理分布式机器学习工作流的框架，其致力于使机器学习（ML）工作流在Kubernetes上的部署简单，可移植且可扩展。

tensorflow 任务的框架。主要功能包括
1. 用于管理 Jupyter 的 JupyterHub
2. 用于管理训练任务的 Controller
3. 用于模型服务的 Serving 容器

**Kubeflow核心组件介绍**：
1. JupyterHub 服务： 多租户NoteBook服务
2. Tensorflow PyTorch MPI MXnet Chainer 当前主要支持的机器学习引擎
3. Seldon 提供在Kubernetes上对机器学习模型的部署
4. TF-Serving 提供对Tensorflow模型的在线部署，支持版本控制及无需停止线上服务，切换模型等功能
5. Argo 基于Kubernetes的工作流引擎
6. Ambassador 对外提供统一服务的网关(API Gateway)
7. Istio 提供微服务的管理，Telemetry收集
8. Ksonnet Kubeflow使用ksonnet来向kubernetes集群部署需要的k8s资源
9. Hyperparameter Tuning 在Kubeflow 进行机器学习调参
10. Pipelines ： Kubeflow的机器学习管道


`Kubeflow` 使用 `ksonnet` 模板作为打包、发布不同组件

**Kubeflow利用Kubernetes的优势**:
1. 原生的资源隔离
2. 集群化自动化管理
3. 计算资源(CPU/GPU)自动调度
4. 对多种分布式存储的支持
5. 集成较为成熟的监控，告警
6. 将机器学习各个阶段涉及的组件已微服务的方式进行组合并已容器化的方式进行部署，提供整个流程各个系统的高可用及方便的进行扩展。


我们的目标是使缩放机器学习（ML）模型和将其部署到生产中尽可能简单，让Kubernetes做它擅长的事情：
1. 在不同的基础设施上轻松、可重复、可移植的部署（例如，在笔记本电脑上进行实验，然后移动到本地群集或云端）
2. 部署和管理松散耦合的微服务
3. 按需缩放

因为ML实践者使用不同的工具集，其中一个关键目标是根据用户需求（在合理的范围内）定制堆栈，并让系统处理“无聊的事情”。虽然我们从一系列技术开始，但我们正在处理许多不同的项目，以包括其他工具。
最后，我们希望有一组简单的清单，让您在Kubernetes已经运行的任何地方都可以使用一个易于使用的ML堆栈，并且可以根据它部署到的集群进行自我配置。

## 1.1. 架构

List of Kubeflow components available
1. Ambassador
2. Argo UI 界面 http://testing-argo.kubeflow.org/workflows
3. Profiles




# 2. 安装与卸载

**在现有kebernetes群集上的部署概述**

## 2.1. 最低系统要求
Kubernetes集群必须满足以下最低要求：
您的集群必须至少包含**1个工作节点**(Work node)，且最少为：
1. **4个CPU**
2. **50 GB的存储空间**
3. **12 GB内存**



**资源部署配置**


社区版本的配置

| 部署配置             | 描述                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| kfctl_k8s_istio.yaml | 此配置使用其所有核心组件创建了Kubeflow的原始部署，而没有任何外部依赖性。可以根据您的环境需求自定义部署。 |
请遵循说明：使用kfctl_k8s_istio的Kubeflow部署


```shell
mkdir -p ${KF_DIR}
cd ${KF_DIR}
kfctl apply -V -f kfctl_k8s_istio.yaml 
```

1. 供应商版本
本节包括特定供应商/提供者支持的部署解决方案。
 

| 部署配置                    | 描述                                                                                       | 维护者/支持者                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| kfctl_existing_arrikto.yaml | 此配置使用其所有核心组件创建一个Kubeflow部署，并使用Dex和Istio进行与供应商无关的身份验证。 | 请按照说明进行操作：使用kfctl_existing_arrikto的多用户，已启用身份验证的Kubeflow |

Using TFJob to train a model with TensorFlow

tensorflow on kubernetes包含三个主要的部分，分别是client、task和autospec模块

```shell
git clone https://github.com/kubeflow/tf-operator
cd tf-operator/examples/v1/mnist_with_summaries
# Deploy the event volume
kubectl apply -f tfevent-volume
# Submit the TFJob
kubectl apply -f tf_job_mnist.yaml
Monitor the job (see the detailed guide below):

kubectl -n kubeflow get tfjob mnist -o yaml
Delete it

kubectl -n kubeflow delete tfjob mnist
Customizing the TFJob
```
## 2.2. 简易安装


1. 安装ksonnet
Kubeflow 利用 ksonnet 打包和部署其组件。
首先,安装ksonnet版本 0.13.1

```shell
cd /tmp/
curl -O http://kubeflow.oss-cn-beijing.aliyuncs.com/ks_0.13.1_linux_amd64.tar.gz
tar -xvf ks_0.13.1_linux_amd64.tar.gz
cp */ks /usr/local/bin/
rm -rf ks_0.13.1_linux_amd64*
```
2. 部署PVC
和之前的版本相比，在0.4.0的版本中，KubeFlow依赖于katib-mysql,pipeline-mino,pipeline-mysql这三个有状态服务。而这些需要提前部署，您也可以根据自己的需求修改PV和PVC的配置

```shell
wget http://kubeflow.oss-cn-beijing.aliyuncs.com/storage.yaml
kubectl create namespace kubeflow
kubectl create -f storage.yaml
```

注意： 这里提供的方案是为了满足快速部署，您可以根据自身需求配置更为合理的PV和PVC配置。

下载Kubeflow的repo
```shell
KUBEFLOW_SRC=~/kubeflow-repo
mkdir ${KUBEFLOW_SRC}
cd ${KUBEFLOW_SRC}

#!/usr/bin/env bash
#
# Download the registry and scripts.
# This is the first step in setting up Kubeflow.
# Downloads it to the current directory
set -ex

if [ ! -z "${KUBEFLOW_VERSION}" ]; then
  KUBEFLOW_TAG=v${KUBEFLOW_VERSION}
fi

KUBEFLOW_TAG=${KUBEFLOW_TAG:-aliyun}

# Create a local copy of the Kubeflow source repo
TMPDIR=$(mktemp -d /tmp/tmp.kubeflow-repo-XXXX)
curl -L -o ${TMPDIR}/kubeflow.tar.gz ~/kfctl_v0.7.0_linux0_linux.tar.gz
tar -xzvf ${TMPDIR}/kubeflow.tar.gz -C ${TMPDIR}

# tar -xzvf /root/kfctl_v0.7.0_linux.tar.gz -C ${TMPDIR}
# GitHub seems to strip out the v in the file name.
KUBEFLOW_SOURCE=$(find ${TMPDIR} -maxdepth 1 -type d -name "kubeflow*")

# Copy over the directories we need
cp -r ${KUBEFLOW_SOURCE}/kubeflow ./
cp -r ${KUBEFLOW_SOURCE}/scripts ./
cp -r ${KUBEFLOW_SOURCE}/deployment ./
```

在阿里云上安装Kubeflow
由于国内访问Google默认的的镜像仓库不稳定，请您在选择platform时候，指定云平台为ack( Alibaba Cloud Kubernetes)
```

export KFAPP=mykubeflow

cd ~
${KUBEFLOW_SRC}/scripts/kfctl.sh init ${KFAPP} --platform ack
cd ${KFAPP}
${KUBEFLOW_SRC}/scripts/kfctl.sh generate platform
${KUBEFLOW_SRC}/scripts/kfctl.sh apply platform
${KUBEFLOW_SRC}/scripts/kfctl.sh generate k8s
${KUBEFLOW_SRC}/scripts/kfctl.sh apply k8s
```
注意：第一次执行${KUBEFLOW_SRC}/scripts/kfctl.sh apply k8s的时候，会报出如下错误：

error.jpg

此时不用担心，这是Kubeflow的已知issue,可以重新执行一次apply命令解决。

${KUBEFLOW_SRC}/scripts/kfctl.sh apply k8s



1. 下载 kfctl.sh

```shell
mkdir kubeflow
cd kubeflow
export KUBEFLOW_TAG=v0.3.5 # 这个是你想安装的版本
curl https://raw.githubusercontent.com/kubeflow/kubeflow/${KUBEFLOW_TAG}/scripts/download.sh | bash
```



部署并启动kubeflow
scripts/kfctl.sh init config --platform none # kubeflow-config 是你想放置配置文件的目录，可以替换成任何你想要的
cd config
../scripts/kfctl.sh generate k8s
../scripts/kfctl.sh apply k8s


2. 更换被墙的镜像

运行下面的命令：

```shell
kubectl -n kubeflow get pod
```

你会发现有些 pod 出现了 ImagePullBackOff 的错误，这是因为它们所用的镜像是http://gcr.io下的，所以无法下载，这时，我们需要更换镜像从国内镜像网站下载：

可以参照 Docker镜像获取（gcr.io等） 来进行安装，这里以一个镜像来举例：

使用上面的镜像我们可以看到

```shell
tf-hub-0    0/1     ImagePullBackOff    0          5m35s

```

所以我们首先看一下event：

```shell 
kubectl -n kubeflow describe pod tf-hub-0

```

然后可以看到pod的event是：


```shell 
mkdir kubeflow
cd kubeflow
export KUBEFLOW_TAG=v0.3.5 # 这个是你想安装的版本

curl https://raw.githubusercontent.com/kubeflow/kubeflow/${KUBEFLOW_TAG}/scripts/download.sh | bash
```



## 2.3. 阿里非官方版本（亲试成功）
```shell
# 创建Kubeflow运行的namespace
NAMESPACE=kubeflow
kubectl create namespace ${NAMESPACE}

# 指定特有版本
VERSION=jupyterhub-alibaba-cloud
# 初始化Kubeflow应用，并且将其namespace设置为default环境
APP_NAME=my-kubeflow
ks init ${APP_NAME}
cd ${APP_NAME}
ks env set default --namespace ${NAMESPACE}
# 仓库添加Kubeflow 模块
ks registry add kubeflow github.com/cheyang/kubeflow/tree/${VERSION}/kubeflow
#查看是否添加成功
ks registry list

# 安装 packages
ks pkg install kubeflow/core@${VERSION}
ks pkg install kubeflow/tf-serving@${VERSION}
ks pkg install kubeflow/tf-job@${VERSION}
# 创建核心模块的模板
ks generate kubeflow-core kubeflow-core
# 支持运行在阿里云Kubernetes容器服务

ks param set kubeflow-core cloud ack
ks param set kubeflow-core jupyterHubImage registry.aliyuncs.com/kubeflow-images-public/jupyterhub-k8s:1.0.1
ks param set kubeflow-core tfJobImage registry.cn-hangzhou.aliyuncs.com/kubeflow-images-public/tf_operator:v20180326-6214e560
ks param set kubeflow-core tfAmbassadorImage datawire/ambassador
ks param set kubeflow-core tfStatsdImage datawire/statsd
ks param set kubeflow-core jupyterNotebookRegistry registry.aliyuncs.com
ks param set kubeflow-core JupyterNotebookRepoName kubeflow-images-public

# 这里为了使用简单，将服务以LoadBalancer的方式暴露，这样可以直接通过阿里云SLB的ip访问。
# ks param set kubeflow-core jupyterHubServiceType LoadBalancer
# ks param set kubeflow-core tfAmbassadorServiceType LoadBalancer
# ks param set kubeflow-core tfJobUiServiceType LoadBalancer

ks param set kubeflow-core jupyterHubServiceType NodePort
ks param set kubeflow-core tfAmbassadorServiceType NodePort
ks param set kubeflow-core tfJobUiServiceType NodePort

# 部署KubeFlow
ks apply default -c kubeflow-core
```





## 2.4. 阿里镜像1.0版本


```shell
# 1. 安装kfctl
wget http://kubeflow.oss-cn-beijing.aliyuncs.com/kfctl_v1.0-0-g94c35cf_linux.tar.gz
tar zxvf kfctl_v1.0-0-g94c35cf_linux.tar.gz
sudo mv kfctl /usr/bin/
```


```shell
# 2. 通过kfctl应用配置文件
export KF_NAME=my-kubeflow-1
export BASE_DIR=/home
export KF_DIR=${BASE_DIR}/${KF_NAME}
export CONFIG_URI="http://kubeflow.oss-cn-beijing.aliyuncs.com/kfctl_k8s_istio.v1.0.1.yaml"
sudo mkdir -p ${KF_DIR}
sudo chmod -R 777 ${KF_DIR}
cd ${KF_DIR}
kfctl build -V -f ${CONFIG_URI}
export CONFIG=${KF_DIR}/kfctl_k8s_istio.v1.0.1.yaml
```



```shell
# 3. 设置存储机制
## 3.1 确保k8s 的pvc 机制正常
# sudo apt install nfs-kernel-server

## 3.2 
cat << EOF > local_pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pipeline-mysql-pv
  namespace: kubeflow
  labels:
    type: local
    app: pipeline-mysql-pv
    key: kubeflow-pv
spec:
  capacity:
    storage: 20Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/pipeline-mysql
    type: DirectoryOrCreate
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pipeline-minio-pv
  namespace: kubeflow
  labels:
    type: local
    app: pipeline-minio-pv
    key: kubeflow-pv
spec:
  capacity:
    storage: 20Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/pipeline-minio
    type: DirectoryOrCreate
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: katib-mysql
  namespace: kubeflow
  labels:
    type: local
    app: katib-mysql
spec:
  capacity:
    storage: 20Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/katib-mysql
    type: DirectoryOrCreate
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: metadata-mysql-pv
  namespace: kubeflow
  labels:
    type: local
    app: metadata-mysql-pv
    key: kubeflow-pv
spec:
  capacity:
    storage: 20Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/metadata-mysql
    type: DirectoryOrCreate
EOF
kubectl create -f local_pv.yaml
```



```shell
for i in $(seq 1 4); do
cat <<EOF | kubectl create -f -
apiVersion: v1
kind: PersistentVolume
metadata:
    name: kubeflow-pv${i}
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  nfs:
    server: 172.18.43.250
    path: /ssd/nfs-data/kubeflow/kubeflow-pv${i}
EOF
 done
```



```shell

$ kubectl create -f deploy/auth/serviceaccount.yaml
serviceaccount "nfs-client-provisioner" created
$ kubectl create -f deploy/auth/clusterrole.yaml
clusterrole "nfs-client-provisioner-runner" created
$ kubectl create -f deploy/auth/clusterrolebinding.yaml
clusterrolebinding "run-nfs-client-provisioner" created
$ kubectl patch deployment nfs-client-provisioner -p '{"spec":{"template":{"spec":{"serviceAccount":"nfs-client-provisioner"}}}}'

```

```shell
cat << EOF > my_nfs.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: nfs-client-provisioner
---
kind: Deployment
apiVersion: extensions/v1beta1
metadata:
  name: nfs-provisioner
spec:
  replicas: 1
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: nfs-provisioner
    spec:
      serviceAccount: nfs-client-provisioner
      containers:
        - name: nfs-provisioner
          image: registry.cn-hangzhou.aliyuncs.com/open-ali/nfs-client-provisioner
          volumeMounts:
            - name: nfs-client-root
              mountPath: /persistentvolumes
          env:
            - name: PROVISIONER_NAME
              value: kubeflow/nfs
            - name: NFS_SERVER
              value: 172.18.43.250
            - name: NFS_PATH
              value: /ssd/nfsdata/kubeflow/defstor
      volumes:
        - name: nfs-client-root
          nfs:
            server: 172.18.43.250
            path: /ssd/nfsdata/kubeflow/defstor
EOF
kubectl create -f my_nfs.yaml
```



```shell
cat << EOF > my_clusterrole.yaml
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: run-nfs-client-provisioner
subjects:
  - kind: ServiceAccount
    name: nfs-client-provisioner
    namespace: kubeflow-anonymous
roleRef:
  kind: ClusterRole
  name: nfs-client-provisioner-runner
  apiGroup: rbac.authorization.k8s.io
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: nfs-client-provisioner-runner
rules:
  - apiGroups: [""]
    resources: ["persistentvolumes"]
    verbs: ["get", "list", "watch", "create", "delete"]
  - apiGroups: [""]
    resources: ["persistentvolumeclaims"]
    verbs: ["get", "list", "watch", "update"]
  - apiGroups: ["storage.k8s.io"]
    resources: ["storageclasses"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["list", "watch", "create", "update", "patch"]
EOF
kubectl create -f my_clusterrole.yaml

```




```shell
cat << EOF > my_StorageClass.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: kubeflow-nfs-storage
provisioner: kubeflow/nfs
EOF
kubectl create -f my_StorageClass.yaml
```

```shell
kfctl apply -V -f ${CONFIG}

```

**问题1**：安装的时候，一班需要多次运行kfctl apply命令出现如下问题
```shell
WARN[0598] Encountered error applying application tf-job-crds:  (kubeflow.error): Code 500 with message: Apply.Run  Error error when applying patch:
............
for: "/tmp/kout686424655": CustomResourceDefinition.apiextensions.k8s.io "tfjobs.kubeflow.org" is invalid: [spec.version: Invalid value: "v1beta1": must match the first version in spec.versions, status.storedVersions[0]: Invalid value: "v1beta1": must appear in spec.versions]
```
我是通过先执行删除命令，之后又重新安装就可以了

```shell
kubectl kustomize  kustomize/tf-job-crds/ | kubectl delete -f -
kubectl kustomize  kustomize/tf-job-crds/ | kubectl apply -f -
```
## 2.5. 官方版本

```shell
set -ex

if [ ! -z "${KUBEFLOW_VERSION}" ]; then
  KUBEFLOW_TAG=v${KUBEFLOW_VERSION}
fi

KUBEFLOW_TAG=${KUBEFLOW_TAG:-master}

# Create a local copy of the Kubeflow source repo
TMPDIR=$(mktemp -d /tmp/tmp.kubeflow-repo-XXXX)
curl -L -o ${TMPDIR}/kubeflow.tar.gz https://github.com/kubeflow/kubeflow/archive/${KUBEFLOW_TAG}.tar.gz

tar -xzvf ${TMPDIR}/kubeflow.tar.gz -C ${TMPDIR}
# GitHub seems to strip out the v in the file name.
KUBEFLOW_SOURCE=$(find ${TMPDIR} -maxdepth 1 -type d -name "kubeflow*")

# Copy over the directories we need
cp -r ${KUBEFLOW_SOURCE}/kubeflow ./
cp -r ${KUBEFLOW_SOURCE}/scripts ./
cp -r ${KUBEFLOW_SOURCE}/deployment ./
```






# 3. 运维与查看 

```shell
# 查看Kubeflow下的pod是否启动正常
kubectl get pods -n kubeflow
>>>

kubectl get svc -n istio-system istio-ingressgateway
```

# 4. 使用

## 4.2. 查看状态

```shell
kubectl get service tf-hub-lb  -n kubeflow
>>>
NAME        TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
tf-hub-lb   LoadBalancer   10.109.167.223   172.16.3.4    8000:30962/TCP   34m
```

验证部署
查看相关的Pod是否处于Running状态
```shell
kubectl get po -n kubeflow
>>>
NAME                                READY     STATUS    RESTARTS   AGE
ambassador-58f64cb77-9cqq2          2/2       Running   0          3h
ambassador-58f64cb77-fqn8x          2/2       Running   0          3h
ambassador-58f64cb77-g8pb6          2/2       Running   0          3h
centraldashboard-648d5f56d9-xp9c8   1/1       Running   0          3h
tf-hub-0                            1/1       Running   0          3h
tf-job-dashboard-759c7d4dd-6mj2j    1/1       Running   0          3h
tf-job-operator-7684bcf66b-qqvt8    1/1       Running   0          3h


kubectl proxy & kubectl get namespace $NAMESPACE -o json |jq '.spec = {"finalizers":[]}' >temp.json
curl -k -H "Content-Type: application/json" -X PUT --data-binary @temp.json 127.0.0.1:8001/api/v1/namespaces/$NAMESPACE/finalize

```

# 5. 使用流程

To use Kubeflow, the basic workflow is:

1. 下载安装二进制文件 Download and run the Kubeflow deployment binary.
2. 定义配置文件
3. 运行特定脚本发布容器到特定环境中 
{"nvidia.com/gpu": "1"}

# 6. Spawner

https://jupyterhub.readthedocs.io/en/stable/reference/spawners.html


# 7. Kubeflow UI
查看Service中，可以看到kubeflow中，附附带了许多Web UI:

1. Argo UI
2. Central UI for navigation
3. JupyterHub
4. Katib
5. TFJobs Dashboard


# 参考资料 

1.[阿里云Kubeflow 1.0 上线： 体验生产级的机器学习平台
](https://developer.aliyun.com/article/758776)
2. 