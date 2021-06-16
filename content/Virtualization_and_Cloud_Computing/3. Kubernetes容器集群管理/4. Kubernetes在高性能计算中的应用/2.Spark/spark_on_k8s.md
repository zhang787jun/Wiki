---
title: "Spark on k8s"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# 1. 概述
Spark


## 1.1. Spark on K8S 的几种模式

**区分**

Spark主要有4种运行模型：
1. Spark on Standalone 
2. Spark on Mesos
3. Spark on Yarn
4. Spark on k8s
   1. Spark on k8s--Standalone
   2. Spark on k8s--Kubernetes Native
   3. Spark on k8s--Spark Operator


### 1.1.1. Standalone
Standalone：在 K8S 启动一个长期运行的集群，所有 Job 都通过 spark-submit 向这个集群提交

#### 1.1.1.1. 特点


简而言之，spark standalone on kubernetes 有如下几个缺点：

无法对于多租户做隔离，每个用户都想给 pod 申请 node 节点可用的最大的资源。
Spark 的 master／worker 本来不是设计成使用 kubernetes 的资源调度，这样会存在两层的资源调度问题，不利于与 kuberentes 集成。

### 1.1.2. Kubernetes Native
Kubernetes Native：通过 spark-submit 直接向 K8S 的 API Server 提交，申请到资源后启动 Pod 做为 Driver 和 Executor 执行 Job，参考 http://spark.apache.org/docs/2.4.6/running-on-kubernetes.html

#### 1.1.2.1. 特点
使用 kubernetes 原生调度的 spark on kubernetes 是对原有的 spark on yarn 革命性的改变，主要表现在以下几点：

1. **Kubernetes 原生调度**：不再需要二层调度，直接使用 kubernetes 的资源调度功能，跟其他应用共用整个 kubernetes 管理的资源池；
2. **资源隔离，粒度更细**：原先 yarn 中的 queue 在 spark on kubernetes 中已不存在，取而代之的是 kubernetes 中原生的 namespace，可以为每个用户分别指定一个 namespace，限制用户的资源 quota；
细粒度的资源分配：可以给每个 spark 任务指定资源限制，实际指定多少资源就使用多少资源，因为没有了像 yarn 那样的二层调度（圈地式的），所以可以更高效和细粒度的使用资源；
3. **监控**的变革：因为做到了细粒度的资源分配，所以可以对用户提交的每一个任务做到资源使用的监控，从而判断用户的资源使用情况，所有的 metric 都记录在数据库中，甚至可以为每个用户的每次任务提交计量；
4. **日志**的变革：用户不再通过 yarn 的 web 页面来查看任务状态，而是通过 pod 的 log 来查看，可将所有的 kuberentes 中的应用的日志等同看待收集起来，然后可以根据标签查看对应应用的日志；


spark 可以调用 kubernetes API 获取集群资源和调度

#### 1.1.2.2. 架构设计


要实现 kubernetes native spark 需要为 spark 提供一个集群外部的 manager 可以用来跟 kubernetes API 交互。


使用 kubernetes 原生调度的 spark 的基本设计思路是
1. 将 spark 的 driver 和 executor 都放在 kubernetes 的 pod 中运行，
2. 另外还有两个附加的组件：ResourceStagingServer 和 KubernetesExternalShuffleService。

Spark driver 其实可以运行在 kubernetes 集群内部（cluster mode）可以运行在外部（client mode），executor 只能运行在集群内部，当有 spark 作业提交到 kubernetes 集群上时，调度器后台将会为 executor pod 设置如下属性：

使用我们预先编译好的包含 kubernetes 支持的 spark 镜像，然后调用 CoarseGrainedExecutorBackend main class 启动 JVM。
调度器后台为 executor pod 的运行时注入环境变量，例如各种 JVM 参数，包括用户在 spark-submit 时指定的那些参数。
Executor 的 CPU、内存限制根据这些注入的环境变量保存到应用程序的 SparkConf 中。
可以在配置中指定 spark 运行在指定的 namespace 中。
参考：Scheduler backend 文档


