---
title: "接合阿里云LoadBalance处理外部访问服务 "
layout: page
date: 2099-06-02 00:00
---

[TOC]

**在生产环境中**
kubernetes如果仅提供http或https服务，则可以使用`nginx-ingress`或者 `traefik` 之类的七层负载均衡软件。 

当然，也可以通过NodePort的方式暴露http或tcp服务。如果不想直接使用NodePort暴露出的那个端口号，而服务器又是运行在阿里云上，那么可以使用阿里云提供的`Kubernetes Cloud Controller Manager`来对外暴露TCP服务或http/https服务。

**前提**：
1. 在阿里云上购买了几台ecs
2. 在阿里云的ecs上搭建好了一个kubernetes集群，这里以kubernetes1.9.0为例
3. 在阿里云上购买一个公网的负载均衡

就可以开始配置阿里云的负载均衡与kubernetes整合了。以下是配置步骤：

1. 先获取每台ecs对应的regionId和ecsId
```shell
# 获取 REGION_ID 区域
curl -s http://100.100.100.200/latest/meta-data/region-id
>>>
xxxx
# 获取 ecsId ECS服务器id
curl -s http://100.100.100.200/latest/meta-data/instance-id
>>>
XXXXXX
```
2. 添加启动参数
   在 `master` 上添加把 `apiserver`, `controller-manager`和 `kubelet` 的启动
3. 

把apiserver, controller-manager和kubelet都添加启动参数 --cloud-provider=external，并且在kubelet中添加--provider-id=上面得到的<REGION_ID>.<ECS_ID>
    
先创建一个secret用来保存阿里的Access Key Id和Access Key Secret(这两项值在阿里的控制台可以查到),编写一个`alicloud-secret.yaml`文件，如下

```yml
apiVersion: v1
kind: Secret
metadata:
    name: alicloud-config
    namespace: kube-system
data:
    # insert your base64 encoded AliCloud access id and key here, ensure there's no trailing newline:
    # to base64 encode your token run:
    #      echo -n "abc123abc123doaccesstoken" | base64
    access-key-id: "XXXXXXX"
    access-key-secret: "XXXXXXX"
```

这里的id和secret就是把从阿里控制台中得到的用base64编码，然后替换到上面文件中就可以了。然后用

```shell
kubectl apply -f alicloud-secret.yaml
```
创建对应secret，接下来再编写`alicloud-controller-manager.yaml`文件，如下：

```yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
name: alicloud-controller-manager
namespace: kube-system
spec:
replicas: 1
revisionHistoryLimit: 2
template:
metadata:
    labels:
    app: alicloud-controller-manager
spec:
    dnsPolicy: Default
    tolerations:
    # this taint is set by all kubelets running `--cloud-provider=external`
    - key: "node.cloudprovider.kubernetes.io/uninitialized"
        value: "true"
        effect: "NoSchedule"
    containers:
    - image: registry.cn-hangzhou.aliyuncs.com/kube-test/alicloud-controller-manager:v0.1.0
    name: alicloud-controller-manager
    command:
        - /alicloud-controller-manager
        # set leader-elect=true if you have more that one replicas
        - --leader-elect=false
        - --allocate-node-cidrs=true
        # set this to what you set to controller-manager or kube-proxy
        - --cluster-cidr=10.0.6.0/24
        # if you want to use a secure endpoint or deploy in a kubeadm deployed cluster, you need to use a kubeconfig instead.
        - --master=10.0.0.10:8080
    env:
        - name: ACCESS_KEY_ID
        valueFrom:
            secretKeyRef:
            name: alicloud-config
            key: access-key-id
        - name: ACCESS_KEY_SECRET
        valueFrom:
            secretKeyRef:
            name: alicloud-config
            key: access-key-secret
```

注意上面红字部分，根据自己的配置情况替换。同样，使用



```shell
kubectl apply -f alicloud-controller-manager.yaml
```
来创建对应的 `deployment`
然后就可以创建一个service来使用它了，例如我下面创建一个zookeeper的服务

```yml
apiVersion: v1
kind: Service
metadata:
    name: zookeeper-master
    labels:
    app: zookeeper-master
    namespace: xxxxx
spec:
    ports:
    - port: 2181
    targetPort: 2181
    protocol: TCP
    name: main-port
    selector:
    app: zookeeper-master
    type: LoadBalancer
```

这时可以通过 `kubectl get svc` 看到对应的service已经有了external-ip
要在阿里控制台把负载均衡设置一下后端服务器，把k8s的node节点都添加进去。
