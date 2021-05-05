---
title: "部署nfs-client-provisioner"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# 1. NFS基础

网络文件系统（Network File System，NFS），是由SUN公司研制的UNIX表示层协议(presentation layer protocol)，能使使用者访问网络上别处的文件就像在使用自己的计算机一样。



## 1.1. nfs-service 
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

**方案2**--在1个docker容器启动nfs-service 服务

```shell
# 
docker run -d\ 
--name nfs --privileged \
-p 2049:2049 -v /tmp/test:/nfsshare \
-e SHARED_DIRECTORY=/nfsshare \
itsthenetwork/nfs-server-alpine:latest
```
**参数说明**
`-e `环境变量SHARED_DIRECTORY指定的任何目录
`--net=host` 或`-p 2049:2049`通过主机网络堆栈从外部访问共享。
`-v /tmp/test` 共享的文件路径
`-e READ_ONLY=true`将导致导出文件包含ro而不是rw仅允许客户端进行读取访问。
`-e SYNC=true`将导致导出文件包含sync而不是async启用同步模式

## 1.2. nfs-client


```shell
# 安装 
sudo apt-get install -y nfs-common

# 检验/显示 nfs server 配置
showmount -e <nfs server IP>

showmount -e 10.0.77.98
>>>
Export list for 10.0.77.98:
/data/nfs_data *

# 挂载 nfs server 

sudo mount -t <type> <ip>:<server_dir> <local_dir>

sudo mount -t nfs 10.0.77.98:/data/nfs_data /data/nfs_data


# 检验挂载
df -h |grep nfs

# 取消挂载
sudo umount <local_dir>

sudo umount /data/nfs_data
```

# 2. 部署说明
Kubernetes集群中NFS类型的存储没有内置 Provisioner。但是您可以在集群中为NFS配置外部Provisioner。

`Nfs-client-provisioner`是一个开源的NFS 外部Provisioner，利用NFS Server为Kubernetes集群提供持久化存储，并且支持动态创建PV。但是nfs-client-provisioner本身不提供NFS，需要现有的NFS服务器提供存储。

`nfs-client-provisioner`在集群中以**deployment**的方式运行, **副本数为1**，以外部Provisioner在集群中运行；


使用nfs-client-provisioner定义Storage Class时， Storage Class中的provisioner必须与nfs-client-provisioner 中定义的PROVISIONER_NAME相同；

用户使用nfs-client-provisioner服务关联的StorageClass创建PVC时, nfs-client-provisioner在cfs文件系统中创建子目录, 初始化并创建PV；

nfs-client-provisioner在NFS服务器上提供PV的命名格式：
```shell
${namespace}-${pvcName}-${pvName}；
```

PV被删除后, nfs-client-provisioner会对pv子目录进行归档或者删除操作；

nfs-client-provisioner在NFS服务器上归档PV的命名格式：

```shell
archieved-${namespace}-${pvcName}-${pvName} ；
```

每个nfs-client-provisioner deployment对应一个CFS 文件存储，如需在集群中关联多个CFS文件存储，请参考示例部署多个nfs-client-provisioner deployment。


# 3. 部署步骤





## 3.1. 前提条件--开启nfs服务
1. 一个节点搭建好 nfs-server
2. 集群所有Node节点安装nfs客户端


## 3.2. 处理授权问题

从Kubernetes 1.6 版本起，k8s系统默认启用RBAC策略
如果您的集群启用了RBAC，则必须授权provisioner。 

详细部署说明参考下文。
### 3.2.1. 创建Service Account

**方法1**：通过yaml 安装
```shell

>>>
cat << EOF >ServiceAccount.yml
kind: ServiceAccount
apiVersion: v1
metadata:
  name: nfs-client-provisioner

EOF
kubectl create -f ServiceAccount.yml
```
Yaml文件如下
```Yaml

```
**方法2**：使用命令行创建
```shell
kubectl create serviceaccount nfs-client-provisioner 
```
### 3.2.2. 创建Cluster Role

```shell
wget https://kubernetes.s3.cn-north-1.jdcloud-oss.com/CFS/nfs-client-provisioner/ClusterRole.yml
kubectl create -f ClusterRole.yml
# 验证
kubectl get  ClusterRole |grep nfs
>>>
nfs-client-provisioner-runner
```
Yaml文件说明：
```yaml
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
```


### 3.2.3. 创建Cluster Role Binding

```shell
wget https://kubernetes.s3.cn-north-1.jdcloud-oss.com/CFS/nfs-client-provisioner/ClusterRoleBinding.yml
kubectl create -f ClusterRoleBinding.yml

# 验证
kubectl get  ClusterRoleBinding |grep nfs
>>>
run-nfs-client-provisioner
```
Yaml文件说明
```yaml
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
```


