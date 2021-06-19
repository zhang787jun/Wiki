---
title: "Tensorflow数据可视化工具--TensorFlow Data Validation"
date: 2019-06-12 00:00
render: True 
tag: Tensorflow,框架,AI,
---

[TOC]

# 1. 安装

安装时一定要注意各相关组件的版本

| tensorflow-data-validation                                                            | tensorflow        | apache-beam[gcp] | pyarrow |
| ------------------------------------------------------------------------------------- | ----------------- | ---------------- | ------- |
| [GitHub master](https://github.com/tensorflow/data-validation/blob/master/RELEASE.md) | nightly (1.x/2.x) | 2.17.0           | 0.15.0  |
| [0.21.5](https://github.com/tensorflow/data-validation/blob/v0.21.5/RELEASE.md)       | 1.15 / 2.1        | 2.17.0           | 0.15.0  |
| [0.21.4](https://github.com/tensorflow/data-validation/blob/v0.21.4/RELEASE.md)       | 1.15 / 2.1        | 2.17.0           | 0.15.0  |
| [0.21.2](https://github.com/tensorflow/data-validation/blob/v0.21.2/RELEASE.md)       | 1.15 / 2.1        | 2.17.0           | 0.15.0  |
| [0.21.1](https://github.com/tensorflow/data-validation/blob/v0.21.1/RELEASE.md)       | 1.15 / 2.1        | 2.17.0           | 0.15.0  |
| [0.21.0](https://github.com/tensorflow/data-validation/blob/v0.21.0/RELEASE.md)       | 1.15 / 2.1        | 2.17.0           | 0.15.0  |
| [0.15.0](https://github.com/tensorflow/data-validation/blob/v0.15.0/RELEASE.md)       | 1.15 / 2.0        | 2.16.0           | 0.14.0  |
| [0.14.1](https://github.com/tensorflow/data-validation/blob/v0.14.1/RELEASE.md)       | 1.14              | 2.14.0           | 0.14.0  |
| [0.14.0](https://github.com/tensorflow/data-validation/blob/v0.14.0/RELEASE.md)       | 1.14              | 2.14.0           | 0.14.0  |
| [0.13.1](https://github.com/tensorflow/data-validation/blob/v0.13.1/RELEASE.md)       | 1.13              | 2.11.0           | n/a     |
| [0.13.0](https://github.com/tensorflow/data-validation/blob/v0.13.0/RELEASE.md)       | 1.13              | 2.11.0           | n/a     |
| [0.12.0](https://github.com/tensorflow/data-validation/blob/v0.12.0/RELEASE.md)       | 1.12              | 2.10.0           | n/a     |
| [0.11.0](https://github.com/tensorflow/data-validation/blob/v0.11.0/RELEASE.md)       | 1.11              | 2.8.0            | n/a     |
| [0.9.0](https://github.com/tensorflow/data-validation/blob/v0.9.0/RELEASE.md)         | 1.9               | 2.6.0            | n/a     |



## 1.1. pip
```shell
pip install tensorflow-data-validation
```

```shell
pip install apache-beam==2.14.0
pip install tensorflow==1.14.0
pip install tensorflow-data-validation==0.14.0
```


## 1.2. docker

```shell
# win10 
docker run --rm -d -p 8888:8888/tcp  -v <full-file-path>:/notebooks registry.cn-zhangjiakou.aliyuncs.com/zjlbzf_docker/tfdv:latest

# Linux
docker run --rm -d -p 8888:8888/tcp  -v .:/notebooks registry.cn-zhangjiakou.aliyuncs.com/zjlbzf_docker/tfdv:latest
```
# 2. 基本使用


1. 生成统计数据 
```python
import tensorflow_data_validation as tfdv

# 1. 从tfrecord 获得 
stats = tfdv.generate_statistics_from_tfrecord(data_location=path)

# 2. 从dataframe 获得
## 默认n_jobs =1 ,可以根据系统的cores of cpus 更改
stats = tfdv.generate_statistics_from_dataframe(df,n_jobs)

# 3. 从csv获得
stats = tfdv.generate_statistics_from_csv(data_location=path)


# 最佳实践 
stats = tfdv.generate_statistics_from_dataframe(df,n_jobs=-1)

```


2. 统计数据的可视化 

```python
tfdv.visualize_statistics(stats1,stats2,"stats1_name","stats2_name")
>>>
#可视化面板

```
3. 生成数据模式 
数据模式内容包括：
    1. 数据类型
    2. 每个样本的特征数量
```yml
feature {
  name: "payment_type"
  value_count {
    min: 1
    max: 1
  }
  type: BYTES
  domain: "payment_type"
  presence {
    min_fraction: 1.0
    min_count: 1
  }
}
```


```python
schema = tfdv.infer_schema(statistics=train_stats)
tfdv.display_schema(schema=schema)
>>>
# 数据模式表格

```

# 3. 一些小问题

## 3.1. 国内使用无法显示可视化界面


可视化面板的js脚本中 指向了 
https://raw.githubusercontent.com/PAIR-code/facets/master/facets-dist/facets-jupyter.html

该地址国内访问不稳定，可能导致可视化界面无法显示。
将该html文件下载到本地或放到其他服务器上，代码中重新指引就可以解决。
需要在 tensorflow_data_validation 的源码中（2个地方）进行一些修改 


```python 
# tensorflow_data_validation/utils/display_util.py
# tensorflow_data_validation/utils/display_util_test.py.py
<link rel="import" href="https://raw.githubusercontent.com/PAIR-code/facets/master/facets-dist/facets-jupyter.html">;


# 修改为 
>>>

<link rel="import" href="https://zhang787jun.github.io/Wiki/attach/tensorflow_data_validation/facets-jupyter.html">;


https://zhang787jun.github.io/Wiki/attach/tensorflow_data_validation/facets-jupyter.html 可替换成任意可访问的的facets-jupyter.html 地址
```




# 4. 参考资料
1. https://tensorflow.google.cn/tfx/guide/tfdv#drift_detection_tfdv_drift_detection

2. https://github.com/tensorflow/data-validation
 