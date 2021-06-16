---
title: "TFJob"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 什么是 TFJob

TFJob provides a Kubernetes custom resource that makes it easy to run distributed or non-distributed TensorFlow jobs on Kubernetes.


提供了在Kubernetes集群上方便运行分布式/非分布式Tensorflow任务的脚本


In this module you will learn how to **describe a TensorFlow training using `TFJob` object.**

用来描述Tensorflow 任务的 一个对象(yaml) 

### 1.0.1. Kubernetes Custom Resource Definition

Kubernetes has a concept of [Custom Resources](https://kubernetes.io/docs/concepts/api-extension/custom-resources/) (often abbreviated CRD) that allows us to create custom object that we will then be able to use.
In the case of Kubeflow, after installation, a new `TFJob` object will be available in our cluster. This object allows us to describe a TensorFlow training.

TFJob对象在kubeflow中的概念在 类似CRD在k8s 中的地位 

#### 1.0.1.1. `TFJob` Specifications

Before going further, let's take a look at what the `TFJob` object looks like:

> Note: Some of the fields are not described here for brevity.

**`TFJob` Object**

| Field      | Type                                                                                                               | Description                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| apiVersion | `string`                                                                                                           | Versioned schema of this representation of an object. In our case, it's `kubeflow.org/v1beta1` |
| kind       | `string`                                                                                                           | Value representing the REST resource this object represents. In our case it's `TFJob`          |
| metadata   | [`ObjectMeta`](https://github.com/kubernetes/community/blob/master/contributors/devel/api-conventions.md#metadata) | Standard object's metadata.                                                                    |
| spec       | `TFJobSpec`                                                                                                        | The actual specification of our TensorFlow job, defined below.                                 |

`spec` is the most important part, so let's look at it too:

**`TFJobSpec` Object**

| Field         | Type                  | Description                                                    |
| ------------- | --------------------- | -------------------------------------------------------------- |
| TFReplicaSpec | `TFReplicaSpec` array | Specification for a set of TensorFlow processes, defined below |

Let's go deeper:

**`TFReplicaSpec` Object**

| Field         | Type                                                                                        | Description                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TfReplicaType | `string`                                                                                    | What type of replica are we defining? Can be `MASTER`, `WORKER` or `PS`. When not doing distributed TensorFlow, we just use `MASTER` which happens to be the default value. |
| Replicas      | `int`                                                                                       | Number of replicas of `TfReplicaType`. Again this is useful only for distributed TensorFLow. Default value is `1`.                                                          |
| Template      | [`PodTemplateSpec`](https://kubernetes.io/docs/api-reference/v1.8/#podtemplatespec-v1-core) | Describes the pod that will be created when executing a job. This is the standard Pod description that we have been using everywhere.                                       |

Here is what a simple TensorFlow training looks like using this `TFJob` object:

```yaml
apiVersion: kubeflow.org/v1beta1
kind: TFJob
metadata:
  name: example-tfjob
spec:
  tfReplicaSpecs:
    MASTER:
      replicas: 1
      template:
        spec:
          containers:
            - image:  wbuchwalter/tf-mnist:gpu
              name: tensorflow
              resources:
                limits:
                  nvidia.com/gpu: 1
          restartPolicy: OnFailure
```

Note that we are note specifying `TfReplicaType` or `Replicas` as the default values are already what we want.

# 2. 实践 
## 2.1. 单机`TFJob`

Let's schedule a very simple TensorFlow job using `TFJob` first.

> Note: If you completed the exercise in Module 1 and 2, you can change the image to use the one you pushed instead.

When using GPU, we need to request for one (or multiple), and the image we are using also needs to be based on TensorFlow's GPU image.


创建 `tfjod.yaml` 如下：
```shell
cat << EOF > tfjod.yaml
apiVersion: kubeflow.org/v1
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
            - image: wbuchwalter/tf-mnist:gpu # 从镜像中拉取
              name: tensorflow
              resources:
                limits:
                  nvidia.com/gpu: 1
          restartPolicy: OnFailure
EOF
kubectl create -f  tfjod.yaml
```

Let's look at what has been created in our cluster.

First a `TFJob` was created:

```console
kubectl get tfjob
```

Returns:

```
NAME              AGE
module6-ex1-gpu   5s
```

As well as a `Pod`, which was actually created by the operator:

```console
kubectl get pod
```

Returns:

```
NAME                                            READY     STATUS      RESTARTS   AGE
module6-ex1-master-xs4b-0-6gpfn                 1/1       Running     0          2m
```

Note that the `Pod` might take a few minutes before actually running, the docker image needs to be pulled on the node first.

Once the `Pod`'s status is either `Running` or `Completed` we can start looking at it's logs:

```console
kubectl logs <your-pod-name>
```

This container is pretty verbose, but you should see a TensorFlow training happening:

```
[...]
INFO:tensorflow:2017-11-20 20:57:22.314198: Step 480: Cross entropy = 0.142486
INFO:tensorflow:2017-11-20 20:57:22.370080: Step 480: Validation accuracy = 85.0% (N=100)
INFO:tensorflow:2017-11-20 20:57:22.896383: Step 490: Train accuracy = 98.0%
INFO:tensorflow:2017-11-20 20:57:22.896600: Step 490: Cross entropy = 0.075210
INFO:tensorflow:2017-11-20 20:57:22.945611: Step 490: Validation accuracy = 91.0% (N=100)
INFO:tensorflow:2017-11-20 20:57:23.407756: Step 499: Train accuracy = 94.0%
INFO:tensorflow:2017-11-20 20:57:23.407980: Step 499: Cross entropy = 0.170348
INFO:tensorflow:2017-11-20 20:57:23.457325: Step 499: Validation accuracy = 89.0% (N=100)
INFO:tensorflow:Final test accuracy = 88.4% (N=353)
[...]
```


## 2.2. 分布式


1. 通过 storageClass 创建pvc
```shell

cat << EOF >test-claim.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: kubeflow-nas-mnist-pvc
spec:
  storageClassName:  kubeflow-nfs-storage
  accessModes:
    - ReadWriteMany
  resources: 
    requests:
      storage: 500Mi
EOF
kubectl apply -f test-claim.yaml
```

2. 创建 tfjod 声明
```shell
cat << EOF > tfjod.yaml
apiVersion: kubeflow.org/v1
kind: TFJob
metadata:
  name: mnist-simple-gpu-dist
spec:
  tfReplicaSpecs:
    Chief:
      replicas: 1
      template:
        spec:
          containers:
            - image: registry.aliyuncs.com/tensorflow-samples/tf-mnist-distributed:gpu
              name: tensorflow
              env:
                - name: TEST_TMPDIR
                  value: /training
              command: ["python", "/app/main.py"]
              resources:
                limits:
                  nvidia.com/gpu: 1
              volumeMounts:
              - name: kubeflow-nas-mnist
                mountPath: "/data"
          volumes:
            - name: kubeflow-nas-mnist
              persistentVolumeClaim:
                claimName: kubeflow-nas-mnist-pvc
          restartPolicy: OnFailure
    WORKER: # 1 or 2 Workers depends on how many gpus you have
      replicas: 2
      template:
        spec:
          containers:
            - image: registry.aliyuncs.com/tensorflow-samples/tf-mnist-distributed:gpu
              name: tensorflow
              env:
                - name: TEST_TMPDIR
                  value: /training
              command: ["python", "/app/main.py"]
              imagePullPolicy: Always
              resources:
                limits:
                  nvidia.com/gpu: 1
              volumeMounts:
              - name: kubeflow-nas-mnist
                mountPath: "/data"
          volumes:
            - name: kubeflow-nas-mnist
              persistentVolumeClaim:
                claimName: kubeflow-nas-mnist-pvc
          restartPolicy: OnFailure
    PS: # 1 Parameter server
      replicas: 1
      template:
        spec:
          containers:
            - image: registry.aliyuncs.com/tensorflow-samples/tf-mnist-distributed:cpu
              name: tensorflow
              command: ["python", "/app/main.py"]
              env:
                - name: TEST_TMPDIR
                  value: /training
              imagePullPolicy: Always
              volumeMounts:
              - name: kubeflow-nas-mnist
                mountPath: "/data"
          volumes:
            - name: kubeflow-nas-mnist
              persistentVolumeClaim:
                claimName: kubeflow-nas-mnist-pvc
          restartPolicy: OnFailure
EOF
kubectl create -f  tfjod.yaml
# kubectl delete -f  tfjod.yaml
```