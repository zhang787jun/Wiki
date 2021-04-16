---
title: "Jupyter Notebooks on Kubernetes"
layout: page
date: 2099-06-02 00:00
---

# Jupyter Notebooks on Kubernetes

## Prerequisites

- [1 - Docker Basics](../1-docker)
- [2 - Kubernetes Basics and cluster created](../2-kubernetes)
- [4 - Kubeflow](../4-kubeflow)

## Summary

In this module, you will learn how to:

- Run Jupyter Notebooks locally using Docker
- Run JupyterHub on Kubernetes using Kubeflow

## How Jupyter Notebooks work

The [Jupyter Notebook](http://jupyter.org/) is an open source web application that allows users to create and share documents that contain live code, equations, visualizations, and narrative text for rapid prototyping. It is often used for data cleaning and transformation, numerical simulation, statistical modeling, data visualization, machine learning, and more. To better support exploratory iteration and to accelerate computation of Tensorflow jobs, let's look at how we can include data science tools like Jupyter Notebook with Docker and Kubernetes.

## How JupyterHub works

The [JupyterHub](https://jupyterhub.readthedocs.io/en/latest/) is a multi-user Hub, spawns, manages, and proxies multiple instances of the single-user Jupyter notebook server. JupyterHub can be used to serve notebooks to a class of students, a corporate data science group, or a scientific research group. Let's look at how we can create JupyterHub to spawn multiple instances of Jupyter Notebook on Kubernetes using Kubeflow.

## Exercises

### Exercise 1: Run Jupyter Notebooks locally using Docker

In this first exercise, we will run Jupyter Notebooks locally using Docker. We will use the official tensorflow docker image as it comes with Jupyter notebook.

```console
docker run -it -p 8888:8888 tensorflow/tensorflow
```

#### Validation

To verify, browse to the url in the output log.

For example: `http://localhost:8888/?token=a3ea3cd914c5b68149e2b4a6d0220eca186fec41563c0413`

### Exercise 2: Run JupyterHub on Kubernetes using Kubeflow

In this exercise, we will run JupyterHub to spawn multiple instances of Jupyter Notebooks on a Kubernetes cluster using Kubeflow.




```shell
NAMESPACE=kubeflow
kubectl get svc -n=${NAMESPACE}

NAME               TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
...
jupyter-0                                ClusterIP   None           <none>        8000/TCP            132m
jupyter-lb                               ClusterIP   10.0.191.68    <none>        80/TCP              132m
```

To connect to the Kubeflow dashboard locally:

```bash
kubectl port-forward    svc/ambassador -n ${NAMESPACE} 8080:80
```

Then navigate to JupyterHub: http://localhost:8080/hub

[Optional] To connect to your JupyterHub over a public IP:

To update the default service created for JupyterHub, run the following command to change the service to type LoadBalancer:

```bash
cd ks_app
ks param set jupyter serviceType LoadBalancer
cd ..
${KUBEFLOW_SOURCE}/scripts/kfctl.sh apply k8s
```

创建一个新的Jupyter Notebook 实例
- 浏览器打开hub
- 登入
- 点击`Start My Server` 按钮
- 选择 images
- CPU 内存限制



# Distributed TensorFlow with Kubernetes and TFJob
Thankfully, with Kubernetes and TFJob things are much, much simpler, making distributed training something you might actually be able to benefit from.

Before submitting a training job, you should have deployed Kubeflow to your cluster. Doing so ensures that the TFJob custom resource is available when you submit the training job.

1. 在集群中部署Kubeflow
2. TFJob 自定义资源




Overview of TFJob distributed training
So, how does TFJob work for distributed training? Let's look again at what the TFJobSpecand TFReplicaSpec objects looks like:
TFJobSpec Object
Field
Type
Description
ReplicaSpecs
TFReplicaSpec array
Specification for a set of TensorFlow processes, defined below
TFReplicaSpec Object
Note the last parameter IsDefaultPS that we didn't talk about before.
Field
Type
Description
TfReplicaType
string
What type of replica are we defining? Can be MASTER, WORKER or PS. When not doing distributed TensorFlow, we just use MASTER which happens to be the default value.
Replicas
int
Number of replicas of TfReplicaType. Again this is useful only for distributed TensorFLow. Default value is 1.
Template
PodTemplateSpec
Describes the pod that will be created when executing a job. This is the standard Pod description that we have been using everywhere.
IsDefaultPS
boolean
Whether the parameter server should be using a default image or a custom one (default to true)
In case the distinction between master and workers is not clear, there is a single master per TensorFlow cluster, and it is in fact a worker. The difference is that the master is the worker that is going to handle the creation of the tf.Session, write logs and save the model.
As you can see, TFJobSpec and TFReplicaSpec allow us to easily define the architecture of the TensorFlow cluster we would like to setup.
Once we have defined this architecture in a TFJob template and deployed it with kubectl create, the operator will do most of the work for us. For each master, worker and parameter server in our TensorFlow cluster, the operator will create a service exposing it so they can communicate.
It will then create an internal representation of the cluster with each node and it's associated internal DNS name.


For example, if you were to create a TFJob with 1 MASTER, 2 WORKERS and 1 PS, this representation would look similar to this:
```json
{  
    "master":[  
        "distributed-mnist-master-5oz2-0:2222"
    ],
    "ps":[  
        "distributed-mnist-ps-5oz2-0:2222"
    ],
    "worker":[  
        "distributed-mnist-worker-5oz2-0:2222",
        "distributed-mnist-worker-5oz2-1:2222"
    ]
}
```
Finally, the operator will create all the necessary pods, and in each one, inject an environment variable named Tf_CONFIG, containing the cluster specification above, as well as the respective job name and task id that each node of the TensorFlow cluster should assume.
For example, here is the value of the TF_CONFIG environment variable that would be sent to worker 1:
```json
{  
   "cluster":{  
      "master":[  
         "distributed-mnist-master-5oz2-0:2222"
      ],
      "ps":[  
         "distributed-mnist-ps-5oz2-0:2222"
      ],
      "worker":[  
         "distributed-mnist-worker-5oz2-0:2222",
         "distributed-mnist-worker-5oz2-1:2222"
      ]
   },
   "task":{  
      "type":"worker",
      "index":1
   },
   "environment":"cloud"
}
```
As you can see, this completely takes the responsibility of building and maintaining the ClusterSpec away from you. All you have to do, is modify your code to read the TF_CONFIG and act accordingly.
Modifying your model to use TFJob's TF_CONFIG
Concretely, let's see how you would modify your code:
```python

# Grab the TF_CONFIG environment variable
tf_config_json = os.environ.get("TF_CONFIG", "{}")

# Deserialize to a python object
tf_config = json.loads(tf_config_json)

# Grab the cluster specification from tf_config and create a new tf.train.ClusterSpec instance with it
cluster_spec = tf_config.get("cluster", {})
cluster_spec_object = tf.train.ClusterSpec(cluster_spec)

# Grab the task assigned to this specific process from the config. job_name might be "worker" and task_id might be 1 for example
task = tf_config.get("task", {})
job_name = task["type"]
task_id = task["index"]

# Configure the TensorFlow server
server_def = tf.train.ServerDef(
    cluster=cluster_spec_object.as_cluster_def(),
    protocol="grpc",
    job_name=job_name,
    task_index=task_id)
server = tf.train.Server(server_def)

# checking if this process is the chief (also called master). The master has the responsibility of creating the session, saving the summaries etc.
is_chief = (job_name == 'master')

# Notice that we are not handling the case where job_name == 'ps'. That is because `TFJob` will take care of the parameter servers for us by default.
As for any distributed TensorFlow training, you will then also need to modify your model to split the operations and variables among the workers and parameter servers as well as create on session on the master.
Exercises
1 - Modifying Our MNIST Example to Support Distributed Training
1. a.
Starting from the MNIST sample we have been working with so far, modify it to work with distributed TensorFlow and TFJob. You will then need to build the image and push it (you should push it under a different name or tag to avoid overwriting what you did before).
cd 7-distributed-tensorflow/solution-src
# build from tensorflow/tensorflow:gpu for master and workers
docker build -t ${DOCKER_USERNAME}/tf-mnist:distributedgpu -f ./Dockerfile.gpu .

# builld from tensorflow/tensorflow for the parameter server
docker build -t ${DOCKER_USERNAME}/tf-mnist:distributed .
1. b.
Modify the yaml template from module 6 - TFJob, to instead deploy 1 master, 2 workers and 1 PS. Then create a yaml to deploy TensorBoard to monitor the training with TensorBoard. Note that since our model is very simple, TensorFlow will likely use only 1 of the workers, but it will still work fine. Don't forget to update the image or tag.
Validation
kubectl get pods
Should yield:
NAME                                       READY     STATUS              RESTARTS   AGE
module6-ex1-master-m8vi-0-rdr5o            1/1       Running   0          23s
module6-ex1-ps-m8vi-0-0vhjm                1/1       Running   0          23s
module6-ex1-worker-m8vi-0-eyb6l            1/1       Running   0          23s
module6-ex1-worker-m8vi-1-bm2ue            1/1       Running   0          23s
looking at the logs of the master with:
kubectl logs <master-pod-name>
Should yield:
[...]
Initialize GrpcChannelCache for job master -> {0 -> localhost:2222}
Initialize GrpcChannelCache for job ps -> {0 -> module6-ex1-ps-m8vi-0:2222}
Initialize GrpcChannelCache for job worker -> {0 -> module6-ex1-worker-m8vi-0:2222, 1 -> module6-ex1-worker-m8vi-1:2222}
2018-04-30 22:45:28.963803: I tensorflow/core/distributed_runtime/rpc/grpc_server_lib.cc:333] Started server with target: grpc://localhost:2222
...

Accuracy at step 970: 0.9784
Accuracy at step 980: 0.9791
Accuracy at step 990: 0.9796
Adding run metadata for 999
This indicates that the ClusterSpec was correctly extracted from the environment variable and given to TensorFlow.
Once the TensorBoard pod is provisioned and running, we can connect to it using:
PODNAME=$(kubectl get pod -l app=tensorboard -o jsonpath='{.items[0].metadata.name}')
kubectl port-forward ${PODNAME} 6006:6006
From the browser, connect to it at http://127.0.0.1:6006, you should see that your model is indeed correctly distributed between workers and PS:

After a few minutes, the status of both worker nodes should show as Completed when doing kubectl get pods -a.
Solution
A working code sample is available in solution-src/main.py.
TFJob's Template
TensorBoard Template


```