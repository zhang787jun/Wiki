---
title: "kubeboard--Kubernetes的可视化工具"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 安装

## 1.1. 资源配置
下载kubernetest-dashboard配置文件：

```shell
mkdir -pv /home/k8s/dashboard && cd /home/k8s/dashboard
wget https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml
```

由于官方的yaml文件使用的镜像国内无法下载需要更改下镜像名称，以及更改下节点映射以方便我们通过ip:port方式访问

修改镜像地址为`http://registry.cn-beijing.aliyuncs.com/minminmsn/kubernetes-dashboard:v1.10.1`（或`yuanxiang/kubernetes-dashboard` 这个build完还未测试）

```yml
    spec:
      containers:
      - name: kubernetes-dashboard
        image: registry.cn-beijing.aliyuncs.com/minminmsn/kubernetes-dashboard:v1.10.1
```
修改nodeport，添加type 和 nodePort:

```yml
kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kube-system
spec:
  type: NodePort  #添加type
  ports:
    - port: 443
      targetPort: 8443
      nodePort: 30001  #添加nodePort
  selector:
    k8s-app: kubernetes-dashboard
```

创建dashboard:

```shell
kubectl apply -f kubernetes-dashboard.yaml
```
查看：
```shell
kubectl get pods --namespace=kube-system
>>>
[root@localhost dashboard]# kubectl get pods --namespace=kube-system
NAME                                   READY   STATUS    RESTARTS   AGE
coredns-5d668bd598-kdb72               1/1     Running   17         18h
coredns-5d668bd598-kdszg               1/1     Running   17         18h
kube-flannel-ds-amd64-9grh7            1/1     Running   0          20h
kube-flannel-ds-amd64-fpng2            1/1     Running   0          20h
kubernetes-dashboard-cb55bd5bd-w25mz   1/1     Running   0          16m
```
查看端口映射：

```shell
kubectl get services kubernetes-dashboard -n kube-system
>>>
NAME                   TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)         AGE
kubernetes-dashboard   NodePort   10.102.223.104   <none>        443:30001/TCP   3h45m
```


查看所在node:

```shell
kubectl get pods -o wide --namespace=kube-system
>>>
NAME                                   READY   STATUS    RESTARTS   AGE   IP           NODE         NOMINATED NODE   READINESS GATES
coredns-5d668bd598-kdb72               1/1     Running   17         18h   10.0.0.5     10.2.3.208   <none>           <none>
coredns-5d668bd598-kdszg               1/1     Running   17         18h   10.0.0.6     10.2.3.208   <none>           <none>
kube-flannel-ds-amd64-9grh7            1/1     Running   0          20h   10.2.3.208   10.2.3.208   <none>           <none>
kube-flannel-ds-amd64-fpng2            1/1     Running   0          20h   10.2.3.209   10.2.3.209   <none>           <none>
kubernetes-dashboard-cb55bd5bd-w25mz   1/1     Running   0          16m   10.0.0.12    10.2.3.208   <none>           <none>

```

现在输入 `https://<Node-ip>:30001`(**注意https开头，排版老隐藏掉**) 已经可以访问了（这里注意chrome跟ie都打不开，应该是跟https用的非443端口有关，在火狐里添加例外可以打开）


## 1.2. 用户权限管理
我们用token方式登录需要创建用户：

```shell
cd /home/k8s/dashboard

cat << EOF > admin-user.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: admin
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin
  namespace: kube-system
EOF
```


用户权限配置 `admin-user.yaml`
```yml
# admin-user.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: admin
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding 
metadata:
  name: admin
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin  # ClusterRole 为cluster-admin 
subjects:    # 在kube-system命名空间内 添加名为admin 的用户
- kind: ServiceAccount
  name: admin     
  namespace: kube-system
```

配置资源
```shell
kubectl apply -f admin-user.yaml
```
查看创建情况：

```shell
kubectl describe serviceaccount admin -n kube-system
>>>
Name:                admin
Namespace:           kube-system
Labels:              k8s-app=kubernetes-dashboard
Annotations:         kubectl.kubernetes.io/last-applied-configuration:
                       {"apiVersion":"v1","kind":"ServiceAccount","metadata":{"annotations":{},"labels":{"k8s-app":"kubernetes-dashboard"},"name":"admin","namesp...
Image pull secrets:  <none>
Mountable secrets:   admin-token-6djhl
Tokens:              admin-token-6djhl
Events:              <none>
```

获取token:

```shell
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin | awk '{print $1}')
>>>
Name:         admin-token-6djhl
Namespace:    kube-system
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: admin
              kubernetes.io/service-account.uid: 51973031-3bfb-11e9-b005-6a2d105c7722

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1359 bytes
namespace:  11 bytes
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi10b2tlbi02ZGpobCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJhZG1pbiIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjUxOTczMDMxLTNiZmItMTFlOS1iMDA1LTZhMmQxMDVjNzcyMiIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlLXN5c3RlbTphZG1pbiJ9.KFaKQQVmVhP7VeZDbjd5UX7GATmP0RhbeOUZmMll48azsrNbSy2V4kmklPESM1VxgQei9raDxPJpnoOpXLIukgrnEDjSSUBFtJ6L8Oa_Lv3z17E-MwzeiIxzpOVJXX3c1M0Z775Ld6CUw6uNL6t0zIkgfK1ESiuhm830VdL3lHQZCZ234IjG6KaZ1uA5zWC77pSrU6XV3Rd9Dm2sysyOc-8NkfxVy3KpnLae-4DcnhtZ_nflcIIFJMTVyIjPMePwLOcpKdngV5RZpfXybT1dqKAj12QVOi4fwbHkwVTBKJ9yjlfCMlZruRDV3W6qrNNe930Xap_GqvdQrr7eBpd9Hg
```
在网页端添加token即可


 


