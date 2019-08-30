---
title: "[部署]tensorflow_service--模式部署"
date: 2019-06-17 00:00
---
[TOC]
# tensorflow service
## 1. 安装 
推荐 docker 安装 
```shell
docker pull tensorflow/serving:latest-devel
```

## 2. 运行服务
1. 进入docker 命令行
```shell 
docker run -it -p 8500:8500 --name grpc_name tensorflow/serving:latest-devel

# 8500端口：grpc的端口
# 8501端口：restful api的端口
# 上述命令直接进入docker 的命令行
#[docker]

>>> ls 
```
2. 将模型部署到docker中

将位于 `~/model`的文件复制到 名为 `grpc_name` docker 中的 `/online_model` 文件夹中 

```shell
docker cp ~/model grpc:/online_model
```
其中 `~/model` 中的文件 形如:
```shell
~/model
|__assets/
|__assets.extra/
|__variables/
    |__variables.data-?????-of-?????
    |__variables.index
|__saved_model.pb
```
主要由以下及部分组成：

1. SavedModel protocol buffe
   1. `saved_model.pb` or `saved_model.pbtxt`
   2. 包括以 MetaGraphDef protocol buffers格式的图的定义。
   
2. Assets 资源
   1. 一个名为 `assets` 的子文件夹
   2. 包含 词汇表vocabularies 等辅助文件
3. 额外资源 Extra assets
   1. 一个名为`Extra assets` 子文件夹
   2. 包括用户需要的自己的包或高级别的库，这些需求并没有在图中加载
   3. This subfolder is not managed by the SavedModel libraries.
4. 变量
   1. 一个名为`variables` 的文件夹
   2. 包含 从TensorFlow Saver 得到的输出 包括：
      1. variables.data-?????-of-?????
      2. variables.index


5. 在服务端开启服务 
   
```docker
# on [Docker]
tensorflow_model_server --port=8500 --model_name=builder --model_base_path=/online_model/builder/
```


## 3. `~/model` 中的文件如何生成


`~/model` 中的文件主要有：
1. 模型DAG图
2. 变量 

### 1. 模型DAG图的保存 

将模型打包后的文件以pb为后缀名，在TensorFlow 中 打包 pb 文件的方法一般有3种。
第一种方法是使用 TensorFlow 官网为我们提供的用于部署模型的类--SavedModeBuilder；
第二种方法是使用谷歌的 Bazel 工具进行模型打包；
第三种方法 是使用 TensorFlow 的 tf.gfile.GFile（）函数打包。
#### 1. SavedModelBuilder
```python
export_dir = ...
...
# 模型构建实例 builder
builder = tf.saved_model.builder.SavedModelBuilder(export_dir)
with tf.Session(graph=tf.Graph()) as sess:
  ...
  builder.add_meta_graph_and_variables(sess,
                                       [tf.saved_model.tag_constants.TRAINING],
                                       signature_def_map=foo_signatures,
                                       assets_collection=foo_assets)
...
with tf.Session(graph=tf.Graph()) as sess:
  ...
  builder.add_meta_graph(["bar-tag", "baz-tag"])
...
builder.save()
```

模块说明：
1 . add_meta_graph_and_variables
```python
add_meta_graph_and_variables(
    sess,
    tags,# tags:list; tags=["tag_string","..",...]
    signature_def_map=None, # signature_def_map:dict{"string_name":(signature_def)} :{string:tuple}
    assets_collection=None,
    legacy_init_op=None,
    clear_devices=False,
    main_op=None,
    strip_default_attrs=False, # 通过 strip_default_attrs=True 确保向前兼容性
    saver=None
)

```
2. signature_def_map
`signature_def_map` 定义签名的字典，签名是一组与图有关的输入和输出。

```python
signature_def_map={"name":(SignatureDef)}
```

  
`SignatureDef` 是一个协议缓冲区，用于定义图所支持的计算的签名。常用的输入键、输出键和方法名称定义如下[^1]
https://github.com/tensorflow/serving/blob/master/tensorflow_serving/g3doc/signature_defs.md


