---
title: "[测试]Tensorflow Profiler 性能优化"
date: 2019-06-17 00:00
---
[TOC]

# 1. 工具


## Tensorflow Profiler UI
??[^1]
### 1. 安装 Installation
1. 下载文件 profiler-ui 的源文件
```shell
git clone https://github.com/tensorflow/profiler-ui.git
```

1.Install Python dependencies. 
```
pip install --user -r requirements.txt
```

2.Install pprof.

[1] 下载 安装go语言包 

安装包下载地址为：https://golang.org/dl/。
如果打不开可以使用这个地址：https://golang.google.cn/dl/

参考：https://www.runoob.com/go/go-environment.html


装 pprof 的时候会有个坑点，CentOS 库中可以找到 gperftools 这个工具，也是 Google 提供的，yum 装上之后可执行文件的名字也叫 pprof ！！但是跟这里用到的 pprof 不是一个玩意！！

[2] 安装pprof
```go 
go get -u github.com/google/pprof
```
### 2. 准备profiler 文件 
3.Create a profile context file using the tf.contrib.tfprof.ProfileContext class. 

生成持久化文件 `/path/to/your/profile.context`

### 3. 启动 UI 
进入到  profiler-ui 的文件夹下 
```python
python ui.py --profile_context_path=/path/to/your/profile.context
```

# 2.策略  
[^2]
## 硬件 


## JIT 编译 
使用即时编译
注意: 为了支持 XLA（加速线性代数），TensorFlow 必须从源文件编译。

为什么使用即时编译？
TensorFlow / XLA 即时编译器通过 XLA 编译和运行 TensorFlow 图的各个部分。与标准的 TensorFlow 实现相比，XLA 的好处是可以将多个运算符（内核融合）融合到少量的编译内核中。与 TensorFlow 逐个运行操作相比，融合运算能减少对**内存带宽**的要求，同时提升性能。

通过 XLA 运行 TensorFlow 图
有两种方式通过 XLA 运行 TensorFlow 计算图：一是用 CPU 或 GPU 设备上的即时编译操作，二是把操作放到 XLA_CPU 或 XLA_GPU TensorFlow 设备上。将操作直接放到一个 TensorFlow XLA
设备上强制执行，因此这种方法主要用于测试。

注意：XLA CPU 后端会生成快速、单线程的代码，但是不会如 TensorFlow CPU 后端一样并行化。 XLA GPU 后端与标准的 TensorFlow 后端充分竞争，运行速度时快时慢。

开启即时编译
即时编译可以在会话层开启，或手动进行选择操作。两种方式都是零拷贝 --- 数据在同台设备的已编译 XLA 内核和 TensorFlow 操作之间传递时，无需另行复制。

会话
在会话层开启即时编译时，系统将尽可能把所有操作编译成 XLA 计算。每个 XLA 计算将被编译成单个或多个设备底层内核。

受某些限制影响，如果图模型中有两个相邻的操作都要使用 XLA，它们将会被编译成单个 XLA 计算。

通过将 global_jit_level 设置成tf.OptimizerOptions.ON_1，并在会话初始化阶段传入配置，就可以在会话层开启即时编译。

# 配置开启即时编译
config = tf.ConfigProto()
config.graph_options.optimizer_options.global_jit_level = tf.OptimizerOptions.ON_1

sess = tf.Session(config=config)
注意：在会话层开启即时编译将不会导致为 CPU 编译操作。CPU 运算的即时编译必须通过下面描述的手动方法开启，原因在于 CPU 后端是单线程的。

手动开启
对于单个或多个操作，可以手动开启即时编译，通过对运算进行标记以使用属性 _XlaCompile=true 来进行编译。最简单的方法就是通过在 tensorflow/contrib/compiler/jit.py
中定义的 tf.contrib.compiler.jit.experimental_jit_scope() 。
使用范例：

    jit_scope = tf.contrib.compiler.jit.experimental_jit_scope

    x = tf.placeholder(np.float32)
    with jit_scope():
      y = tf.add(x, x)  # add 将被 XLA 编译
_XlaCompile 属性目前是以最佳的方式支持的。如果一个操作无法编译，TensorFlow 将默认回退到常规实现。

将操作加载到 XLA 设备中
通过 XLA 执行计算的另一种方法是将操作载入到特定的 XLA 设备上。这个方法通常只用于测试。有效设备包括 XLA_CPU 或 XLA_GPU。

with tf.device("/job:localhost/replica:0/task:0/device:XLA_GPU:0"):
  output = tf.add(input1, input2)
不同于标准 CPU 和 GPU 设备上的即时编译，这些设备在传输到设备上和关闭设备时，会生成一个数据副本。额外的拷贝导致在同一个图模型中混合使用 XLA 和 TensorFlow 操作的开销变得很大。

教程
这个教程涵盖了一个简单版的 MNIST softmax 训练模型。在会话层开启了即时编译，只支持 GPU。

在开始本教程之前，先验证 LD_LIBRARY 环境变量或者 ldconfig 包含 $CUDA_ROOT/extras/CUPTI/lib64，其中包含 CUDA 分析工具接口库
(CUPTI)。TensorFlow 使用 CUPTI 从 GPU 获取追踪信息。

步骤 #1: 准备代码范例
下载或移动 mnist_softmax_xla.py 到 TensorFlow 源码之外的文件夹中。

步骤 #2: 无 XLA 运行
执行 python 代码，不用 XLA 训练模型。

python mnist_softmax_xla.py --xla=''
使用 Chrome 跟踪事件探查器 (导航到 chrome://tracing)，当代码执行完时打开时间线文件 timeline.ctf.json。呈现的时间线类似于下图，其中有多个绿色框，标记为 MatMul，可能跨多个 GPU 。


步骤 #3：用 XLA 运行代码
执行 python 代码，用 XLA 训练模型，并打开 XLA 调试工具，用环境变量输出 XLA 图。

TF_XLA_FLAGS=--xla_generate_hlo_graph=.* python mnist_softmax_xla.py
打开时间线文件(timeline.ctf.json)。呈现的时间线类似于下图，其中有一个标有 _XlaLaunch
的长块。


通过查看控制台类似下面的输出来了解在 _XlaLaunch 里到底发生了什么:

computation cluster_0[_XlaCompiledKernel=true,_XlaNumConstantArgs=1].v82 [CPU:
pipeline start, before inline]: /tmp/hlo_graph_0.dot
控制台显示了包含 XLA 创建的图模型信息的 hlo_graph_xx.dot 文件位置。XLA 融合操作的过程可以从 hlo_graph_0.dot 开始逐个查看分析图了解。

为了将 .dot 文件渲染成 png 格式，需安装 GraphViz 并运行:

dot -Tpng hlo_graph_80.dot -o hlo_graph_80.png
结果如下图：




# 参考资料

[^1]: profiler-ui Github pages https://github.com/tensorflow/profiler-ui

[^2]:美团基于TensorFlow Serving的深度学习在线预估 https://tech.meituan.com/2018/10/11/tfserving-improve.html

[^3]:Performance Analysis of Just-in-Time Compilation
for Training TensorFlow Multi-Layer Perceptrons

