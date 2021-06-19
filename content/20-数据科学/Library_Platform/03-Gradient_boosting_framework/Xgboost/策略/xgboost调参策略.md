---
title: "xgboost 调参策略"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. Xgboost 参数说明
XGBoost 本身的核心是基于梯度提升树实现的集成算法，整体来说可以有三个核心部分[^1]：
1. 集成算法本身
2. 用于集成的 弱评估器
3. 应用中的其他过程

![](/attach/images/2019-10-16-11-54-02.png)

![](/attach/images/2019-10-16-13-39-32.png)


### 1.1. 基础设置

#### 1.1.1. 基分类器
* ``booster`` [default= ``gbtree`` ]

  - Which booster to use. Can be ``gbtree``, ``gblinear`` or ``dart``; ``gbtree`` and ``dart`` use tree based models while ``gblinear`` uses linear functions.



#### 1.1.2. 目标函数

* `objective` [default = `reg：squarederror`]
  选择目标函数形式。适用于以下问题
  1. 回归 reg
  2. 二分 binary
  3. 多分类 multi
  4. 排序 rank
  5. 泊松回归 count
  6. Cox回归
****
`reg:squarederror`：损失平方回归。

`reg:squaredlogerror`：对数损失平方回归 $log(pred+1)−log(label+1)$。所有输入标签都必须大于-1。

`reg:logistic`：逻辑回归


`reg:gamma`：使用对数链接进行伽马回归。输出是伽马分布的平均值。例如，对于建模保险索赔严重性或对可能是伽马分布的任何结果，它可能很有用。

`reg:tweedie`：使用对数链接进行Tweedie回归。它可能有用，例如，用于建模保险的总损失，或用于可能是Tweedie-distributed的任何结果。


`binary:logistic`：二元分类的逻辑回归，输出概率

`binary:logitraw`：用于二进制分类的逻辑回归，逻辑转换之前的输出得分

`binary:hinge`：二进制分类的铰链损失。这使预测为0或1，而不是产生概率。

`count:poisson` –计数数据的泊松回归，泊松分布的输出平均值

 - max_delta_step 在泊松回归中默认设置为0.7（用于维护优化）

`survival:cox`：针对正确的生存时间数据进行Cox回归（负值被视为正确的生存时间）。请注意，预测是按危险比等级返回的（即，比例危险函数中的HR = exp（marginal_prediction））。h(t) = h0(t) * HR

`multi:softmax`：设置XGBoost以使用softmax目标进行多类分类，还需要设置num_class（类数）

`multi:softprob`：与softmax相同，但输出向量，可以进一步重整为矩阵。结果包含属于每个类别的每个数据点的预测概率。ndata * nclassndata * nclass

`rank:pairwise`：使用LambdaMART进行成对排名，从而使成对损失(Pairwise Classification Loss)最小化， 构建树使得  `Max(Map(Rank(y), Rank(y_hat)))`. However, output is always `y_hat`.

`rank:ndcg`：使用LambdaMART进行列表式排名，使标准化折让累积收益（NDCG）最大化

`rank:map`：使用LambdaMART进行列表平均排名，使平均平均精度（MAP）最大化

`base_score` [默认值= 0.5]

所有实例的初始预测得分，整体偏差
对于足够的迭代次数，更改此值不会有太大影响。
#### 1.1.3. 模型评价
* `eval_metric` [根据目标函数确定默认值]
  - 验证数据的评估指标，将根据目标分配默认指标（回归均方根，分类误差，排名的平均平均精度）
  - 用户可以添加多个评估指标。Python用户：记住将指标作为参数对的列表而不是映射进行传递，以使后者eval_metric不会覆盖前一个

