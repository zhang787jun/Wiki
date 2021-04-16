---
title: "Tensorflow_Operator "
layout: page
date: 2099-06-02 00:00
---
[TOC]
# 1. 练习1 

## 1.1. 步骤 

在容器（或容器集群）中运行训练脚本，首先需要构建容器镜像

1. 构建**程序运行**的容器镜像

```shell
vim Dockerfile
>>>
```
Dockerfile 文件内容如下：
```Dockerfile
FROM tensorflow/tensorflow:1.10.0
# 拉取tensorflow 镜像
COPY main.py /app/main.py
# 将本地的main.py 文件复制到镜像指定目录中

ENTRYPOINT ["python", "/app/main.py"]
# ENTRYPOINT指令指定的运行命令的参数，运行 python /app/main.py 程序
```
2. 修改TFJob 的定制`yaml` 模板

    定义 1 master, 2 workers and 1 PS， 1 TensorBoard




```yml
apiVersion: kubeflow.org/v1beta1
kind: TFJob
metadata:
  name: module6-ex1-gpu
spec:
  tfReplicaSpecs:
    MASTER:
      replicas: 1
      template:
        spec:
          containers:
            - image: <DOCKER_USERNAME>/tf-mnist:gpu #改成自定义的镜像
              name: tensorflow
              resources:
                limits:
                  nvidia.com/gpu: 1
          restartPolicy: OnFailure

```


tf_operator的工作就是
1. 创建对应的5个Pod, 
2. 将环境变量TF_CONFIG传入到**每个Pod**中，
 
- TF_CONFIG包含三部分的内容：
  1. 当前**集群** ClusterSpec；
  2. 该**节点**的角色类型；
  3. 节点id。
  
比如该Pod为worker0，它所收到的环境变量TF_CONFIG为:

```json
{  
   //1. 集群信息 
   "cluster":{  
      "master":[  
         "distributed-mnist-master-0:2222"
      ],
      "ps":[  
         "distributed-mnist-ps-0:2222"
      ],
      "worker":[  
         "distributed-mnist-worker-0:2222",
         "distributed-mnist-worker-1:2222"
      ]
   },
   // 2. Node role 节点角色
   "task":{  
      "type":"worker",
      "index":0
   },
   //3. 节点环境
   "environment":"cloud"
}
```
在这里,tf_operator负责将集群拓扑的发现和配置工作完成，免除了使用者的麻烦。对于使用者来说，他只需要在这里代码中使用通过获取环境变量TF_CONFIG中的上下文。

```shell
kubectl create -f <template-path>


# 从环境变量TF_CONFIG中读取json格式的数据
tf_config_json = os.environ.get("TF_CONFIG", "{}")

# 反序列化成python对象
tf_config = json.loads(tf_config_json)

# 获取Cluster Spec
cluster_spec = tf_config.get("cluster", {})
cluster_spec_object = tf.train.ClusterSpec(cluster_spec)

# 获取角色类型和id， 比如这里的job_name 是 "worker" and task_id 是 0
task = tf_config.get("task", {})
job_name = task["type"]
task_id = task["index"]

# 创建TensorFlow Training Server对象
server_def = tf.train.ServerDef(
    cluster=cluster_spec_object.as_cluster_def(),
    protocol="grpc",
    job_name=job_name,
    task_index=task_id)
server = tf.train.Server(server_def)

# 如果job_name为ps，则调用server.join()
if job_name == 'ps':
    server.join()

# 检查当前进程是否是master， 如果是master，就需要负责创建session和保存summary。
is_chief = (job_name == 'master')


# 通常分布式训练的例子只有ps和worker两个角色，而在TFJob里增加了master这个角色，实际在分布式TensorFlow的编程模型并没有这个设计。而这需要使用TFJob的分布式代码里进行处理，不过这个处理并不复杂，只需要将master也看做worker_device的类型
with tf.device(tf.train.replica_device_setter(
    worker_device="/job:{0}/task:{1}".format(job_name,task_id),
    cluster=cluster_spec)):
```