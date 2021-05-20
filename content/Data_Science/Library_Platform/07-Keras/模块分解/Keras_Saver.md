---
title: "Keras模型的保存与加载"
layout: page
date: 2099-06-02 00:00
---

[TOC]

## 1. 模型需要保存什么
1. 模型结构
2. 模型参数
3. 优化器参数

### 1.1. 模型结构

1. 保存json文件
```python
# serialize model to JSON
model_json = model.to_json()
with open("model.json", "w") as json_file:
    json_file.write(model_json)
```
2. Yaml文件
```python
# save as YAML
yaml_string = model.to_yaml()
```
### 1.2. 模型参数

1. HDF5文件
```python
# serialize weights to HDF5
model.save_weights("model.h5")
```


### 1.3. 优化器参数

## 2. 模型以什么格式保存




### 2.1. HDF5 格式是什么


层级数据格式（Hierarchical Data Format：HDF）是设计用来**存储**和**组织**大量数据的一组**文件格式**。

它最初开发于美国国家超级计算应用中心，现在由非营利社团HDF Group支持[^HDF5]

当前版本是HDF5。



HDF5只包含两种主要的对象类型：

1. 数据集(Dataset)，它是同质类型的多维数组；
2. 群组(Group)，它是持有数据集和其他群组的容器结构。

由于它使用了B树来索引表格对象，HDF5有效工作于时间序列数据，比如股价序列，网络监控数据，和3D气象数据。大批量的数据直接进入数组（表格对象），它可以比SQL数据库的行存储更快访问，而非数组数据可获得B树访问。HDF5数据存储机制比SQL星模式（star schema）更简单和快速。

对HDF5的批评来源于它的单体设计和冗长规定。

HDF5不强制使用UTF-8，所以客户应用可以在多数位置上预期ASCII码。
在文件中的数据集数据不能释放，除非使用外部工具（h5repack）生成文件复本[6]。


weights的tensor保存在Dataset的value中，而每一集都会有attrs保存各网络层的属性：






## 3. 便捷保存

```python
file_path=r"./model.h5"
# case1 
model.save(file_path) #
# case2 
model.save_model(file_path) 
```


## 1.4. 模型加载




### 1.4.1. 载入模型结构与权重

```python
from keras.models import load_model

# 载入模型
model = load_model('model.h5')
```

### 1.4.2. 加载权重

单独加载权重需要先构建网络


```python
from network.resnet50 import ResNet50
#修改过，不加载权重（默认官方加载亦可）
model = ResNet50() 

# 参数默认 by_name = Fasle， 否则只读取匹配的权重
# 这里h5的层和权重文件中层名是对应的（除input层）
model.load_weights(r'\models\resnet50_weights_tf_dim_ordering_tf_kernels_v2.h5')
```

# 2. 数据IO

# 3. 参考资料

[^HDF5]:[Wiki百科:HDF](https://zh.wikipedia.org/wiki/HDF)