```python
signature_def=tf.saved_model.signature_def_utils.build_signature_def(
          inputs={
              tf.saved_model.signature_constants.CLASSIFY_INPUTS:
                  classification_inputs
          },
          outputs={
              tf.saved_model.signature_constants.CLASSIFY_OUTPUT_CLASSES:
                  classification_outputs_classes,
              tf.saved_model.signature_constants.CLASSIFY_OUTPUT_SCORES:
                  classification_outputs_scores
          },
          method_name=tf.saved_model.signature_constants.CLASSIFY_METHOD_NAME)
classification_signature=(signature_def)

  # Build the signature_def_map.
  # 构建 签名 signature_def_map
  classification_inputs = tf.saved_model.utils.build_tensor_info(
      serialized_tf_example)
  classification_outputs_classes = tf.saved_model.utils.build_tensor_info(
      prediction_classes)
  classification_outputs_scores = tf.saved_model.utils.build_tensor_info(values)

  classification_signature = (
      tf.saved_model.signature_def_utils.build_signature_def(
          inputs={
              tf.saved_model.signature_constants.CLASSIFY_INPUTS:
                  classification_inputs
          },
          outputs={
              tf.saved_model.signature_constants.CLASSIFY_OUTPUT_CLASSES:
                  classification_outputs_classes,
              tf.saved_model.signature_constants.CLASSIFY_OUTPUT_SCORES:
                  classification_outputs_scores
          },
          method_name=tf.saved_model.signature_constants.CLASSIFY_METHOD_NAME))

  tensor_info_x = tf.saved_model.utils.build_tensor_info(x)
  tensor_info_y = tf.saved_model.utils.build_tensor_info(y)
  prediction_signature = (
      tf.saved_model.signature_def_utils.build_signature_def(
          inputs={'images': tensor_info_x},
          outputs={'scores': tensor_info_y},
          method_name=tf.saved_model.signature_constants.PREDICT_METHOD_NAME))

  legacy_init_op = tf.group(tf.tables_initializer(), name='legacy_init_op')
  
  builder.add_meta_graph_and_variables(
      sess, [tf.saved_model.tag_constants.SERVING],
      signature_def_map={
          'predict_images':
              prediction_signature,
          tf.saved_model.signature_constants.DEFAULT_SERVING_SIGNATURE_DEF_KEY:
              classification_signature,
      },
  legacy_init_op=legacy_init_op)

  builder.save()

tf.saved_model.signature_def_utils.build_signature_def()

```


值得注意的是在导出模型的时候， 必须将保存导出模型的目录`export_dir`设置为空目录， 否则会出现一个该目录巳存在的错误 ， 所以，在设置 `export_dir` 值的时候，务必要保证里面没离任何数据。

模型被保存后，会在保存模型的目录中生成一个saved_rnodel.pb文件和一个 variables 文件夹。 其中 saved_model.pb 文件就是我仍保存下来的模型文件，也是之后我们要发布时所使用的文件； variables 文件夹里存放的就是与模型相关的一系列参数。 
这两部分会被存到一 个自定义的模型目录下当发布模型时需要对整个文件夹进行操作。


MetaGraph 是一种数据流图，并包含相关变量、资源和签名。MetaGraphDef 是 MetaGraph 的协议缓冲区表示法。
```python
export_dir = ...
...
with tf.Session(graph=tf.Graph()) as sess:
  tf.saved_model.loader.load(sess, [tag_constants.TRAINING], export_dir)
  ...
```

### 2. Bazel


要使用 TensorFlow Serving 部署模型 ， 则需要一个必备工具一－Bazel 。 Bazel 是 一个类似于 Maven 相 Google 的开源构建和测试工具，
支持多种语言的项目并且可 以为多个平台构建和输出可以直接从 Bazel的官方网站上下载最新版本，并使用如下命令进行安装。

```shell 
bazel build - c opt //tensorflow serving / example: mnist_saved_model
bazel-bin / tensorflow_serving / example / mnist_saved_model/tmp/mnist_model 
```

第一行的意思是将我们的训练源码进行构建，也就是训练模型的过程；
第二行的意思则是将训练好的 TensorFlow 打包成一个模型文 件 3 打包后同样生成 saved_model.pb 文件和 variables 艾件夹。
虽然使用 Bazel 打包是谷歌官方推荐的 ， 但是在实际生产过程中并不常用 
### 3. tf.gfile.GFile()

tf.gfile 是tensorflow 的文件操作库 

```python
import tensorflow as tf
from tensorflow.python . framework import graph_util 

from tensorflow .python .platform import gfile 

if name =="main":
    a=tf.Variable(tf. constant(S. , shape=(l ]) , name=”a " )
    b=tf.Variable (tf. constant(6., shape= (l]), n缸ne＝”b ") 
    c = a + b 
    init = tf.initialze_allvariables() 
    sess=tf.Session()
    sess.run(init)
    #导出当前计算图的 GraphDef 部分
    graph_def = tf. get_default_graph().as_graph_def()

    #保干字指定的节点，并将节点（直保存为常数 
    output_graph_def=graph_util.convert_variables_to_constants (sess, graph_def, ["add"]） 
    #将计算圄写入至文件中 
    with tf.gfile.GFile ("models.pb","wb") as f : 
      f.write (output_graph_def. SerializeToString () )

````
上面一段代码就是使用 tf.gfile.GFile（）函数打包 ， 将图的信息进行保存然后写入 pb 文件中 。

### 2. 变量

通过 TensorFlow Saver 得到的输出 

1[^1]
## 参考

[^1]:https://github.com/tensorflow/tensorflow/blob/master/tensorflow/python/saved_model/README.md