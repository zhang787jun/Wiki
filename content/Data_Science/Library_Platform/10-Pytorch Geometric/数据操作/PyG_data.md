---
title: "PyG--数据操作"
layout: page
date: 2099-06-02 00:00
---
[TOC]
torch_geometric.data

# 1. 数据划分


```python
from torch_geometric.data import ClusterData, ClusterLoader

torch.manual_seed(12345)
cluster_data = ClusterData(data, num_parts=128)  # 1. Create subgraphs.
# 将一个图 data 划分为 128 个子图
train_loader = ClusterLoader(cluster_data, batch_size=32, shuffle=True) 
# 2. Stochastic partioning scheme.
# 128 个子图 以32 个为一个batch 构建 Loader

print()
total_num_nodes = 0
for step, sub_data in enumerate(train_loader):
    print(f'Step {step + 1}:')
    print('=======')
    print(f'Number of nodes in the current batch: {sub_data.num_nodes}')
    print(sub_data)
    print()
    total_num_nodes += sub_data.num_nodes

print(f'Iterated over {total_num_nodes} of {data.num_nodes} nodes!')
>>> 
# 128 个子图 以32 个为一个batch 构建 Loader ,所以step=4 
```
参考资料：https://pytorch-geometric.readthedocs.io/en/latest/modules/data.html#torch_geometric.data.ClusterData

# 2. 数据采样

`...Sampler` 方法返回一个生成器
## 2.1. RandomNodeSampler

随机节点采样，容易把节点之间的关系删除了


## 2.2. NeighborSampler

真实邻居采样
```python
loader=NeighborSampler(data, size, num_hops, batch_size=1, shuffle=False, drop_last=False, bipartite=True, add_self_loops=False, flow='source_to_target')

for data2 in loader:
  print (data2)
  break


# size 采样邻居数（或比例）
# num_hops 采样跳数
# bipartite=True 返回DataFlow 数据形式 bipartite=False 返回Data 数据形式（实际上是Data形式的subgraph）
```

在 https://github.com/rusty1s/pytorch_geometric/blob/a8f32aaff8608e497f112f700d1fd8ca0cb9ae18/test/data/test_sampler.py 中我们可以看到两种方法的使用

## 2.3. GraphSAINTSampler



```python

loader = GraphSAINTRandomWalkSampler(data,          batch_size=6000, walk_length=2,
    num_steps=5, sample_coverage=100,
    save_dir=dataset.processed_dir,
    num_workers=4)
for data2 in loader:
  print (data2)
  break
```


## 2.4. ShaDowKHopSampler


# 3. 聚合



