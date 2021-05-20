---
title: "Tensorflow Profiler 程序性能测试与优化"
date: 2019-06-17 00:00
tag: Tensorflow,框架,AI,程序性能,Profiler
---
[TOC]


# 背景
和其他程序算法一样，基于tensorflow框架的运行的程序同样需要注重算法效率。
程序的运行优化大致从 `算法` 和 `可调度资源` 两方面考虑 

考察算法效率大致从以下几个方面考虑：
1. 时间消耗
2. 内存空间消耗
3. 时间/空间复杂度

考察可调度资源匹配从以下几个方面考虑：
1. 硬件计算能力
2. 调度资源效率
3. 资源瓶颈分析等

同时结合自由的硬件资源，进行协同调度


# 1. 使用tf.profile评估性能


参考：
1. TensorFlow Profiler and Advisor： https://github.com/tensorflow/tensorflow/tree/r1.3/tensorflow/core/profiler
2. TensorFlow Profiler UI：https://github.com/tensorflow/profiler-ui


### 1.1. tf.profile的使用步骤
程序性能评估的过程分为4步：
1. 创建评估器 tf.profiler.Profiler 实例 
2. 创建protobuf格式的数据结构对象


1. 创建评估器 tf.profiler.Profiler 实例 
```python
profiler = tf.profiler.Profiler(graph=sess.graph,op_log=None)
# profiler 实例
# op_log: optional. tensorflow::tfprof::OpLogProto proto. Used to define extra op types.
```

2. 创建protobuf格式的数据结构对象

```python
#2.1. 保存运行数据的run_metadata数据结构对象，以记录运行时候的每个OP 的运行时间和内存占用数据
run_metadata = tf.RunMetadata()
type(run_metadata)
>>>tensorflow.core.protobuf.config_pb2.RunMetadata

#2.2. 保存评估器运行参数的run_options数据结构对象 
run_options = tf.RunOptions(trace_level = tf.RunOptions.FULL_TRACE)
type(run_options)
>>>tensorflow.core.protobuf.config_pb2.RunOptions

```
RunOptions 设置评估器的运行参数选项，包括:全记录，记录硬件信息，记录软件信息，不记录。

```python
tf.RunOptions 类
类成员
tf.RunOptions.FULL_TRACE
tf.RunOptions.HARDWARE_TRACE
tf.RunOptions.NO_TRACE
tf.RunOptions.SOFTWARE_TRACE
tf.RunOptions.TraceLevel
```
3. 将上述二者结合并评估模型耗时、内存占用、参数数量等情况；
```python
op=···
for step in range (total_steps):
        sess.run(op, options=run_options, run_metadata=run_metadata) #@1
        profiler.add_step(step=step, run_meta=run_metadata) #@2
profiler.profile_graph(options=profile_graph_opts_builder.build()) #@3


profiler 分为数据搜集和数据显示两个主要步骤。

graph node计算图中的节点每一次执行，记录单步统计数据，主要是执行时间和占用内存，格式参见step_stats.proto，作为原始的最小粒度统计数据源；
#@1 每一次session.Run()，所有执行到的graph node的统计数据，都集中汇总保存到 RunMetadata 数据结构中
#@2 用户程序把每一次搜集到的 RunMetadata 添加到profiler实例，做数据累计和加工处理。
#@3 将profiler以某一视图按某一设定输出
```
4. profiler 持久后保存/可视化

```python
with open(current_dir_path+'/profile.pd', 'wb') as f:
    f.write(profiler.serialize_to_string())
```


### 1.2. 评估器实例

