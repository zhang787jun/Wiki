---
title: "为了更快的xgboost"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 时间复杂度


模型计算的时间复杂度 
$$O(n\times d\times K \times \log n)$$

其中 特征排序的时间复杂度 为
$$O(n \log n)$$
xgboost在训练之前，对输入的每个特征进行了预排序。这个是最大时间消耗点。

- `K` 树的max_depth 
- n 样本数量
- d





# 近似贪心算法


```python
# 精确贪心算法O(features_counts)
for i in range(features_counts):
    do...

# 近似贪心算法 O(bins_counts)
bins=func(features)
for i in range(bins_counts):
    do...
# bins_counts<=features_counts
```

确定分裂节点时候不使用精确贪心算法，tree methods设置`hist`、`approx`，避免使用`exact`(会对模型最终效果产生影响)


#  缓存排序好的特征

$$\gamma$$
依赖框架实现 

- 当数据集大的时候使用近似算法
- Block与并行
- CPU cache 命中优化
- Block预取、Block压缩、Block Sharding等

# GPU 加速
xgboost的GPU 加速只支持 英伟达 显卡的CUDA 上，且只有在 P100 之后的显卡才效率的有显著提高。对Pascal架构之前的显卡会使得计算变得更慢。

参考 ：https://xgboost.readthedocs.io/en/latest/gpu/index.html


```python
#CPU
bst.train(X,Y)
CPU times: user 1min 15s, sys: 260 ms, total: 1min 15s
Wall time: 19.4 s

#GPU
bst.train(X,Y)
CPU times: user 2.17 s, sys: 1.14 s, total: 3.31 s
Wall time: 3.17 s
```

**NOTE**
Pascal 架构作为 Maxwell 架构的升级版，2016 发布第一款产品 Tesla P100 (GP100) 

**使用Pascal架构的相关显卡产品：**
1. GeForce系列游戏显卡
GTX1050、1050Ti、1060(3G, 5G, 6G)、1070、1070Ti、1080、1080Ti等 [12] 
2. QUADRO系列专业显卡
GP100、P6000、P5000、P4000、P2000、P1000、P600、P400等 [13]

3. Tesla系列加速计算卡
P100、P4、P40 [14] 
4. TITAN显卡
TITAN Xp


# 减少特征 
减少不相关特征及自差异性小特征，降低特征之间的相关行。

# 并行计算 


# 数据并行







