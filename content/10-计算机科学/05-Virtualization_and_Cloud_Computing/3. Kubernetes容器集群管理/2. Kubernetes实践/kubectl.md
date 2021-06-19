---
title: "kubectl 命令行"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. kubectl 概述
kubectl是一个用于操作kubernetes集群的命令行接口，通过利用kubectl的各种命令可以实现各种功能。

| 命令 kubectl [flags]  | 解释                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------- |
| kubectl alpha         | alpha环境上命令属性                                                                          |
| kubectl annotate      | 更新资源上注释                                                                               |
| kubectl api-resources | 在服务器上打印支持的 API 资源                                                                |
| kubectl api-versions  | 以 “group/version” 的形式在服务器上打印支持的 API 版本                                       |
| kubectl apply         | 通过文件名或标准输入将配置添加给资源                                                         |
| kubectl attach        | 附加到正在运行的容器                                                                         |
| kubectl auth          | 检查授权                                                                                     |
| kubectl autoscale     | 自动扩展 Deployment, ReplicaSet 或 ReplicationController                                     |
| kubectl certificate   | 修改证书资源。                                                                               |
| kubectl cluster-info  | 展示集群信息                                                                                 |
| kubectl completion    | 为给定的 shell 输出完成代码（ bash 或 zsh）                                                  |
| kubectl config        | 修改 kubeconfig 配置文件                                                                     |
| kubectl convert       | 在不同的 API 版本之间转换配置文件                                                            |
| kubectl cordon        | 将 node 节点标记为不可调度                                                                   |
| kubectl cp            | 从容器复制文件和目录，也可将文件和目录复制到容器。                                           |
| kubectl create        | 通过文件名或标准输入创建资源。                                                               |
| kubectl delete        | 通过文件名，标准输入，资源和名称或资源和标签选择器删除资源                                   |
| kubectl describe      | 显示特定资源或资源组的详细信息                                                               |
| kubectl drain         | 为便于维护，需要提前驱逐node节点                                                             |
| kubectl edit          | 在服务器编辑资源                                                                             |
| kubectl exec          | 容器内退出命令                                                                               |
| kubectl explain       | 资源文档                                                                                     |
| kubectl expose        | 获取 replication controller, service, deployment 或 pod 资源，并作为新的 Kubernetes 服务暴露 |
| kubectl get           | 展示一个或多个资源                                                                           |
| kubectl label         | 升级资源标签                                                                                 |
| kubectl logs          | 为 pod 中的容器打印日志                                                                      |
| kubectl options       | 打印所有命令继承的标识列表                                                                   |
| kubectl patch         | 使用战略性合并补丁更新资源字段                                                               |
| kubectl plugin        | 运行命令行插件                                                                               |
| kubectl port-forward  | 给 pod 开放一个或多个本地端口                                                                |
| kubectl proxy         | 为 Kubernetes API server 运行代理                                                            |
| kubectl replace       | 通过文件或标准输入替换资源                                                                   |
| kubectl rollout       | 管理资源展示                                                                                 |
| kubectl run           | 在集群上运行指定镜像                                                                         |
| kubectl scale         | 给 Deployment, ReplicaSet, Replication Controller 或 Job 设置新副本规模                      |
| kubectl set           | 给对象设置特定功能                                                                           |
| kubectl taint         | 更新一个或多个 node 节点的污点信息                                                           |
| kubectl top           | 展示资源 (CPU/Memory/Storage) 使用信息。                                                     |
| kubectl uncordon      | 标记 node 节点为可调度                                                                       |
| kubectl version       | 打印客户端和服务端版本信息                                                                   |
| kubectl wait          | 试验: 在一个或多个资源上等待条件完成                                                         |

# 2. 命令表

