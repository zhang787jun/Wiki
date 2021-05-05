---
title: "Storage Dynamic Provisioning"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 背景
##  1.1. 什么是 Dynamic Provisioning

**场景**
每一个PV是都是运维人员来人工创建的（静态供给，Static Provisioning），开发操作PVC

---当PV多了之后是一件很繁琐的事情---

提出动态供给（Dynamic Provisioning）概念，使用，StorageClass，


# 2. StorageClass 基础
## 2.1. 什么是StorageClass
![](https://kuboard.cn/assets/img/image-20190906074512760.92b15a35.png)

>A StorageClass provides a way for administrators to describe the "classes" of storage they offer.

StorageClass （存储类）为管理员提供了描述他们提供的存储 “class（类）” 的方法。



Kubernetes 提供 19 种存储类 Provisioner，但是绝大多数与具体的云环境相关，如 AWSElasticBlockStore / AzureFile / AzureDisk / GCEPersistentDisk 等。



## 2.2. yaml 内容

`StorageClass` 对象会定义下面两部分内容:
    1. PV的**属性**（比如:存储类型,Volume的大小等）
    2. 创建这种PV需要用到的**存储插件**

```yaml

kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: standard # # StorageClass 对象的名称很重要，这是用户请求一个特定的类的方法
provisioner: kubernetes.io/aws-ebs # 该字段必须指定，必须为特定的那几种
parameters:
  type: gp2
reclaimPolicy: Retain
mountOptions:
  - debug
```



## 2.3. 支持的provisioner
### 2.3.1. 原生provisioner
原生provisioner分配器（其名称前缀为 kubernetes.io 并打包在 Kubernetes 中）
Volume Plugin|Internal Provisioner|Config Example
--|--|--|
AWSElasticBlockStore|✓|AWS
AzureFile|✓|Azure File
AzureDisk|✓|Azure Disk
CephFS|-|-
Cinder|✓|OpenStack Cinder
FC|-|-
FlexVolume|-|-
Flocker|✓|-
GCEPersistentDisk|✓|GCE
Glusterfs|✓|Glusterfs
iSCSI|-|-
PhotonPersistentDisk|✓|-
Quobyte|✓|Quobyte
NFS|-|-
RBD|✓|Ceph RBD
VsphereVolume|✓|vSphere
PortworxVolume|✓|Portworx Volume
ScaleIO|✓|ScaleIO
StorageOS|✓|StorageOS

### 2.3.2. 其他 provisioner
例如，NFS 没有内部分配器，但可以使用外部分配器


## 2.4. 运行原理

![](https://img2018.cnblogs.com/i-beta/911490/202001/911490-20200115135841991-1378803950.png)



有了StorageClass的这两个信息之后,Kubernetes就能够根据用户提交的PVC,找到一个对应的StorageClass,之后Kubernetes就会调用该StorageClass声明的存储插件,进而创建出需要的PV



## 2.5. 回收策略



由 storage class 动态创建的 Persistent Volume 会在的 reclaimPolicy 字段中指定回收策略，

1. `Delete` ：(默认)当PVC被删除时，基础的PV和对应的存储也会被删除
2. `Retain`


# 3. StorageClass 操作

## 3.1. 创建 StorageClass


你只需要根据自己的需求,编写YAML文件即可,然后使用kubectl create命令执行即可

```shell
cat << EOF >StorageClass.yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: azurefile
provisioner: kubernetes.io/azure-file
mountOptions:
  - dir_mode=0777
  - file_mode=0777
  - uid=1000
  - gid=1000
parameters:
  skuName: Standard_LRS
EOF
kubectl create -f StorageClass.yaml
# 一旦创建了对象就不能对其更新。
```


## 3.2. 查看SC 信息


```shell
kubectl get sc
>>>

NAME                             PROVISIONER    AGE
kubeflow-nfs-storage (default)   kubeflow/nfs   5d8h
```

## 3.3. 修改SV配置

```shell
# 通过kubectl patch 打补丁的方式修改meta data 
## 设置默认
kubectl patch storageclass managed-nfs-storage -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}' #取消默认存储后端

## 取消默认
kubectl patch storageclass alicloud-disk-ssd -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
```

## 通过SC 创建PVC
```shell
# 创建PVC
cat << EOF >test-claim.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mytomcat-pvc
spec:
  storageClassName:  kubeflow-nfs-storage
  accessModes:
    - ReadWriteMany
  resources: 
    requests:
      storage: 500Mi
EOF
kubectl apply -f test-claim.yaml
``` 

# 4. 实例



## 4.1. Azure

```yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: azurefile
provisioner: kubernetes.io/azure-file
mountOptions:
  - dir_mode=0777
  - file_mode=0777
  - uid=1000
  - gid=1000
parameters:
  skuName: Standard_LRS

```

# 5. 参考资料


1. [中文官方：Kubernetes Storage Classes](http://docs.kubernetes.org.cn/803.html#i)