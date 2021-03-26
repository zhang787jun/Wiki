---
title: "部署nfs-client-provisioner"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# 前言

网络文件系统，英文Network File System(NFS)，是由SUN公司研制的UNIX表示层协议(presentation layer protocol)，能使使用者访问网络上别处的文件就像在使用自己的计算机一样。


Kubernetes集群中NFS类型的存储没有内置 Provisioner。但是您可以在集群中为NFS配置外部Provisioner。

`Nfs-client-provisioner`是一个开源的NFS 外部Provisioner，利用NFS Server为Kubernetes集群提供持久化存储，并且支持动态创建PV。但是nfs-client-provisioner本身不提供NFS，需要现有的NFS服务器提供存储。


# 部署说明
`nfs-client-provisioner`在集群中以**deployment**的方式运行, **副本数为1**，以外部Provisioner在集群中运行；


使用nfs-client-provisioner定义Storage Class时， Storage Class中的provisioner必须与nfs-client-provisioner 中定义的PROVISIONER_NAME相同；

用户使用nfs-client-provisioner服务关联的StorageClass创建PVC时, nfs-client-provisioner在cfs文件系统中创建子目录, 初始化并创建PV；

nfs-client-provisioner在NFS服务器上提供PV的命名格式：${namespace}-${pvcName}-${pvName}；

PV被删除后, nfs-client-provisioner会对pv子目录进行归档或者删除操作；

nfs-client-provisioner在NFS服务器上归档PV的命名格式：archieved-${namespace}-${pvcName}-${pvName} ；

每个nfs-client-provisioner deployment对应一个CFS 文件存储，如需在集群中关联多个CFS文件存储，请参考示例部署多个nfs-client-provisioner deployment。


# 部署nfs-client-provisioner

nfs-client-provisioner在集群中以deployment的方式运行，并且nfs-client-provisioner需要访问kube-api获取PVC对象的变化。

## 授权
### RBAC
如果您的集群启用了RBAC，则必须授权provisioner。
> 从Kubernetes 1.6版本起，系统默认启用RBAC策略

详细部署说明参考下文。


创建Service Account，Yam文件下载及说明如下：
下载Yaml文件：
wget https://kubernetes.s3.cn-north-1.jdcloud-oss.com/CFS/nfs-client-provisioner/ServiceAccount.yml

Yaml文件说明：
kind: ServiceAccount
apiVersion: v1
metadata:
  name: nfs-client-provisioner
使用Yaml文件创建Service Account：
kubectl create -f ServiceAccount.yml

使用命令行创建Service Account
kubectl create serviceaccount nfs-client-provisioner #创建名称为nfs-client-provisioner的Service Account

创建Cluster Role，Yaml文件下载及说明如下：
下载Yaml文件：
wget https://kubernetes.s3.cn-north-1.jdcloud-oss.com/CFS/nfs-client-provisioner/ClusterRole.yml

Yaml文件说明：
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
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
    verbs: ["create", "update", "patch"]
使用Yaml文件创建Cluster Role：
kubectl create -f ClusterRole.yml

创建Cluster Role Binding，Yaml文件下载及说明如下：
下载Yaml文件：
wget https://kubernetes.s3.cn-north-1.jdcloud-oss.com/CFS/nfs-client-provisioner/ClusterRoleBinding.yml

Yaml文件说明：
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: run-nfs-client-provisioner
subjects:
  - kind: ServiceAccount
    name: nfs-client-provisioner
    namespace: default
roleRef:
  kind: ClusterRole
  name: nfs-client-provisioner-runner
  apiGroup: rbac.authorization.k8s.io
使用Yaml文件创建Cluster Role：
kubectl create -f ClusterRoleBinding.yml

创建Role，Yaml文件下载及说明如下：
下载Yaml文件：
wget https://kubernetes.s3.cn-north-1.jdcloud-oss.com/CFS/nfs-client-provisioner/Role.yml

Yaml文件说明：
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-nfs-client-provisioner
rules:
  - apiGroups: [""]
    resources: ["endpoints"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
使用Yaml文件创建Cluster Role：
kubectl create -f Role.yml

创建Role Binding，Yaml文件下载及说明如下：
下载Yaml文件：
wget https://kubernetes.s3.cn-north-1.jdcloud-oss.com/CFS/nfs-client-provisioner/RoleBinding.yml

Yaml文件说明：
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-nfs-client-provisioner
subjects:
  - kind: ServiceAccount
    name: nfs-client-provisioner
    # replace with namespace where provisioner is deployed
roleRef:
  kind: Role
  name: leader-locking-nfs-client-provisioner
  apiGroup: rbac.authorization.k8s.io
使用Yaml文件创建Cluster Role：
kubectl create -f RoleBinding.yml

创建 nfs-client-provisioner Deployment，Yaml文件下载及说明如下：
下载Yaml文件：
wget https://kubernetes.s3.cn-north-1.jdcloud-oss.com/CFS/nfs-client-provisioner/Deploy.yml

Yaml文件说明：
kind: Deployment
apiVersion: extensions/v1beta1
metadata:
  name: nfs-client-provisioner
spec:
  replicas: 1
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: nfs-client-provisioner
    spec:
      serviceAccountName: nfs-client-provisioner
      containers:
        - name: nfs-client-provisioner
          image: quay.io/external_storage/nfs-client-provisioner:latest
          imagePullPolicy: IfNotPresent
          volumeMounts:
            - name: nfs-client-root
              mountPath: /persistentvolumes
          env:
            - name: PROVISIONER_NAME
              value: jdcloud-cfs			#PROVISIONER_NAME的Value值与StorageClass的Provisioner字段值必须保持一致
            - name: NFS_SERVER
              value: 172.**.**.10			#请使用文件存储的挂载目标IP地址替换
            - name: NFS_PATH
              value: /cfs			#请使用挂载目标支持的目录替换，默认挂载到/cfs目录
      volumes:
        - name: nfs-client-root
          nfs:
            server: 172.**.**.10			#请使用文件存储的挂载目标IP地址替换
            path: /cfs			#请使用挂载目标支持的目录替换，默认挂载到/cfs目录
使用Yaml文件创建Deployment：
kubectl create -f Deploy.yml

四、验证nfs-client-provisioner运行状态

在集群中查看nfs-client-provisioner Deployment的运行状态，所有Pod处于running状态并且运行的副本数与期望副本数一致时，则表示nfs-client-provisioner运行成功。

kubectl get deployment
NAME                     DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
nfs-client-provisioner   1         1         1            1           42m






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