### 3.2.4. 创建Role

```shell
wget https://kubernetes.s3.cn-north-1.jdcloud-oss.com/CFS/nfs-client-provisioner/Role.yml
kubectl create -f Role.yml

kubectl get  Role |grep nfs
>>>
leader-locking-nfs-client-provisioner
```
Yaml文件说明：
```yaml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-nfs-client-provisioner
rules:
  - apiGroups: [""]
    resources: ["endpoints"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
```


### 3.2.5. 创建Role Binding
```shell
wget https://kubernetes.s3.cn-north-1.jdcloud-oss.com/CFS/nfs-client-provisioner/RoleBinding.yml
kubectl create -f RoleBinding.yml

kubectl get  RoleBinding |grep nfs
>>>
leader-locking-nfs-client-provisioner
```

Yaml文件说明：
```yml
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
```




### 汇总 


```shell
cat << EOF >rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: nfs-client-provisioner
  # replace with namespace where provisioner is deployed
  namespace: default        #根据实际环境设定namespace,下面类同
---
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
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: run-nfs-client-provisioner
subjects:
  - kind: ServiceAccount
    name: nfs-client-provisioner
    # replace with namespace where provisioner is deployed
    namespace: default
roleRef:
  kind: ClusterRole
  name: nfs-client-provisioner-runner
  apiGroup: rbac.authorization.k8s.io
---
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-nfs-client-provisioner
    # replace with namespace where provisioner is deployed
  namespace: default
rules:
  - apiGroups: [""]
    resources: ["endpoints"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-nfs-client-provisioner
subjects:
  - kind: ServiceAccount
    name: nfs-client-provisioner
    # replace with namespace where provisioner is deployed
    namespace: default
roleRef:
  kind: Role
  name: leader-locking-nfs-client-provisioner
  apiGroup: rbac.authorization.k8s.io

EOF
kubectl apply -f rbac.yaml

```
## 3.3. 处理存储问题

### 3.3.1. 创建nfs-client-provisioner
k8s就相当于是一个nfs的客户端。如果上述的客户端挂载成功了，k8s的挂载也一定能挂载成功。

需要提前明确的几个参数：

1. RBAC文件的namespace
2. NFS Server IP
3. NFS挂载卷
4. `PROVISIONER_NAME`
```shell
# 1. 参考上面
# 2. 需要查看
# 3. 
showmount -e <nfs server IP>
# 4. 
# PROVISIONER_NAME 自定义
```






**方案1** 
```shell
helm repo add apphub https://apphub.aliyuncs.com

helm install nfs-client-provisioner \
  --set storageClass.name=nfs-client \
  --set storageClass.defaultClass=true \
  --set nfs.server=10.0.77.99 \
  --set nfs.path=/ \
  apphub/nfs-client-provisioner
```

**方案2**
nfs-client-provisioner在集群中以deployment的方式运行，并且nfs-client-provisioner需要访问kube-api获取PVC对象的变化。
```shell
cat << EOF >nfs-client-provisioner.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nfs-client-provisioner
  labels:
    app: nfs-client-provisioner
  # replace with namespace where provisioner is deployed
  namespace: default   #与RBAC文件中的namespace保持一致
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nfs-client-provisioner
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: nfs-client-provisioner
  template:
    metadata:
      labels:
        app: nfs-client-provisioner
    spec:
      serviceAccountName: nfs-client-provisioner
      containers:
        - name: nfs-client-provisioner
          image: quay.io/external_storage/nfs-client-provisioner:latest
          volumeMounts:
            - name: nfs-client-root
              mountPath: /persistentvolumes
          env:
            - name: PROVISIONER_NAME
              value: kubeflow/nfs  #provisioner名称,请确保该名称与 nfs-StorageClass.yaml文件中的provisioner名称保持一致
            - name: NFS_SERVER
              value: 10.0.77.99   #NFS Server IP地址
            - name: NFS_PATH  
              value: /data/nfs    #NFS挂载卷
      volumes:
        - name: nfs-client-root
          nfs:
            server: 10.0.77.99   #NFS Server IP地址
            path: /data/nfs      #NFS 挂载卷
EOF
kubectl create -f nfs-client-provisioner.yaml

kubectl get deployment
>>>
NAME                     DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
nfs-client-provisioner   1         1         1            1           42m
```


### 3.3.2. 创建StorageClass
```shell
cat << EOF > nfs-StorageClass.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: kubeflow-nfs-storage
provisioner: kubeflow/nfs
EOF
kubectl create -f nfs-StorageClass.yaml

# 验证
kubectl get StorageClass
>>>
NAME                             PROVISIONER    AGE
kubeflow-nfs-storage (default)   kubeflow/nfs   3d15h
```
## 3.4. 创建 deployment