```shell
# kubectl命令列表

kubectl run（创建容器镜像）
kubectl expose（将资源暴露为新的 Service）
kubectl annotate（更新资源的Annotations信息）
kubectl autoscale（Pod水平自动伸缩）
kubectl convert（转换配置文件为不同的API版本）

kubectl create（创建一个集群资源对象
kubectl create clusterrole（创建ClusterRole）
kubectl create clusterrolebinding（为特定的ClusterRole创建ClusterRoleBinding）
kubectl create configmap（创建configmap）
kubectl create deployment（创建deployment）
kubectl create namespace（创建namespace）
kubectl create poddisruptionbudget（创建poddisruptionbudget）
kubectl create quota（创建resourcequota）
kubectl create role（创建role）
kubectl create rolebinding（为特定Role或ClusterRole创建RoleBinding）

kubectl create service（使用指定的子命令创建 Service服务）
kubectl create service clusterip
kubectl create service externalname
kubectl create service loadbalancer
kubectl create service nodeport
kubectl create serviceaccount

kubectl create secret（使用指定的子命令创建 secret）
kubectl create secret tls
kubectl create secret generic
kubectl create secret docker-registry

kubectl delete（删除资源对象）


kubectl delete namespace NAMESPACENAME --force --grace-period=0


kubectl edit（编辑服务器上定义的资源对象）
kubectl get（获取资源信息）
kubectl label（更新资源对象的label）
kubectl patch（使用patch更新资源对象字段）
kubectl replace（替换资源对象）
kubectl rolling-update（使用RC进行滚动更新）
kubectl scale（扩缩Pod数量）

kubectl rollout（对资源对象进行管理）
kubectl rollout history（查看历史版本）
kubectl rollout pause（标记资源对象为暂停状态）
kubectl rollout resume（恢复已暂停资源）
kubectl rollout status（查看资源状态）
kubectl rollout undo（回滚版本）

kubectl set（配置应用资源）
kubectl set resources（指定Pod的计算资源需求）
kubectl set selector（设置资源对象selector）
kubectl set image（更新已有资源对象中的容器镜像）
kubectl set subject（更新RoleBinding / ClusterRoleBinding中User、Group 或 ServiceAccount）

# 查看集群信息
kubectl cluster-info


```





## 2.1. 检查集群节点，及服务健康状态

```shell
# 检查集群节点
kubectl get node
>>>
NAME           STATUS    AGE
192.168.10.8   Ready     22h
192.168.10.9   Ready     21h

# 各组件服务健康状态
kubectl get cs
>>>
NAME                 STATUS    MESSAGE              ERROR
scheduler            Healthy   ok                   
controller-manager   Healthy   ok                   
etcd-0               Healthy   {"health": "true"} 
```



## 2.2. 查看配置

```shell
kubectl config view
```

## 2.3. 资源配置
通过文件名或控制台输入，对资源进行配置。
```shell
# 通过文件名或控制台输入，对资源进行配置。
kubectl apply -f FILENAME
# -f file 接受 json /yml格式的配置文件
```

```shell
  -f, --filename=[]: 包含配置信息的文件名，目录名或者URL。
  -o, --output="": 输出格式，使用“-o name”来输出简短格式（资源类型/资源名）。
      --schema-cache-dir="/tmp/kubectl.schema": 如果不为空，将API schema缓存为指定文件，默认缓存到“/tmp/kubectl.schema”。
      --validate[=true]: 如果为true，在发送到服务端前先使用schema来验证输入。
```
应用配置文件 `app1_config.yml` 主要有4部分组成 
1. apiVersion
2. kind
3. metadata
4. spec

```yml
# 1. api版本信息
apiVersion: v1
# 2. 表示资源类型
kind: Namespace
# 3. 应用元信息
metadata:
  name: k8s-example # 名字
  labels:
    app: k8s-example
    name: k8s-example
    project: k8s-example
# 4. 资源规范字段
spec:
  ports:
  - port: 6379
    targetPort: 6379
  selector:
    app: redis
```


## 2.4. 启动容器
```shell
kubectl run NAME --image=image [--env="key=value"] [--port=port] [--replicas=replicas]
```
- `replicas`：副本数量
- `port`：释放出的端口号