下面列出了这些选择:
`rmse`:均方根误差
`rmsle`:均方根对数误差:
`mae`:平均绝对误差
`logloss`:负对数似然
`error`:二进制分类错误率。计算公式为$error=\frac{wrong cases}{all cases}$。对于预测，评估会将预测值大于0.5的实例视为肯定实例，而将其他实例视为否定实例。
`error@t`:可以通过提供't'的数值来指定不同于0.5的二进制分类阈值。
`merror`:多类分类错误率。计算公式为。#(wrong cases)/#(all cases)
`mlogloss`:多类logloss。
`auc`:曲线下面积
`aucpr`:PR曲线下的面积
`ndcg`:归一化累计折扣
`map`:平均平均精度
`ndcg@n`，`map@n`:'n'可以被指定为整数，以切断列表中的最高位置以进行评估。
`ndcg-`，`map-`，`ndcg@n-`，`map@n-`:在XGBoost，NDCG和MAP将评估清单的比分没有任何阳性样品为1加入-在评价指标XGBoost将评估这些得分为0，是在一定条件下一致。
`poisson-nloglik`:泊松回归的负对数似然
`gamma-nloglik`:伽马回归的对数似然率
`cox-nloglik`:Cox比例风险回归的负对数似然率
`gamma-deviance`:伽马回归的残余偏差
`tweedie-nloglik`:Tweedie回归的负对数似然（在tweedie_variance_power参数的指定值处）


### 1.2. 训练过程参数

* `seed` [default=0]
  - 随机数种子

* ``silent`` [default=0] [弃用]
  - Deprecated.  Please use ``verbosity`` instead.


* ``verbosity`` [default=1]
  -  训练过程信息输出设置
  - Verbosity of printing messages.  Valid values are 0 (silent),
    1 (warning), 2 (info), 3 (debug).  Sometimes XGBoost tries to change

* ``nthread`` [default to maximum number of threads available if not set] 别名 `n_jobs` 
  - Number of parallel threads used to run XGBoost

* ``disable_default_eval_metric`` [default=0]
  - Flag to disable default metric. Set to >0 to disable.

* ``num_pbuffer`` [set automatically by XGBoost, no need to be set by user]
  - Size of prediction buffer, normally set to number of training instances. The buffers are used to save the prediction results of last boosting step.

* ``num_feature`` [set automatically by XGBoost, no need to be set by user]
  - Feature dimension used in boosting, set to maximum dimension of the feature



* `tree_method` [default= `'auto'` ] 
  - 指定了构建树的算法，可以为下列的值(分布式，以及外存版本的算法只支持 `approx`,`hist`,`gpu_hist` 等近似算法)：
  - `auto`： 使用启发式算法来选择一个更快的 tree_method：
    - 对于小的和中等的训练集，使用`exact greedy` 算法分裂节点
    - 对于非常大的训练集，使用`approx`近似算法分裂节点
    - 旧版本在单机上总是使用`exact greedy` 分裂节点

  - `exact`： 使用精确贪婪算法**Basic Exact Greedy Algorithms**分裂节点
  - `approx`： 使用近似算法**Approximate Algorithm for Split Finding** 分裂节点
  - `hist`： 使用histogram 优化的近似算法分裂节点（比如使用了bin cacheing 优化， `max_bin` (default 256) could be tuned）
  - `gpu_exact` ： 基于GPU 的exact greedy 算法分裂节点
  - `gpu_hist`： 基于GPU 的histogram 算法分裂节点


### 1.3. 集成算法设置

* `n_estimator`(sklean中叫n_estimator,xgb原生中的num_boosting_rounds): Number of gradient boosted trees(理解为梯度提升树的迭代生成每个版本的数量/次数). Equivalent to number of boosting rounds.
也是最大的迭代次数。


* `learning_rate`(eta)[default=0.3]: 
每一步迭代的步长，很重要。太大了运行准确率不高，太小了运行速度慢。我们一般使用比默认值小一点。
that the "shrinkage" parameter 0<η≤1 controls the learning rate of the procedure. Empirically (Friedman 1999)

* `subsample`[default=1]。
训练集采样比例。这个参数控制对于每棵树，**每行随机采样的比例**。减小这个参数的值，算法会更加保守，避免过拟合。但是，如果这个值设置得过小，它可能会导致欠拟合。典型值：0.5-1，0.5代表平均采样，防止过拟合. 范围: (0,1]，注意不可取0。


子采样的方法有两种：行子采样(row subsampling)与列子采样(column subsampling)。这里主要指的是行子采样(row subsampling)


### 1.4. 弱评估器设置

* `gamma`(min_split_loss)[default=0]
  
        if loss(x)<gamma:
            make_tree_break()
    如果分裂能够使loss函数减小的值大于gamma，则这个节点才分裂。gamma设置了这个减小的最低阈值。如果gamma设置为0，表示只要使得loss函数减少，就分裂