#### 1.2.1. 新建评估器实例
```python
Profiler=tf.profiler.Profiler(graph=None,op_log=None)

#graph：tf.Graph。如果为“None”或者未启用“eager执行”，请使用默认图形。
#op_log：可选的。tensorflow :: tfprof :: OpLogProto proto。用于定义额外的op类型。

profile=tf.profiler.profile(
    graph=None,
    run_meta=None,
    op_log=None,
    cmd='graph', # 'op'，'scope'，'graph','code'
    options={}
)
```
#### 1.2.2. 实例操作
```python
# 将run_meta和step 添加到Profiler
Profiler.add_step(step,run_meta) # 添加步骤的统计信息。
#step:int->0
#run_meta->run_metadata:

#将ProfileProto序列化为二进制字符串。
Profiler.serialize_to_string()  

# 将run_meta输出到log_dir中
tf.profiler.write_op_log(
    graph,
    log_dir,
    op_log=None,
    run_meta=None,
    add_trace=True
)
```
#### 1.2.3. 评估运行并得到结果
```python
Advise=Profiler.advise(options={}) # 自动检测问题并生成报告,返回一个包含所有检查者的报告的Advise原型。

GraphNodeProto=Profiler.profile_graph(options={}) #通过数据流图组织图形节点的统计信息。
GraphNodeProto=Profiler.profile_name_scope(options={})#按名称范围组织图形节点的统计信息。
MultiGraphNodeProto=Profiler.profile_operations(options={})#描述操作类型的统计信息（例如：MatMul，Conv2D）。
MultiGraphNodeProto=Profiler.Profiler.profile_python(options={})  #描述Python代码的统计信息。

type(options)
>>>dict 
```
```python
# ----------profile
profile=tf.profiler.profile(
    graph=None,
    run_meta=None,
    op_log=None,
    cmd='graph', # 'op'，'scope'，'graph','code'
    options={}
)
type(profile)
>>> tensorflow.core.profiler.tfprof_output_pb2.GraphNodeProto
# 上述等同于--|
Profiler=tf.profiler.Profiler(graph=None,op_log=None)
Profiler.add_step(step,run_meta)
Profiler.profile_graph(options={})

#---------advise
advise=tf.profiler.advise(
    graph=None,
    run_meta=None,
    options=_DEFAULT_ADVISE_OPTIONS
)
type(advise)
>>> tensorflow.core.profiler.tfprof_output_pb2.AdviceProto
# 上述等同于--|
Profiler=tf.profiler.Profiler(graph=None,op_log=None)
Profiler.add_step(step,run_meta)
Profiler.advise(options={})
```

### 1.3. protobuf格式的数据结构对象
我们注意到Profiler 运行是输出ProtocolMessage格式统计数据，tf.profile中定义了4种 数结构
```python
class AdviceProto：ProtocolMessage

class GraphNodeProto：ProtocolMessage

class MultiGraphNodeProto：ProtocolMessage

class OpLogProto：ProtocolMessage
```
### 1.4. 评估器的选项设置
评估器的选项设置options通过字典完成，

`tf.profiler.profile`中的`options`可选项为：
```shell
-max_depth 4       命名空间的深度阈值，超过该阈值的分支不予展示
-min_bytes 0       展示占用内存超过该阈值的OP
-min_micros 10       展示耗时超过该阈值的OP
-min_params  0       展示超过该阈值的参数大小的OP
-min_float_ops 0       展示超过该阈值的浮点计算量的 OP
-min_occurrence  0        展示超过该阈值的出现次数的 OP
-step -1       展示训练时候哪一步的统计情况，默认为最后一步
-order_by micros       统计结果排序字段设定
-account_type_regexes _trainable_variables 
Selectively counting statistics based on node types ，比如这里设定展示可训练变量；account_type_regexes=['.*gpu:0.*'] 设定展示 GPU 运行的变量；
-start_name_regexes .* 
      以下四个选项可以更加灵活的设置展示哪些 OP 
-trim_name_regexes 
-show_name_regexes siamese.*
-hide_name_regexes 
-account_displayed_op_only false
-select micros  选择展示的属性,这里选择查看计算耗时，
-output stdout: 输出方式，这里是标准输出
```
参考：https://github.com/tensorflow/tensorflow/blob/master/tensorflow/core/profiler/g3doc/options.md

同时选项字典可以通过tf.profile.ProfileOptionBuilder构建字典 

```python
class ProfileOptionBuilder：
# 用于Profiling API的Option Builder。
# 返回字典
```
评估器选项构建器 ProfileOptionBuilder
1. 记录内容选项
2. 输出内容格式选项
3. 限制节点选项
#### 1.4.1. 记录内容选项

