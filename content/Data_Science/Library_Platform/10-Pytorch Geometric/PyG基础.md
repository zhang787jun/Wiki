---
title: "Pytorch Geometric基础"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 基本组成 


```python
torch_geometric.data
torch_geometric.dataset
torch_geometric.transforms 
torch_geometric.utils 
torch_geometric.io 
```


# 2. 基本操作


## 2.1. 创建对象 

### 2.1.1. 创建图（数据）

A single graph in` PyTorch Geometric` is described by an instance of `torch_geometric.data.Data`


PyG 使用 `torch_geometric.data.Data`类来表示单个图


```python
import torch
from torch_geometric.data import Data

edge_index = torch.tensor([[0, 1, 1, 2],
                           [1, 0, 2, 1]], dtype=torch.long)
x = torch.tensor([[-1], [0], [1]], dtype=torch.float)

data = Data(x=x, edge_index=edge_index)

# data.x: 节点的特征矩阵 [N，n],N= len of nodes ,n len of node feature
# data.edge_index: 用COO格式储存的图数据, [2,M] ,M = len of edges
# data.edge_attr: 边特征矩阵, 形状[M，m],m =len of edge feature
# data.y: 要训练的目标，如节点级目标[N，*]，图级目标[1,*],此处*代表样本数量。
# data.pos: 节点位置矩阵，形状：[N,num_dimensions],在有些图中，节点是具有坐标属性，比如3D点云，每个节点都是3维空间中的一个坐标，类似的也可以是其它维度的。

```


```python

#上述代码中已经将Data对象赋给data
print(data.keys)
>>> ['x', 'edge_index']
#两种方式都可以，
print(data['x'])
print(data.x)
>>> tensor([[-1.0],
            [0.0],
            [1.0]])
#类似于字典的遍历方式
for key, item in data:
    print("{} found in data".format(key))
>>> x found in data
>>> edge_index found in data
#测试属性
'edge_attr' in data
>>> False
#以下几个属性是初始化图之后就自动生成的，不需要人为赋值
data.num_nodes
>>> 3
data.num_edges
>>> 4
data.num_node_features
>>> 1
#是否包含孤立节点
data.contains_isolated_nodes()
>>> False
#是否包含自连接节点，即自己到自己的边
data.contains_self_loops()
>>> False
#是否有向图
data.is_directed()
>>> False

# 和torch的张量数据切换完全一样，不再赘述
device = torch.device('cuda')
data = data.to(device)

```

### 2.1.2. 创建图（数据）集

>We provide two abstract classes for datasets: `torch_geometric.data.Dataset` and `torch_geometric.data.InMemoryDataset`. 

PyG 提供了 两种类 用于自定义是数据集
1. `torch_geometric.data.Dataset`  
2. `torch_geometric.data.InMemoryDataset`


```python
import os.path as osp

import torch
from torch_geometric.data import Dataset


class MyOwnDataset(Dataset):
    def __init__(self, root, transform=None, pre_transform=None):
        super(MyOwnDataset, self).__init__(root, transform, pre_transform)

    @property
    def raw_file_names(self):
        return ['some_file_1', 'some_file_2', ...]

    @property
    def processed_file_names(self):
        return ['data_1.pt', 'data_2.pt', ...]

    def download(self):
        # Download to `self.raw_dir`.

    def process(self):
        i = 0
        for raw_path in self.raw_paths:
            # Read data from `raw_path`.
            data = Data(...)

            if self.pre_filter is not None and not self.pre_filter(data):
                continue

            if self.pre_transform is not None:
                data = self.pre_transform(data)

            torch.save(data, osp.join(self.processed_dir, 'data_{}.pt'.format(i)))
            i += 1

    def len(self):
        return len(self.processed_file_names)

    def get(self, idx):
        data = torch.load(osp.join(self.processed_dir, 'data_{}.pt'.format(idx)))
        return data
```

Following the torchvision convention, each dataset gets passed a root folder which indicates where the dataset should be stored. We split up the root folder into two folders: the raw_dir, where the dataset gets downloaded to, and the processed_dir, where the processed dataset is being saved.

In addition, each dataset can be passed a transform, a pre_transform and a pre_filter function, which are None by default. The transform function dynamically transforms the data object before accessing (so it is best used for data augmentation). The pre_transform function applies the transformation before saving the data objects to disk (so it is best used for heavy precomputation which needs to be only done once). The pre_filter function can manually filter out data objects before saving. Use cases may involve the restriction of data objects being of a specific class.


## 2.2. 数据转换



转换（Transforms）是 torchvision 中转换图像和进行数据增强的常用方法。PyTorch Geometric 也包含自己的转换，它以Data对象作为输入并返回一个新的转换后的Data对象。可以使用

torch_geometric.transforms.Compose 
将转换链接在一起，并在将已处理的数据集保存到磁盘之前（pre_transform）或者访问数据集中的图之前应用变换操作。例如，用户可以通过转换操作从点云生成最邻近图从而将点云数据集转换为图数据集。

## 标记训练测试集

```python
data = Data(x=x, edge_index=edge_index)
data.train_idx = torch.tensor([…], dtype=torch.long)
data.test_mask = torch.tensor([…], dtype=torch.uint8)
```