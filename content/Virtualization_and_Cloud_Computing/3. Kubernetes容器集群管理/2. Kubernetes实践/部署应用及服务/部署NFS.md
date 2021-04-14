---
title: "部署nfs-client-provisioner"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# 1. 前言

网络文件系统，英文Network File System(NFS)，是由SUN公司研制的UNIX表示层协议(presentation layer protocol)，能使使用者访问网络上别处的文件就像在使用自己的计算机一样。


Kubernetes集群中NFS类型的存储没有内置 Provisioner。但是您可以在集群中为NFS配置外部Provisioner。

`Nfs-client-provisioner`是一个开源的NFS 外部Provisioner，利用NFS Server为Kubernetes集群提供持久化存储，并且支持动态创建PV。但是nfs-client-provisioner本身不提供NFS，需要现有的NFS服务器提供存储。


# 2. 部署说明
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


# 3. 步骤

nfs-client-provisioner在集群中以deployment的方式运行，并且nfs-client-provisioner需要访问kube-api获取PVC对象的变化。

授权
RBAC
如果您的集群启用了RBAC，则必须授权provisioner。
> 从Kubernetes 1.6 版本起，系统默认启用RBAC策略

详细部署说明参考下文。

## 前提条件




```shell
# 所有Node 节点
sudo apt-get install nfs-common 

sudo mkdir nfs

```
```shell
#
systemctl start nfs-server

rpcinfo -p localhost |grep nfs

```

## 3.1. 处理授权问题
### 3.1.1. 创建Service Account

**方法1**：通过yaml 安装
```shell
wget https://kubernetes.s3.cn-north-1.jdcloud-oss.com/CFS/nfs-client-provisioner/ServiceAccount.yml
>>>
kubectl create -f ServiceAccount.yml
```
Yaml文件如下
```Yaml
kind: ServiceAccount
apiVersion: v1
metadata:
  name: nfs-client-provisioner
```
**方法2**：使用命令行创建
```shell
kubectl create serviceaccount nfs-client-provisioner 

```
### 3.1.2. 创建Cluster Role

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


### 3.1.3. 创建Cluster Role Binding

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
使用Yaml文件创建Cluster Role：

### 3.1.4. 创建Role

```shell
wget https://kubernetes.s3.cn-north-1.jdcloud-oss.com/CFS/nfs-client-provisioner/Role.yml
kubectl create -f Role.yml

kubectl get  Role |grep nfs
>>>
leader-locking-nfs-client-provisioner
```
Yaml文件说明：
```yml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-nfs-client-provisioner
rules:
  - apiGroups: [""]
    resources: ["endpoints"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
```


### 3.1.5. 创建Role Binding
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



## 3.2. 处理存储问题

 

### 3.2.1. 创建StorageClass
```shell
cat << EOF > my_StorageClass.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: kubeflow-nfs-storage
provisioner: kubeflow/nfs
EOF
kubectl create -f my_StorageClass.yaml

# 验证
kubectl get StorageClass
>>>
NAME                             PROVISIONER    AGE
kubeflow-nfs-storage (default)   kubeflow/nfs   3d15h
```
## 3.3. 创建 nfs-client-provisioner deployment

k8s中volume使用nfs类型
k8s就相当于是一个nfs的客户端。如果上述的客户端挂载成功了，k8s的挂载也一定能挂载成功。

最好k8s集群和nfs服务端在一个vpc下（同一局域网内）。


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
kubectl create -f Deploy.yml
# 验证
kubectl get deployment


kubectl delete -f Deploy.yml

```

# 4. 验证nfs-client-provisioner运行状态

在集群中查看nfs-client-provisioner Deployment的运行状态，所有Pod处于running状态并且运行的副本数与期望副本数一致时，则表示nfs-client-provisioner运行成功。

```shell
kubectl get deployment
>>>
NAME                     DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
nfs-client-provisioner   1         1         1            1           42m
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

# k8s中使用nfs 

中volume使用nfs类型
k8s就相当于是一个nfs的客户端。如果上述的客户端挂载成功了，k8s的挂载也一定能挂载成功。

最好k8s集群和nfs服务端在一个vpc下（同一局域网内）。

deployment的yaml文件大致如下

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

执行kubectl apply -f deployment.yaml命令后发现，pod并没有running状态。kubeclt describe pod pod-id发现报如下错误

mount: wrong fs type, bad option, bad superblock on 39.105.232.173:/first-k8s,
       missing codepage or helper program, or other error
       (for several filesystems (e.g. nfs, cifs) you might
       need a /sbin/mount.<type> helper program)
       In some cases useful info is found in syslog - try
       dmesg | tail  or so
经查阅资料发现，我们没有安装nfs客户端，我们原本以为k8s会自动安装呢，其实并没有。

那么现有有俩种选择，nfs客户端是在pod内安装还是在node内安装呢？

我们的第一反应肯定是pod内安装，因为所有的执行程序都在pod内嘛。但是了解k8s的volume原理的或者docker的volume原理的会知道，volume的本质是将pod内的文件映射到宿主机内的一个目录的。所有我们只需要在k8s集群内所有的node节点上都安装nfs集群即可，和上述的客户端安装方式相同。
但是发现不需要在node节点的/etc/fstab文件写入挂载点。

在node节点上执行df -h命令

[root@s1 ~]# df -h
Filesystem                 Size  Used Avail Use% Mounted on
devtmpfs                   858M     0  858M   0% /dev
tmpfs                      868M     0  868M   0% /dev/shm
tmpfs                      868M  2.6M  865M   1% /run
tmpfs                      868M     0  868M   0% /sys/fs/cgroup
47.96.156.205:/k8s   40G  1.9G   36G   5% /var/lib/kubelet/pods/5784ab85-bf51-11ea-b509-00163e0e21a6/volumes/kubernetes.io~nfs/nfs-share
可以看到pod的文件映射在主机的/var/lib/kubelet/pods/5784ab85-bf51-11ea-b509-00163e0e21a6/volumes/kubernetes.io~nfs/nfs-share目录下。

多pod间共享存储
该deployment中replicas（副本集）为2，也就是会有2个pod。
在第一个pod内的/data目录写入数据时，在第二个pod内的/data目录下也会立即生成数据，pod1和pod2内/data目录下的数据永远是相同，俩个pod内的数据是共享的。

作者：PENG先森_晓宇
链接：https://www.jianshu.com/p/90f9fb5d8f27
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。