* `colsample_bytree`[default=1]
用来控制每棵随机**采样的列数**的占比(每一列是一个特征)。 典型值：0.5-1范围: (0,1]


* `colsample_bylevel`[default=1]
这个就相比于前一个更加细致了，它指的是每棵树每次节点分裂的时候列采样的比例


* `max_depth`[default=6]
我们常用3-10之间的数字。这个值为树的最大深度。这个值是用来控制过拟合的。max_depth越大，模型学习的更加具体。设置为0代表没有限制，范围: [0,∞]


* `max_delta_step`[default=0]
这个参数限制了每棵树权重改变的最大步长，如果这个参数的值为0,则意味着没有约束。如果他被赋予了某一个正值，则是这个算法更加保守。通常，这个参数我们不需要设置，但是当个类别的样本极不平衡的时候，这个参数对逻辑回归优化器是很有帮助的。


* `lambda(reg_lambda)`[default=0]
权重的L2正则化项。(和Ridge  regression类似)。这个参数是用来控制XGBoost的正则化部分的。这个参数在减少过拟合上很有帮助。

* `alpha(reg_alpha)`[default=0]
权重的L1正则化项。(和Lasso regression类似)。 可以应用在很高维度的情况下，使得算法的速度更快。


* `scale_pos_weight`[default=1]
在各类别样本十分不平衡时，把这个参数设定为一个正值，可以使算法更快收敛。通常可以将其设置为负样本的数目与正样本数目的比值。

* `min_child_weight` [default=1]
子树需要的最小海森权重矩阵
    - instance weight (hessian) 是不带正则项的损失函数的二阶导（Hessian Matrix，海森矩阵）
    $$h_i=\nabla^2 L(y_i,y^{y-1}) $$

    - sum of instance weight (hessian)
    $$H_h=\sum{h_i} $$
    ```
    if H_h<min_child_weight:
        stop_tree_break 
    ```
    这个参数用来控制过拟合，如果数值太大可能会导致欠拟合。对于高度不平衡问题，叶节点将会有更小的size group， `min_child_weight` 应该设的更小。 

    - 对于**回归问题**，假设损失函数是均方误差函数，每个样本的二阶导数是一个常数，这个时候 min_child_weight就是这个叶子结点中样本的数目。如果这个值设置的太小，那么会出现单个样本成一个叶子结点的情况，这很容易过拟合。
    - 对于分类问题，假设为二分类问题，损失函数为交叉熵，则每个样本的二阶导数可以写成几个因子相乘的形式，其中一项为sigmoid(y_hat)*(1-sigmoid(y_hat))。对分类问题，我们考虑叶子结点的纯度。假设某个叶子节点只包含一类，y = 1,那个这个节点有很大的可能是: 该节点包含的yhat非常正，也就是我们给这个节点打分非常正，这个时候sigmoid(y_hat)非常接近1，上面的式子接近0；反之，假设某个叶子节点只包含y=0，情况也是类似的。从分析中可知，如果某个叶子结点的二阶导之和越小，或者越接近0，这个节点就越纯，这种情况下容易过拟合。


[^2]

# 2. 调参实践指南