##### 1.4.1.1. 记录时间和内存消耗
```python
ProfileOptionBuilder=tf.profiler.ProfileOptionBuilder(options={})

# 时间和内存消耗
ProfileOptionBuilder.time_and_memory(
    min_micros=1,
    min_bytes=1,
    min_accelerator_micros=0,
    min_cpu_micros=0,
    min_peak_bytes=0,
    min_residual_bytes=0,
    min_output_bytes=0
)

```
##### 1.4.1.2. 记录浮点运算情况
```python
ProfileOptionBuilder.float_operation()
```

#### 1.4.2. 输出选项
输出文件格式
1. time line : 输出JSON events file, 再用chrome浏览器tracing功能进行查看，可视性很棒。
2. stdout ： 标准输出设备打印。
3. pprof file: 输出pprof的文件格式，再用pprof工具查看。
4. file: 输出到普通的文本文件。

```python
ProfileOptionBuilder.with_pprof_output(pprof_file="./xxx.pb.gz.") # 生成一个pprof profile gzip file.
ProfileOptionBuilder.with_stdout_output() # c++ std out Print the result to stdout.
ProfileOptionBuilder.with_timeline_output(timeline_file="./xxx.json") #生成一个json 文件
ProfileOptionBuilder.with_file_output(outfile="") #输出一个文件
ProfileOptionBuilder.with_empty_output()#不输出

#定义显示sess.Run() 第70步的统计数据,如果为-1，则使用所#有可用步骤的平均值。
ProfileOptionBuilder.with_step(70)
```

#### 1.4.3. 限定选项
##### 1.4.3.1. 选择制定profiler节点
```python
attributes=[]
ProfileOptionBuilder.select(attributes)
```

##### 1.4.3.2. 选择消耗时间大于阈值的profiler节点
```python
ProfileOptionBuilder.with_min_execution_time(
    min_micros=0,
    min_accelerator_micros=0,
    min_cpu_micros=0
)
```
只显示消耗不少于“min_micros”的profiler节点。
##### 1.4.3.3. 选择消耗空间大于阈值的profiler节点
```python
ProfileOptionBuilder.with_min_memory(
    min_bytes=0,
    min_peak_bytes=0,
    min_residual_bytes=0,
    min_output_bytes=0
)
```

##### 1.4.3.4. 选择运算大于阈值的profiler节点
```python
ProfileOptionBuilder.with_min_float_operations(min_float_ops)
```

##### 1.4.3.5. 选择参数数量大于阈值的profiler节点
```python
ProfileOptionBuilder.with_min_parameters(min_params)
```
仅显示不超过`min_params`参数的profiler节点。

#### 1.4.4. 评估器选项构建器-构建
```python
#构建profiling选项
profile_opt_dict=ProfileOptionBuilder.build()
type(profile_opt_dict)
>>>dict 

```
#### 1.4.5. 输出视图

例子1：grpah view显示每个graph node运行时间，并输出到timeline
例子2：scope view显示模型中的参数数量分布 
例子4： code view – 显示python代码的执行资源消耗 


### 1.5. 常用实例
#### 1.5.1. 浮点运算次数 flop
```python
def get_flops(model):
    run_meta = tf.RunMetadata()
    opts = tf.profiler.ProfileOptionBuilder.float_operation()

    # We use the Keras session graph in the call to the profiler.
    flop = tf.profiler.profile(graph=K.get_session().graph,
                                    run_meta=run_meta, cmd='op', options=opts)

    return flop.total_float_ops  
    # Prints the "flop" of the model.
```
#### 1.5.2. 总参数量
```python
## 统计参数量
opts = tf.profiler.ProfileOptionBuilder.trainable_variables_parameter()
param_stats = profiler.profile_name_scope(options=opts)
# 总参数量
print('总参数：', param_stats.total_parameters)
# 各scope参数量
for x in param_stats.children:
  print(x.name, 'scope参数：', x.total_parameters)

```

