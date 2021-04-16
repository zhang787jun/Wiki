---
title: "Arena--基于Kubeflow的简化命令工具（阿里）"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# 1. 概述


Arena（阿里云Kubernetes深度学习工具）是一种命令行界面工具，可以很方便、快捷地运行和监控机器学习训练作业，并检查结果。它兼容多种深度学习框架，是kubeflow 的一个子项目

简而言之， Arena 的目标是让数据科学家感觉自己就像是在一台机器上工作，而实际上还可以享受到 GPU 集群的强大力量。


## 1.1. 解决痛点

数据科学->需要集群计算->资源调度->虚拟化技术->容器技术->容器调度技术

Docker->Kubernetres->KubeFlow

**用户需要学习的路线图**

| id  | Module                          | Description            |
| --- | ------------------------------- | ---------------------- |
| 0   | Introduction                    |                        |
| 1   | Docker                          | 容器化                 |
| 2   | Kubernetes                      | 集容器群               |
| 3   | Helm                            | 包管理                 |
| 4   | Kubeflow                        | 基于k8s的数据科学计算. |
| 5   | JupyterHub                      |                        |
| 6   | TFJob                           |                        |
| 7   | Distributed Tensorflow          |                        |
| 8   | Hyperparameters Sweep with Helm |                        |
| 9   | Serving                         |                        |
| 10  | Going Further                   |                        |

现在Kubernetres社区最流行的深度学习解决方案是KubeFlow，Arena是不是又重新造了个轮子？KubeFlow是基于Kubernetes构建的可组合，便携式, 可扩展的机器学习技术栈，支持实现从JupyterHub模型开发，TFJob模型训练到TF-serving，Seldon预测端到端的解决方案。但是KubeFlow需要用户精通Kubernetes，比如写一个TFJob的部署yaml文件，这对于机器学习平台最主要的使用者---数据科学家来说是非常有挑战的事情。

这与数据科学家的期望还有比较大的差距，数据科学家关心的是三件事：

1. 数据从哪里来
2. 如何运行机器学习的代码
3. 训练结果（模型和日志）如何查看
   
数据科学家编写一些简单的脚本，在桌面机上运行机器学习代码，这是他们熟悉和喜欢的工作方式。但是利用桌面机进行模型训练，又会遇到由于硬盘空间有限导致处理数据量不足，无法使用分布式训练导致计算力受限等问题。

为此我们开发了Arena，用一个命令行工具屏蔽所有底层资源、环境管理、任务调度和GPU调度分配的复杂性，它帮助数据科学家以一种简单熟悉的方式提交训练任务并且检查训练进展。数据科学家在调用Arena的时候可以指定数据来源，代码下载和是否使用TensorBoard查看训练效果。



# 2. 安装

**源码编译**
```shell
# 1. GO
apt get install golang-go
# 
GOPATH="/etc/src/go"
mkdir -p $GOPATH/src/github.com/kubeflow
cd $GOPATH/src/github.com/kubeflow
git clone https://github.com/kubeflow/arena.git
cd arena
make
```

**二进制包**

```shell
wget https://github.com/AliyunContainerService/arena/archive/v0.2.0-rc.0.tar.gz

mkdir ~/tmp_dir
tar -xzf v0.2.0-rc.0.tar.gz -C ~/tmp_dir
```
# 3. 基本使用

`arena completion` - output shell completion code for the specified shell (bash or zsh)
`arena data` - manage data.
`arena delete` - delete a training job and its associated pods
`arena get` - display details of a training job
`arena list` - list all the training jobs
`arena logs` - print the logs for a task of the training job
`arena logviewer` - display Log Viewer URL of a training job
`arena prune` - prune history job
`arena serve` - Serve a job.
`arena submit` - Submit a job.
`arena top` - Display Resource (GPU) usage.
`arena version` - Print version information


## 3.1. 查看版本

```shell
arena version
>>>
arena: v0.3.0+37707f2
  BuildDate: 2019-12-23T07:01:46Z
  GitCommit: 37707f2d66441a9ce749c7936173623a95756aaa
  GitTreeState: clean
  GoVersion: go1.10.4
  Compiler: gc
  Platform: linux/amd64

```
## 3.1.1. 查看节点

```shell
arena top node
>>>
NAME    IPADDRESS      ROLE    STATUS  GPU(Total)  GPU(Allocated)
master  172.24.195.42  master  ready   0           0
node3   172.24.195.41  <none>  ready   0           0
-----------------------------------------------------------------------------------------
Allocated/Total GPUs In Cluster:
0/0 (0%)

```

## 3.2. 提交作业

2.现在，我们可以通过 arena 提交一个训练作业，本示例从 github 下载源代码

```shell
#
arena submit tf \
             --name=tf-git \ # app name
             --gpus=1 \  # 
             --image=tensorflow/tensorflow:1.5.0-devel-gpu \
             --syncMode=git \
             --syncSource=https://github.com/cheyang/tensorflow-sample-code.git \
             "python code/tensorflow-sample-code/tfjob/docker/mnist/main.py --max_steps 10000 --data_dir=code/tensorflow-sample-code/data"
configmap/tf-git-tfjob created
configmap/tf-git-tfjob labeled
tfjob.kubeflow.org/tf-git created
INFO[0000] The Job tf-git has been submitted successfully
INFO[0000] You can run `arena get tf-git --type tfjob` to check the job status
```
这会下载源代码，并将其解压缩到工作目录的 code/ 目录。默认的工作目录是 /root，您也可以使用 --workingDir 加以指定。

如果您正在使用非公开 git 代码库，则可以使用以下命令：

```shell
arena submit tf \
             --name=tf-git \
             --gpus=1 \
             --image=tensorflow/tensorflow:1.5.0-devel-gpu \
             --syncMode=git \
             --syncSource=https://github.com/cheyang/tensorflow-sample-code.git \
             --env=GIT_SYNC_USERNAME=yourname \
             --env=GIT_SYNC_PASSWORD=yourpwd \
             "python code/tensorflow-sample-code/tfjob/docker/mnist/main.py"
```

# 4. 参考资料

[1] [官方github资源](https://github.com/AliyunContainerService/arena/blob/master/README_cn.md)