创建 `nfs-client-provisioner`的deployment
k8s中volume使用nfs类型




```yml
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
          image: registry.cn-hangzhou.aliyuncs.com/open-ali/nfs-client-provisioner:latest
          imagePullPolicy: IfNotPresent
          volumeMounts:
            - name: nfs-client-root
              mountPath: /persistentvolumes
          env:
            - name: PROVISIONER_NAME
              value: kubeflow-nfs-storage			#PROVISIONER_NAME的Value值与StorageClass的Provisioner字段值必须保持一致
            - name: NFS_SERVER
              value: 172.18.43.250			#请使用文件存储的挂载目标IP地址替换
            - name: NFS_PATH
              value: /data/k8s/nfs			#请使用挂载目标支持的目录替换，默认挂载到/cfs目录
      volumes:
        - name: nfs-client-root
          nfs:
            server: 172.18.43.250			#请使用文件存储的挂载目标IP地址替换
            path: /data/kubeflow-pv1			#请使用挂载目标支持的目录替换，默认挂载到/cfs目录

```
Yaml文件说明：
```shell
cat << EOF > Deploy.yml
kind: Namespace
apiVersion: v1
metadata:
  name: nfs
---
kind: Deployment
apiVersion: extensions/v1beta1
metadata:
  name: nfs-client-provisioner
  namespace: nfs
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
          image: registry.cn-hangzhou.aliyuncs.com/open-ali/nfs-client-provisioner:latest
          imagePullPolicy: IfNotPresent
          volumeMounts:
            - name: nfs-client-root
              mountPath: /persistentvolumes
          env:
            - name: PROVISIONER_NAME
              value: kubeflow-nfs-storage
            - name: NFS_SERVER
              value: 10.0.77.98
            - name: NFS_PATH
              value: /data/kubeflow-pv1
      volumes:
        - name: nfs-client-root
          nfs:
            server: 10.0.77.98
            path: /data/kubeflow-pv1
EOF
kubectl create -f Deploy.yml -n nfs
# 验证
kubectl get deployment
```


# 4. 卸载与删除

```shell
kubectl delete -f Deploy.yml
```

# 5. 其他k8s应用使用nfs 

## 5.1. 直接使用
应用中volume使用nfs类型
k8s就相当于是一个nfs的客户端。如果上述的客户端挂载成功了，k8s的挂载也一定能挂载成功。
最好k8s集群和nfs服务端在一个vpc下（同一局域网内）。
deployment的yaml文件大致如下

```shell
cat << EOF > deployment.yml
kind: Deployment
apiVersion: extensions/v1beta1
metadata:
  name: nginx-php7
  namespace: laravel
  labels:
    name: nginx-php7
  annotations:
    reloader.stakater.com/auto: "true"
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      name: nginx-php7
  template:
    metadata:
      labels:
        name: nginx-php7
    spec:
      containers:
        - name: nginx-php7
          image: harbor.maigengduo.com/laravel/nginx-php7:latest
          ports:
            - name: http
              containerPort: 80
              protocol: TCP
          imagePullPolicy: Always
          volumeMounts:
            - name: nfs-share
              mountPath: "/data"
      restartPolicy: Always
      volumes:
        - name: nfs-share
          nfs:
            server: 47.96.156.20
            path: "/k8s"
kubectl apply -f deployment.yaml
```


在node节点上执行df -h命令

```shell
df -h
>>>
Filesystem                 Size  Used Avail Use% Mounted on
devtmpfs                   858M     0  858M   0% /dev
tmpfs                      868M     0  868M   0% /dev/shm
tmpfs                      868M  2.6M  865M   1% /run
tmpfs                      868M     0  868M   0% /sys/fs/cgroup
47.96.156.205:/k8s   40G  1.9G   36G   5% /var/lib/kubelet/pods/
5784ab85-bf51-11ea-b509-00163e0e21a6/volumes/kubernetes.io~nfs/nfs-share
```
可以看到pod的文件映射在主机的/var/lib/kubelet/pods/5784ab85-bf51-11ea-b509-00163e0e21a6/volumes/kubernetes.io~nfs/nfs-share目录下。

多pod间共享存储
该deployment中replicas（副本集）为2，也就是会有2个pod。
在第一个pod内的/data目录写入数据时，在第二个pod内的/data目录下也会立即生成数据，pod1和pod2内/data目录下的数据永远是相同，俩个pod内的数据是共享的。



## 5.2. 通过StorageClass使用