#### 1.5.3. 统计模型内存和耗时情况
```python
builder = tf.profiler.ProfileOptionBuilder
opts = builder(builder.time_and_memory())
#opts.with_step(1)
opts.with_timeline_output('timeline.json')
opts = opts.build()

#profiler.profile_name_scope(opts) # 只能保存单step的timeline
profiler.profile_graph(opts) # 保存各个step的timeline
```
#### 1.5.4. 给出使用profile工具给出建议
```python
opts = {'AcceleratorUtilizationChecker': {},
        'ExpensiveOperationChecker': {},
        'JobChecker': {},
        'OperationChecker': {}}
profiler.advise(opts)
```


### 1.6. 基于profile的建议

不要每次　sess.run 里面都加入 runmetadata 对象，这样会使得整个模型每次都去收集时间耗费及内存占用数据，只需要隔N次收集一次就行了；

### 1.7. 在estimator中使用profile

```python
with tf.contrib.tfprof.ProfileContext('/tmp/train_dir', dump_steps=[10]) as pctx:
  estimator.train() # any thing you want to profile
```
在`/tmp/train_dir` 中就会得到`profile_10` 文件 

### 1.8. 在keras 中使用

```python
import tensorflow as tf
from tensorflow.python.client import timeline
from keras import backend as K

run_options = tf.RunOptions(trace_level=tf.RunOptions.FULL_TRACE)
run_metadata = tf.RunMetadata()

model = ...  # A Keras model

fn = K.function(model.inputs, model.outputs, options=run_options, run_metadata=run_metadata)

for i in range(4):
    x = K.variable(...)
    fn([x])
    tl = timeline.Timeline(run_metadata.step_stats)
    ctf = tl.generate_chrome_trace_format()
    with open('timeline_%d.json' % (i), 'w') as f:
        f.write(ctf)
```
Case 2

```python 
import tensorflow as tf
def stats_graph(graph):
    flops = tf.profiler.profile(graph, options=tf.profiler.ProfileOptionBuilder.float_operation())
    params = tf.profiler.profile(graph, options=tf.profiler.ProfileOptionBuilder.trainable_variables_parameter())
    print('FLOPs: {};    Trainable params: {}'.format(flops.total_float_ops, params.total_parameters))



from keras import backend as K
from keras.layers import Dense
from keras.models import Sequential
from keras.initializers import Constant
model = Sequential()
model.add(Dense(32, input_dim=4, bias_initializer=Constant(value=0), kernel_initializer=Constant(value=1)))
sess = K.get_session()
graph = sess.graph
stats_graph(graph)
```



# 2. 工具


## 2.1. Tensorflow Profiler UI
参考资料[^1]
### 2.1.1. 安装 Installation
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
### 2.1.2. 准备 profiler 文件
3.Create a profile context file using the tf.contrib.tfprof.ProfileContext class. 

生成持久化文件 `/path/to/your/profile.context`

### 2.1.3. 启动 UI
进入到  profiler-ui 的文件夹下 
```python
python ui.py --profile_context_path=/path/to/your/profile.context
```

# 3. 优化策略[^2]

## 3.1. 硬件

### 3.1.1. 单机
#### 3.1.1.1. CPU 加速

#### 3.1.1.2. GPU 加速

#### 3.1.1.3. TPU 加速

#### 3.1.1.4. I/O 开销


### 3.1.2. 集群


## 3.2. JIT 编译
使用即时编译
注意: 为了支持 XLA（加速线性代数），TensorFlow 必须从源文件编译。

### 为什么使用即时编译？
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


```python
#  配置开启即时编译
config = tf.ConfigProto()
config.graph_options.optimizer_options.global_jit_level = tf.OptimizerOptions.ON_1

sess = tf.Session(config=config)
```
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

```python
with tf.device("/job:localhost/replica:0/task:0/device:XLA_GPU:0"):
  output = tf.add(input1, input2)
```
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




# 5. 参考资料

[^1]: profiler-ui Github pages https://github.com/tensorflow/profiler-ui

[^2]:美团基于TensorFlow Serving的深度学习在线预估 https://tech.meituan.com/2018/10/11/tfserving-improve.html

[^3]:Performance Analysis of Just-in-Time Compilation
for Training TensorFlow Multi-Layer Perceptrons