主要参考资料：[Complete Guide to Parameter Tuning in XGBoost with codes in Python
](https://www.analyticsvidhya.com/blog/2016/03/complete-guide-parameter-tuning-xgboost-with-codes-python/)

## 2.1. 一般性的调参路径[^3]

1. 选择相对较高的学习率`lr`。
   - 通常设定学习率为0.1。但是对于不同的问题，在0.05~0.3的范围内也有效。
2. 确定此学习率的下最佳决策树数量`tree_num`。
   - XGBoost具有一个非常实用的功能--`cv`，该功能在每次增强迭代时执行交叉验证，从而返回所需的最佳树数。
3. 在确定lr、tree_num 后调整树特定的参数。
   - max_depth, min_child_weight, gamma, subsample, colsample_bytree
4. 调整 xgboost的正则化参数（lambda，alpha），可以帮助降低模型复杂性并提高性能。
5. 降低学习率并确定最佳参数。
6. ...loop


## 2.2. 可用的调参工具

### 2.2.1. 遍历
问如果数据量不大的话可否用parm_grid罗列所有可能的参数，使用`sklearn.GridSearchCV`来验证。将所有可能的组合都尝试一下？

### 2.2.2. 自带CV

一般自己写CV ，`xgb.cv()` 内存消耗太大。

As uses all the data training in its "black box" cross validation process, one's can have problems with huge data sets. 


```python

cv_results = xgboost.cv（
    params，
    dtrain，
    num_boost_round = num_boost_round，
    seed = 42，
    nfold = 5，
    metrics = {'mae'}，
    early_stopping_rounds = 10 
）
cv_results
```

### 2.2.3. 其他

参考自动调参工具




 ## 一般性的参数范围


**树的参数**
`max_depth`=5 : [4-6] 可以作为好的起始值 
`min_child_weight` = 1 : 对于高度不平衡问题，可以设的更小
`gamma` = 0 : 像[0.1-0.2] 这样的小的数值也可以设置为起始值，通常改值在后期进行调整。

`subsample`=0.8：通常在[0.5-0.9] 之间设置起始值
`colsample_bytree` = 0.8 :通常在[0.5-0.9] 之间设置起始值

`scale_pos_weight` = 1: 通常可以将其设置为负样本的数目与正样本数目的比值。


# 3. Q&A


## 3.1. 为什么近似分割算法比精确贪心算法要快？
首先我们得捋一下这两个寻找最佳分裂点的时候都有哪些公共的时间开销
1. 预排序。 每个特征都是按照排序好的顺序存储的，这一部分在存储的时候就已经完成了
2. 计算所有样本的一阶导G和二阶导L。这个过程只需要进行一次
3. 对样本的G和L累加求和，这个过程也只需要进行一次，为了后续做差加速
   - 精确贪心算法中是将所有样本G、L累加
   - 近似分割算法中是按桶累加
4. 算法中的两个for循环，
    1. 第一个循环是遍历所有特征（这一步两个算法相同）
    2. (**关键差异点**)不同的开销在于，两个算法中第二个for循环中。因为桶的数目远小于样本数，所以得以加速

```python
# 精确贪心算法O(samples_counts)
for i in range(samples_counts):
    do...
# 近似贪心算法 O(bins_counts)
for i in range(bins_counts):
    do...
# bins_counts<=samples_counts
```

## 3.2. 不平衡数据问题 怎么处理
XGBoost中的官方文档(https://xgboost.readthedocs.io/en/latest/parameter.html)大致这么说的：
对于一些case，比如：广告点击日志，数据集极不平衡。这会影响xgboost模型的训练，有两个方法来改进它。
1. 如果你关心的预测的ranking order（AUC)：
   1. 通过`scale_pos_weight`来平衡正负类的权重 ，只对目标函数为`binary:logistic` 有效
   2. 使用AUC进行评估
   
2. 如果你关心的是预测的正确率： 
   1. 这种情形下，不能再平衡（re-balance）数据集 
   2. 将参数`max_delta_step`设置到一个有限的数（比如：1）可以获得效果提升.



此外 有人[建议](https://stats.stackexchange.com/questions/243207/what-is-the-proper-usage-of-scale-pos-weight-in-xgboost-for-imbalanced-datasets):
All the documentation says that is should be:

```shell
scale_pos_weight = count(negative examples)/count(Positive examples)
```
In practice, that works pretty well, but if your dataset is extremely unbalanced I'd recommend using something more conservative like:

```shell
scale_pos_weight = sqrt(count(negative examples)/count(Positive examples)) 
```

This is useful to limit the effect of a multiplication of positive examples by a very high weight.
## 3.3. 如何控制模型复杂度

`max_depth`
`gamma`
`alpha`
`lambda`
`min_child_weight`


## 3.4. 如何增加随机性
`sample`: 行采样、列采样
`eta(learning rate)`
`max_depth`


# 4. 参考资料
[^1]: xgboost 参数 https://github.com/dmlc/xgboost/blob/master/doc/parameter.rst

[^2]:xgboost 中文https://www.bookstack.cn/read/xgboost-doc-zh/docs-5.md

[^3]:[Complete Guide to Parameter Tuning in XGBoost with codes in Python
](https://www.analyticsvidhya.com/blog/2016/03/complete-guide-parameter-tuning-xgboost-with-codes-python/)