### 1.1.3. Spark Operator
![](https://blog.duyet.net/static/2ac499c6725d8f7dad1c01e210a1d921/e46b2/spark-operator-architecture-diagram.webp)
首先需要理解 Spark Operator 的基础镜像是 Spark 的镜像，主要原因是 Spark Operator 会在容器中调用 spark-submit 命令来执行 Spark 任务。所以所有的 Spark Jars 等依赖在部署了 Spark Operator 的时候就已经确定了。

那么在 Spark on Kubernetes 的架构里，spark-submit 具体做了什么呢？其实在 spark-submit 主要是根据用户提交的脚本，按照各种 conf，来配置了 Driver Pod，包括 Pod 需要挂载的 Volume 等等，最后通过 k8s 的 Java Client，向 Kubernetes 的 ApiServer 发送构建 Driver Pod 的请求，然后后面的事情，spark-submit 一般就不管了，然后如何装配 Executor Pod，就由 Driver 来控制了。



Spark Operator：安装 Spark Operator，然后定义 spark-app.yaml，再执行 kubectl apply -f spark-app.yaml，这种申明式 API 和调用方式是 K8S 的典型应用方式，参考 https://github.com/GoogleCloudPlatform/spark-on-k8s-operator


# 2. 安装与配置

## 2.1. Spark standalone
参考资料

https://jimmysong.io/kubernetes-handbook/usecases/spark-standalone-on-kubernetes.html





### 2.1.1. 创建Namespace
```shell
# 1. 创建k8s  Namespace ,并命名为spark-cluster
cat << EOF > namespace-spark-cluster.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: "spark-cluster"
  labels:
    name: "spark-cluster"
EOF
kubectl create -f namespace-spark-cluster.yaml

```

### 2.1.2. 安装核心：master与Work
master与work 都用的同一个镜像，使用了不同的命令

```shell
# 2. 创建k8s  ReplicationController
## master-controller
cat << EOF > spark-master-controller.yaml
kind: ReplicationController
apiVersion: v1
metadata:
  name: spark-master-controller
  namespace: spark-cluster
spec:
  replicas: 1
  selector:
    component: spark-master
  template:
    metadata:
      labels:
        component: spark-master
    spec:
      containers:
        - name: spark-master
          image: registry.cn-hangzhou.aliyuncs.com/google_containers/spark:1.5.2_v1
          command: ["/start-master"]
          ports:
            - containerPort: 7077
            - containerPort: 8080
          resources:
            requests:
              cpu: 100m
EOF
kubectl create -f spark-master-controller.yaml
# 3. 创建k8s  服务Service ,并命名为spark-master
cat << EOF > spark-master-service.yaml
kind: Service
apiVersion: v1
metadata:
  name: spark-master
  namespace: spark-cluster
spec:
  ports:
    - port: 7077
      targetPort: 7077
      name: spark
    - port: 8080
      targetPort: 8080
      name: http
  selector:
    component: spark-master
EOF
kubectl create -f spark-master-service.yaml
```

```shell
cat << EOF >spark-worker-controller.yaml
kind: ReplicationController
apiVersion: v1
metadata:
  name: spark-worker-controller
  namespace: spark-cluster
spec:
  replicas: 2
  selector:
    component: spark-worker
  template:
    metadata:
      labels:
        component: spark-worker
    spec:
      containers:
        - name: spark-worker
          image: registry.cn-hangzhou.aliyuncs.com/google_containers/spark:1.5.2_v1
          command: ["/start-worker"]
          ports:
            - containerPort: 8081
          resources:
            requests:
              cpu: 100m
EOF
kubectl create -f spark-worker-controller.yaml
```


```shell
kubectl get svc -n spark-cluster
```

### 2.1.3. 可选

#### 2.1.3.1. Spark UI

```shell
cat << EOF >spark-ui-proxy-controller.yaml
kind: ReplicationController
apiVersion: v1
metadata:
  name: spark-ui-proxy-controller
  namespace: spark-cluster
spec:
  replicas: 1
  selector:
    component: spark-ui-proxy
  template:
    metadata:
      labels:
        component: spark-ui-proxy
    spec:
      containers:
        - name: spark-ui-proxy
          image: elsonrodriguez/spark-ui-proxy:1.0
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 100m
          args:
            - spark-master:8080
          livenessProbe:
              httpGet:
                path: /
                port: 80
              initialDelaySeconds: 120
              timeoutSeconds: 5
EOF
kubectl create -f spark-ui-proxy-controller.yaml

cat << EOF >spark-ui-proxy-service.yaml
kind: Service
apiVersion: v1
metadata:
  name: spark-ui-proxy
  namespace: spark-cluster
spec:
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
  selector:
    component: spark-ui-proxy
  type: NodePort
EOF
kubectl create -f spark-ui-proxy-service.yaml
```
#### 2.1.3.2. jupyter-pyspark(Notebook)



```shell
cat << EOF >jupyter-controller.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: spark
  name: my-notebook-deployment
  labels:
    app: my-notebook
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-notebook
  template:
    metadata:
      labels:
        app: my-notebook
    spec:
      serviceAccountName: spark
      containers:
      - name: my-notebook
        image: jupyter/pyspark-notebook
        ports:
          - containerPort: 8888
        volumeMounts:
          - mountPath: /root/data
            name: my-notebook-pv
        workingDir: /root
        resources:
          limits:
            memory: 2Gi
      volumes:
        - name: my-notebook-pv
          persistentVolumeClaim:
            claimName: my-notebook-pvc
EOF
kubectl create -f jupyter-controller.yaml

cat << EOF >jupyter-service.yaml
apiVersion: v1
kind: Service
metadata:
  namespace: spark
  name: my-notebook-deployment
spec:
  selector:
    app: my-notebook
  ports:
    - protocol: TCP
      port: 29413
  clusterIP: None
EOF
kubectl create -f jupyter-service.yaml
```



#### 2.1.3.3. Zeppelin (Notebook)
```shell
cat << EOF >zeppelin-controller.yaml
kind: ReplicationController
apiVersion: v1
metadata:
  name: zeppelin-controller
  namespace: spark-cluster
spec:
  replicas: 1
  selector:
    component: zeppelin
  template:
    metadata:
      labels:
        component: zeppelin
    spec:
      containers:
        - name: zeppelin
          image: registry.cn-hangzhou.aliyuncs.com/google_containers/zeppelin:v0.5.6_v1
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 100m
EOF
kubectl create -f zeppelin-controller.yaml

cat << EOF >zeppelin-service.yaml
kind: Service
apiVersion: v1
metadata:
  name: zeppelin
  namespace: spark-cluster
spec:
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30081
  selector:
    component: zeppelin
  type: NodePort
EOF
kubectl create -f zeppelin-service.yaml
```
## 2.2. 验证
```shell
kubectl exec -it $(kubectl get pods -n spark-cluster| grep "zeppelin-controller"| awk '{print $1 }')  -n spark-cluster pyspark
```

## 2.3. Spark Operator



```shell
# The easiest way to install the Kubernetes Operator for Apache Spark is to use the Helm chart
helm repo add incubator http://mirror.azure.cn/kubernetes/charts-incubator/
helm repo update
helm install stable/sparkoperator --generate-name --namespace spark-operato
```




```shell

helm repo add jahstreet https://jahstreet.github.io/helm-charts
helm repo update
kubectl create namespace livy
helm upgrade --install livy --namespace livy jahstreet/livy \
    --set rbac.create=true # If you are running RBAC-enabled Kubernetes cluster
kubectl get pods --namespace livy -w
# Wait until Pod `livy-0` moves to Running state

```
# 3. 连接与使用



Check that your deployment is running:
```shell
$ kubectl get all -n spark
NAME                                          READY   STATUS    RESTARTS   AGE
pod/my-notebook-deployment-7bf574447c-pdn2q   1/1     Running   0          19s
NAME                             TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)     AGE
service/my-notebook-deployment   ClusterIP   None         <none>        29413/TCP   19s
NAME                                     READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/my-notebook-deployment   1/1     1            1           19s
NAME                                                DESIRED   CURRENT   READY   AGE
replicaset.apps/my-notebook-deployment-7bf574447c   1         1         1       19s
```
And now port-forward to 8888 so you can login into Jupyter:

```shell
$ kubectl port-forward -n spark deployment.apps/my-notebook-deployment 8888:8888
Forwarding from 127.0.0.1:8888 -> 8888
Forwarding from [::1]:8888 -> 8888
Now you should be able to point your favorite browser to http://localhost:8888 and log into Jupyter (if you used my image as a reference the password is ‘jupyter’ else you will need to copy/paste the generated auth token displayed in the container’s log file).
```
Light It!
Start a new Python3 notebook and type the following in a cell:
```python

import os
from pyspark import SparkContext, SparkConf
from pyspark.sql import SparkSession
# Create Spark config for our Kubernetes based cluster manager
sparkConf = SparkConf()
sparkConf.setMaster("k8s://https://kubernetes.default.svc.cluster.local:443")
sparkConf.setAppName("spark")
sparkConf.set("spark.kubernetes.container.image", "pidocker-docker-registry.default.svc.cluster.local:5000/my-spark-py:v2.4.4")
sparkConf.set("spark.kubernetes.namespace", "spark")
sparkConf.set("spark.executor.instances", "7")
sparkConf.set("spark.executor.cores", "2")
sparkConf.set("spark.driver.memory", "512m")
sparkConf.set("spark.executor.memory", "512m")
sparkConf.set("spark.kubernetes.pyspark.pythonVersion", "3")
sparkConf.set("spark.kubernetes.authenticate.driver.serviceAccountName", "spark")
sparkConf.set("spark.kubernetes.authenticate.serviceAccountName", "spark")
sparkConf.set("spark.driver.port", "29413")
sparkConf.set("spark.driver.host", "my-notebook-deployment.spark.svc.cluster.local")
# Initialize our Spark cluster, this will actually
# generate the worker nodes.
spark = SparkSession.builder.config(conf=sparkConf).getOrCreate()
sc = spark.sparkContext
```
Let’s break down the Spark config above:
We set the master URL to “k8s://https://kubernetes.default.svc.cluster.local:443" which tells Spark that our cluster manager is Kubernetes (k8s) and where to find the kube-apiserver to request resources
We set the application name to “spark” which will be prepended to the worker Pod names. Feel free to use whatever name you deem appropriate
We set the container image to use for the worker Pods to the custom one we built above that has the updated Kubernetes client jar files in it
We specify that we want all worker nodes to be created in the spark namespace
I set the number of worker nodes to “7” since I am on eight node closer (one node is the master, seven are available for work). You need to pick a number that makes sense for your cluster.
We set the service account names for both the driver and workers to our ServiceAccount wecreated above (“spark”)
Finally, we set the port number to 29413 and the fully qualified domain name of my in-cluster service which specifies to the worker nodes where to contact the driver node.
After you execute this cell, you should see a number of worker Pods being spawned in the spark namespace.
Let’s check it:

# 4. 参考资料

1. [3 ways to run Spark on Kubernetes
](https://blog.duyet.net/2020/05/spark-on-k8s.html)

1. [spark官方 running-on-kubernetes](https://spark.apache.org/docs/latest/running-on-kubernetes.html)
2. https://jimmysong.io/kubernetes-handbook/usecases/spark-standalone-on-kubernetes.html
