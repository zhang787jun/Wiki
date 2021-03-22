---
title: "kuboard--国产kubernetes的可视化面板"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# 1. 安装

安装 Kuboard。

```shell
kubectl apply -f https://kuboard.cn/install-script/kuboard.yaml
kubectl apply -f https://addons.kuboard.cn/metrics-server/0.3.7/metrics-server.yaml
```

查看 Kuboard 运行状态：

```shell
kubectl get pods -l k8s.eip.work/name=kuboard -n kube-system

# 输出结果如下所示：
>>>
NAME                       READY   STATUS        RESTARTS   AGE
kuboard-54c9c4f6cb-6lf88   1/1     Running       0          45s


Get the Kubernetes Dashboard URL by running:
export POD_NAME=$(kubectl get pods  -l "app=kubernetes-dashboard,release=kubernetes-dashboard" -o jsonpath="{.items[0].metadata.name}")
echo https://127.0.0.1:8443/
kubectl -n  port-forward $POD_NAME 8443:8443
```





## 1.1. 获取 Token

您可以获得管理员用户、只读用户的Token

### 1.1.1. 管理员用户

**拥有的权限**

* 此Token拥有 ClusterAdmin 的权限，可以执行所有操作

**执行命令**

```bash
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep kuboard-user | awk '{print $1}')   
```

**输出**

取输出信息中 token 字段
```{13}
Name: admin-user-token-g8hxb
Namespace: kube-system
Labels: <none>
Annotations: [kubernetes.io/service-account.name](http://kubernetes.io/service-account.name): Kuboard-user
[kubernetes.io/service-account.uid](http://kubernetes.io/service-account.uid): 948bb5e6-8cdc-11e9-b67e-fa163e5f7a0f

Type: [kubernetes.io/service-account-token](http://kubernetes.io/service-account-token)

Data
====
ca.crt: 1025 bytes
namespace: 11 bytes
token: eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLWc4aHhiIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI5NDhiYjVlNi04Y2RjLTExZTktYjY3ZS1mYTE2M2U1ZjdhMGYiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.DZ6dMTr8GExo5IH_vCWdB_MDfQaNognjfZKl0E5VW8vUFMVvALwo0BS-6Qsqpfxrlz87oE9yGVCpBYV0D00811bLhHIg-IR_MiBneadcqdQ_TGm_a0Pz0RbIzqJlRPiyMSxk1eXhmayfPn01upPdVCQj6D3vAY77dpcGplu3p5wE6vsNWAvrQ2d_V1KhR03IB1jJZkYwrI8FHCq_5YuzkPfHsgZ9MBQgH-jqqNXs6r8aoUZIbLsYcMHkin2vzRsMy_tjMCI9yXGiOqI-E5efTb-_KbDVwV5cbdqEIegdtYZ2J3mlrFQlmPGYTwFI8Ba9LleSYbCi4o0k74568KcN_w
```

### 1.1.2. 只读用户

**拥有的权限**

- view  可查看名称空间的内容
- system:node   可查看节点信息
- system:persistent-volume-provisioner  可查看存储类和存储卷声明的信息

**适用场景**

只读用户不能对集群的配置执行修改操作，非常适用于将开发环境中的 Kuboard 只读权限分发给开发者，以便开发者可以便捷地诊断问题

**执行命令**

执行如下命令可以获得 <span style="color: #F56C6C; font-weight: 500;">只读用户</span> 的 Token

```bash
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep kuboard-viewer | awk '{print $1}')   
```

**输出**

取输出信息中 token 字段
```{13}
Name: admin-user-token-g8hxb
Namespace: kube-system
Labels: <none>
Annotations: [kubernetes.io/service-account.name](http://kubernetes.io/service-account.name): Kuboard-viewer
[kubernetes.io/service-account.uid](http://kubernetes.io/service-account.uid): 948bb5e6-8cdc-11e9-b67e-fa163e5f7a0f

Type: [kubernetes.io/service-account-token](http://kubernetes.io/service-account-token)

Data
====
ca.crt: 1025 bytes
namespace: 11 bytes
token: eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLWc4aHhiIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI5NDhiYjVlNi04Y2RjLTExZTktYjY3ZS1mYTE2M2U1ZjdhMGYiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.DZ6dMTr8GExo5IH_vCWdB_MDfQaNognjfZKl0E5VW8vUFMVvALwo0BS-6Qsqpfxrlz87oE9yGVCpBYV0D00811bLhHIg-IR_MiBneadcqdQ_TGm_a0Pz0RbIzqJlRPiyMSxk1eXhmayfPn01upPdVCQj6D3vAY77dpcGplu3p5wE6vsNWAvrQ2d_V1KhR03IB1jJZkYwrI8FHCq_5YuzkPfHsgZ9MBQgH-jqqNXs6r8aoUZIbLsYcMHkin2vzRsMy_tjMCI9yXGiOqI-E5efTb-_KbDVwV5cbdqEIegdtYZ2J3mlrFQlmPGYTwFI8Ba9LleSYbCi4o0k74568KcN_w
```
# 2. 使用
## 2.1. 访问 Kuboard

您可以通过 NodePort、port-forward 两种方式当中的任意一种访问 Kuboard

### 2.1.1. 通过NodePort访问

Kuboard Service 使用了 NodePort 的方式暴露服务，NodePort 为 32567；您可以按如下方式访问 Kuboard。

`
http://任意一个Worker节点的IP地址:32567/
`

输入前一步骤中获得的 token，可进入 **Kuboard 集群概览页**

> * 如果您使用的是阿里云、腾讯云等，请在其安全组设置里开放 worker 节点 32567 端口的入站访问，
> * 您也可以修改 Kuboard.yaml 文件，使用自己定义的 NodePort 端口号


### 2.1.2. 通过port-forward访问


在您的客户端电脑中执行如下命令

```sh
kubectl port-forward service/kuboard 8080:80 -n kube-system
```

在浏览器打开链接 （请使用 kubectl 所在机器的IP地址）

`http://localhost:8080`

输入前一步骤中获得的 token，可进入 **Kuboard 集群概览页**

# 3. 使用教程



# 4. 参考资料

https://kuboard.cn/guide/