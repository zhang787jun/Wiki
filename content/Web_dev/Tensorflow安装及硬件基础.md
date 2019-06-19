---
title: "Tensorflow的硬件基础及安装"
date: 2019-06-17 00:00
---

# Tensorflow的硬件基础及安装

[TOC]
[![The MIT License](http://img.shields.io/badge/license-MIT-yellow.svg)](https://github.com/tankywoo/simiki/blob/master/LICENSE)




## 1. 硬件基础 

### 1.1 CPU

#### 1.1.1 指令集问题
>**背景**
`指令集`是存储在CPU内部，对CPU运算进行指导和优化的硬程序。拥有这些指令集，CPU就可以更高效地运行。
Intel主要有 [x86，EM64T，MMX，SSE，SSE2，SSE3，SSSE3 (Super SSE3)，SSE4A，SSE4.1，SSE4.2，AVX，AVX2，AVX-512，VMX] **（时间排序）** 等指令集。
AMD主要是x86，x86-64，3D-Now!指令集。

>**为兼容低版本CPU,从pip 源 安装的 tensorlfow 默认不适用高级指令集，使得运算没有充分利用硬件**



| 厂家  | 指令集 | 说明                                                      |                                                                              |
| :---- | :----- | :-------------------------------------------------------- | :--------------------------------------------------------------------------- |
| Intel | SSE2   | Streaming SIMD Extensions                                 |
| Intel | AVX    | 高级矢量扩展,Intel Advanced Vector Extensions (Intel AVX) | AVX引入了融合乘法累加（FMA）运算，加速了线性代数计算，即点积，矩阵乘法，卷积 |

#### 1.1.2 虚拟化问题

**`虚拟化`** 就是由位于下层的软件模块，根据上层的软件模块的期待，抽象（虚拟）出一个虚拟的软件或硬件模块，使上一层软件直接运行在这个与自己期待完全一致的虚拟环境上。

CPU 虚拟化 主要指 intel 的 VT-x 和 AMD 的 AMD-V 为主的硬件辅助的 CPU 虚拟化技术
其中，Intel VT 包括 VT-x （支持 CPU 虚拟化）、EPT（支持内存虚拟化）和 VT-d（支持 I/O 虚拟化）


VMM 全称是 Virtual Machine Monitor，虚拟机监控系统，也叫 Hypervisor，是虚拟化层的具体实现。主要是**`以软件的方式，实现一套和物理主机环境完全一样的虚拟环境`**，物理主机有的所有资源，包括 CPU、内存、网络 IO、设备 IO等等

KVM 是一种硬件辅助的虚拟化技术，支持 Intel VT-x 和 AMD-v 技术，怎么知道 CPU 是否支持 KVM 虚拟化呢？可以通过如下命令查看：

CPU 是否支持虚拟化关系到是否能使用docker 等虚拟化工具 

#### 1.1.3 CPU硬件识别

使用 **英特尔® 处理器识别实用程序** 产看 intel 系列 CPU 数据

https://www.intel.cn/content/www/cn/zh/support/products/5982/processors/processor-utilities-and-programs/intel-processor-identification-utility.html

### 1.2 GPU
集成显卡: 是指集成在CPU内部的GPU模块
独立显卡: 

查看设备GPU情况
* For window
设备管理器->显示适配器
* For Linux

#### 1.2.1 NVIDIA独立显卡
##### 1.2.1.1 显卡驱动 
下载地址：
https://www.nvidia.cn/Download/index.aspx?lang=cn


##### 1.2.1.2 CUDA
CUDA（Compute Unified Device Architecture），是显卡厂商NVIDIA推出的运算平台。
###### 1. 支持CUDA平台的GPU硬件型号

https://developer.nvidia.com/cuda-gpus

###### 2. CUDA 核心工具包(CUDA Toolkit)

下载地址：
https://developer.nvidia.com/cuda-downloads
* 注意平台及版本号，最新版本的cuda 工具包未必能和最新的tensorflow 对应上

Windows 平台下安装指南
https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html
其他平台安装指南
https://docs.nvidia.com/cuda/cuda-quick-start-guide/index.html

安装要求

1. A CUDA-capable GPU(硬件)
2. A supported version of Microsoft Windows（操作系统）
3. A supported version of Microsoft Visual Studio（注意非常重要!）
4. the NVIDIA CUDA Toolkit （安装包）


安装成功检验：
Fro windows:
```shell
nvcc --version # 产看版本号
>>>
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2017 NVIDIA Corporation

Built on Fri_Sep__1_21:08:32_Central_Daylight_Time_2017
Cuda compilation tools, release 9.0, V9.0.176
```

For Linux:

```shell
cat /usr/local/cuda/version.txt
```



###### 3. CUDA深度神经网络库(cuDNN)

The NVIDIA CUDA® Deep Neural Network library (cuDNN) 是主要适用于深度神经网络的GPU加速器， cuDNN 为一些标准的神经网络（如前反馈、后反馈、卷积、池化、活化等 ） 提供了高适应性的基础设施。
下载地址：
https://developer.nvidia.com/cudnn （需要注册）

For Linux
```shell
cat /usr/local/cuda/include/cudnn.h | grep CUDNN_MAJOR -A 2
```



##### 1.2.1.3 性能监控 

nvidia-smi简称NVSMI，提供监控GPU使用情况和更改GPU状态的功能，是一个跨平台工具，它支持所有标准的NVIDIA驱动程序支持的Linux发行版以及从WindowsServer 2008 R2开始的64位的系统。该工具是NVIDIA显卡卡驱动附带的，只要安装好驱动后就会有它。

```shell
nvidia-smi
>>>
Sun Jun 09 17:19:48 2019
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 385.54                 Driver Version: 385.54                    |
|-------------------------------+----------------------+----------------------+
| GPU  Name            TCC/WDDM | Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  GeForce 940MX      WDDM  | 00000000:01:00.0 Off |                  N/A |
| N/A   49C    P8    N/A /  N/A |     26MiB /  1024MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+

+-----------------------------------------------------------------------------+
| Processes:                                                       GPU Memory |
|  GPU       PID   Type   Process name                             Usage      |
|=============================================================================|
|  No running processes found                                                 |
+-----------------------------------------------------------------------------+
```
gpustat：基于nvidia-smi的监控GPU 小工具
```shell
pip install gpustat # 通过pip源安装
watch --color -n1 gpustat -cpu # Linux only
```


#### 1.2.2 AMD 独立显卡

##### 1.2.2.1. 显卡驱动

##### 1.2.2.2. ROCm 平台
##### 1.2.2.3. 性能监控


### 1.3 网络通信层
--（无需额外操作）
Tensorflow 的网络通信层：基于GRPC和RDMA两种通信方式，实现组件间数据通信。

#### 1.3.1 gRPC

grpc 是由 google 开发，是一款语言中立、平台中立、开源的远程过程调用(RPC)系统。


##### 1.3.1.1 RPC 系统

RPC 的全称是 Remote Procedure Call 是一种进程间通信方式。它`允许程序调用另一个地址空间（通常是共享网络的另一台机器上）的过程或函数`，而不用程序员显式编码这个远程调用的细节。

**即程序员无论是调用本地的还是远程的，本质上编写的调用代码基本相同。**

###### 1. 系统组成
    rpc系统包括5部分:
        1. User
        2. User-stub
        3. RPCRuntime
        4. Server-stub
        5. Server
这里 user 就是 client 端，当 user 想发起一个远程调用时，它实际是通过本地调用 user-stub。user-stub 负责将调用的接口、方法和参数通过约定的协议规范进行编码并通过本地的 RPCRuntime 实例传输到远端的实例。远端 RPCRuntime 实例收到请求后交给 server-stub 进行解码后发起本地端调用，调用结果再返回给 user 端。

    ![avatar](./iamges/rpc_stucture.jpg)
###### 2. rpc 过程
![avatar](https://cn.bing.com/th?id=OIP.ZxToE8_oOyXZw4aKKlrehgHaHH&pid=Api&rs=1&p=0)


###### 3. 服务开启
>在windows 系统中：
"开始"→"设置"→"控制面板"->"管理工具"→"服务"->"remote procedure call (rpc)"，开启rpc服务

> 在
##### 1.3.1.2 gRPC 系统

理念：
定义一个服务，指定其能够被远程调用的方法（包含参数和返回类型）。在服务端实现这个接口，并运行一个 gRPC 服务器来处理客户端调用。在客户端拥有一个存根能够像服务端一样的方法。

特性：
1. 基于HTTP/2 
HTTP/2 提供了连接多路复用、双向流、服务器推送、请求优先级、首部压缩等机制。可以节省带宽、降低TCP链接次数、节省CPU，帮助移动设备延长电池寿命等。gRPC 的协议设计上使用了HTTP2 现有的语义，请求和响应的数据使用HTTP Body 发送，其他的控制信息则用Header 表示。
2. IDL使用ProtoBuf 
gRPC使用ProtoBuf来定义服务，ProtoBuf是由Google开发的一种数据序列化协议（类似于XML、JSON、hessian）。ProtoBuf能够将数据进行序列化，并广泛应用在数据存储、通信协议等方面。压缩和传输效率高，语法简单，表达力强。
3. 多语言支持（C, C++, Python, PHP, Nodejs, C#, Objective-C、Golang、Java） 
gRPC支持多种语言，并能够基于语言自动生成客户端和服务端功能库。目前已提供了C版本grpc、Java版本grpc-java 和 Go版本grpc-go，其它语言的版本正在积极开发中，其中，grpc支持C、C++、Node.js、Python、Ruby、Objective-C、PHP和C#等语言，grpc-java已经支持Android开发。
远程过程调用系统（rpc）

TensorFlow Servering C/S通信约束
TensorFlow Serving以Server方式提供模型能力服务，作为服务的使用者（Client）可以通过gRPC和RESTfull API两种方式来获取模型能力。虽然TensorFlow对C/S的通信约束做了说明，但感觉介绍的并不是特别的清晰易用，需要自己根据使用示例，并结合文档进行梳理和总结。

#### 1.3.2 RDMA
RDMA是一个远程通讯技术，它通过Kernel bypass等方式降低数据传输中的延迟和CPU消耗。
在分布式训练中，由于多个Worker之间或者Worker和Paramater Server 之间需要大量传输模型变量。当GPU到达一定数量后，受制于网络带宽以及TCP协议的延迟，通讯往往会成为计算性能的瓶颈，而在分布式训练中使用RDMA技术能够非常明显地提高训练速度。


Tensorflow是谷歌开源的深度学习框架，它有丰富的平台支持和API，也可以非常轻松地构建分布式模型训练。
Tensorflow 在实现里支持RDMA作为其分布式场景的通讯协议，但是官方镜像默认没有支持RDMA。需要重新构建tensorflow，并开启RDMA相关的构建参数。 Tensorflow 对 RDMA的支持和实现协议


官方参考示例
在文档中提到了两个参考示例，一个用于gRPC通信约束测试，一个用于RESTfull API通信约束测试。

server = tf.train.Server(cluster, job_name="local", task_index=0, protocol='grpc+verbs') # default protocol is 'grpc'




1. gRPC示例
示例使用说明：https://www.tensorflow.org/serving/serving_basic

模型输出
minist_save_model.py
示例代码：https://github.com/tensorflow/serving/blob/master/tensorflow_serving/example/mnist_saved_model.py
客户端验证
mnist_client.py
示例代码：https://github.com/tensorflow/serving/blob/master/tensorflow_serving/example/mnist_client.py
2. RESTfull API示例
示例使用说明:https://www.tensorflow.org/serving/api_rest

模型输出
export_half_plus_two.py
示例代码：https://github.com/tensorflow/serving/blob/master/tensorflow_serving/servables/tensorflow/testdata/export_half_plus_two.py
客户端验证
Http请求，通过curl命令完成
示例代码分析
虽然官网提供了两个示例，但实际上RESTfull API的示例过于简单，并且做了封装，实际的参考价值不大。下面主要结合gRPC的示例代码进行分析。

客户端同服务端进行通信交互的核心是几个标识，我们分别介绍下。

有了 gRPC， 我们可以一次性的在一个 .proto 文件中定义服务并使用任何支持它的语言去实现客户端和服务器，反过来，它们可以在各种环境中，

## 2. Tensorflow 安装

### 2.1 安装准备
#### 2.1.1 python 安装
python的版本由很多，但tensorflow是的操作可以简单认为由python驱动调用底层c++进行计算，对jit版本的python对Tensorflow程序的运行没有明显的影响。Anaconda版本的python 和原生的Cpython 都对Tensorflow 由很好的支持。（主要python版本）

1， Anaconda 安装
https://repo.continuum.io/archive/

### 2.2 pip 安装
1. 从pip官方源下载 安装
```shell
pip install tensorflow
pip install tensorflow==2.0.0-alpha0
pip install tf-nightly
``` 
2. 国内pip源加速
在境内地区的国际站点的网络连接速度通常较慢，pip  可通过国内镜像加速

清华：https://pypi.tuna.tsinghua.edu.cn/simple
阿里云：http://mirrors.aliyun.com/pypi/simple/
中国科技大学 https://pypi.mirrors.ustc.edu.cn/simple/
华中理工大学：http://pypi.hustunique.com/
山东理工大学：http://pypi.sdutlinux.org/ 
豆瓣：http://pypi.douban.com/simple/


```shell
# 一次性使用，在pip 后添加 -i <pip 源地址>:
# pip install <package-name> -i <url_address> 
pip install tensorflow -i https://pypi.tuna.tsinghua.edu.cn/simple
# or
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

3. 本地whl包 安装
```
pip install xxx.whl
```
在windows 环境下推荐 使用编译好的二进制文件进行安装
参考 https://github.com/fo40225/tensorflow-windows-wheel


### 2.3 docker 安装 
参考：https://tensorflow.google.cn/install/docker

#### 2.3.1CPU版本

```shell
docker pull tensorflow/tensorflow:latest-devel-gpu-py3 
```

#### 2.3.2 GPU版本
Docker 是在 GPU 上运行 TensorFlow 的最简单方法，因为主机只需安装 NVIDIA® 驱动程序（无需安装 NVIDIA® CUDA® 工具包）。

检测nvidia GPU是否可用 
```shell
lspci | grep -i nvidia
```
若显卡驱动可用 

```shell
docker run --runtime=nvidia -it -p 8888:8888 -p 6001:6001 -v /home/notebooks:/notebooks --rm tensorflow/tensorflow:latest-gpu-py3
```
### 2.4  kubernetes 安装
