---
title: "部署nfs-client-provisioner"
layout: page
date: 2099-06-02 00:00
---

[TOC]


# 1. 部署说明
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


# 2. 部署步骤





## 2.1. 前提条件--开启nfs服务
1. 一个节点搭建好 nfs-server (master)
2. 集群所有Node节点安装nfs客户端
3. **指定挂载目录可用**


## 2.2. 处理授权问题

从Kubernetes 1.6 版本起，k8s系统默认启用RBAC策略
如果您的集群启用了RBAC，则必须授权provisioner。 

详细部署说明参考下文。
### 2.2.1. 创建Service Account

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
### 2.2.2. 创建Cluster Role

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


### 2.2.3. 创建Cluster Role Binding

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


### 2.2.4. 创建Role

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


### 2.2.5. 创建Role Binding
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




### 2.2.6. 汇总 


```shell
cat << EOF >nfs-rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: nfs-client-provisioner
  # replace with namespace where provisioner is deployed
  namespace: nfs        #根据实际环境设定namespace,下面类同
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
    namespace: nfs
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
  namespace: nfs
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
    namespace: nfs
roleRef:
  kind: Role
  name: leader-locking-nfs-client-provisioner
  apiGroup: rbac.authorization.k8s.io

EOF
kubectl apply -f nfs-rbac.yaml

```
## 2.3. 处理存储问题

### 2.3.1. 创建nfs-client-provisioner
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


### 2.3.2. 创建StorageClass
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
## 2.4. 创建 deployment


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
              value: nfs-client-provisioner			#PROVISIONER_NAME的Value值与StorageClass的Provisioner字段值必须保持一致，可以不要namespace
            - name: NFS_SERVER
              value: 172.18.43.250			#请使用文件存储的挂载目标IP地址替换
            - name: NFS_PATH
              value: /data/k8s/nfs   #请使用挂载目标支持的目录替换，默认挂载到/cfs目录
      volumes:
        - name: nfs-client-root
          nfs:
            server: 172.18.43.250			#请使用文件存储的挂载目标IP地址替换
            path: /data/kubeflow-pv1   #请使用挂载目标支持的目录替换，默认挂载到/cfs目录

```
Yaml文件说明：
```shell
cat << EOF > nfs-provisioner.yml
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
              value: my-nfs-client-provisioner
            - name: NFS_SERVER
              value: 10.0.77.98
            - name: NFS_PATH
              value: /data/nfs_data/
      volumes:
        - name: nfs-client-root
          nfs:
            server: 10.0.77.98
            path: /data/nfs_data/
EOF
kubectl create -f nfs-provisioner.yml -n nfs

```

# 3. 验证与使用

## 3.1. 验证deployment 部署情况
```shell
# 验证
kubectl get deployment -n nfs
```

## 3.2. 验证能否正常使用

### 3.2.1. 通过storageClass 验证
1. 创建 storageClass
```shell 
cat << EOF >  test-storageclass.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    storageclass.kubernetes.io/is-default-class: 'false'
  name: test-storageclass
provisioner: my-nfs-client-provisioner
reclaimPolicy: Delete
volumeBindingMode: Immediate
EOF
kubectl create -f test-storageclass.yaml
```
2. 创建 PVC
 
```shell
# 编写yaml
cat << EOF > test-claim.yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: test-claim
  namespace: nfs
spec:
  storageClassName: test-storageclass #---需要与上面创建的storageclass的名称一致
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 10Gi
EOF
#创建PVC
kubectl apply -f test-claim.yaml -n nfs
#查看创建的PV和PVC
kubectl get pvc -n nfs
>>>

NAME         STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
test-claim   Bound    pvc-593f241f-a75f-459a-af18-a672e5090921   100Gi      RWX            nfs-storage    3s

```
 


 



```shell

# 编写yaml
cat > test-pod.yaml <<\EOF
kind: Pod
apiVersion: v1
metadata:
  name: test-pod
spec:
  containers:
  - name: test-pod
    image: busybox:latest
    command:
      - "/bin/sh"
    args:
      - "-c"
      - "touch /mnt/SUCCESS && exit 0 || exit 1"
    volumeMounts:
      - name: nfs-pvc
        mountPath: "/mnt"
  restartPolicy: "Never"
  volumes:
    - name: nfs-pvc
      persistentVolumeClaim:
        claimName: test-claim
EOF
 
#创建pod
kubectl apply -f test-pod.yaml -n kube-public
 
#查看创建的pod
kubectl get pod -o wide -n kube-public
01、进入 NFS Server 服务器验证是否创建对应文件
进入 NFS Server 服务器的 NFS 挂载目录，查看是否存在 Pod 中创建的文件：

$ cd /data/nfs/
$ ls
archived-kube-public-test-claim-pvc-2dd4740d-f2d1-4e88-a0fc-383c00e37255  kube-public-test-claim-pvc-ad304939-e75d-414f-81b5-7586ef17db6c
archived-kube-public-test-claim-pvc-593f241f-a75f-459a-af18-a672e5090921  kube-system-test1-claim-pvc-f84dc09c-b41e-4e67-a239-b14f8d342efc
archived-kube-public-test-claim-pvc-b08b209d-c448-4ce4-ab5c-1bf37cc568e6  pv001
default-test-claim-pvc-4f18ed06-27cd-465b-ac87-b2e0e9565428               pv002
 
# 可以看到已经生成 SUCCESS 该文件，并且可知通过 NFS Provisioner 创建的目录命名方式为 “namespace名称-pvc名称-pv名称”，pv 名称是随机字符串，所以每次只要不删除 PVC，那么 Kubernetes 中的与存储绑定将不会丢失，要是删除 PVC 也就意味着删除了绑定的文件夹，下次就算重新创建相同名称的 PVC，生成的文件夹名称也不会一致，因为 PV 名是随机生成的字符串，而文件夹命名又跟 PV 有关,所以删除 PVC 需谨慎。

```






### 3.2.2. 直接使用

k8s应用中volume可以使用nfs类型，k8s应用就相当于是一个nfs的客户端



最好k8s集群和nfs服务端在一个vpc下（同一局域网内）。

deployment的yaml文件大致如下

```shell
cat << EOF > test-deployment.yml
kind: Deployment
apiVersion: extensions/v1beta1
metadata:
  name: test-nginx-php7
  namespace: nfs
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
            server: 10.0.77.98
            path: "/data/nfs_data/"
EOF
kubectl apply -f test-deployment.yml
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



# 4. 卸载

```shell
kubectl delete -f nfs-provisioner.yml -n nfs
```
