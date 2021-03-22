---
title: "xgboost--基于原生API使用"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 实践


## 1.1. 创建数据对象
```python
import xgboost as xgb
dtrain = xgb.DMatrix(train_file)
dtrain = xgb.DMatrix(data=df,label=df_label)

dtrain = xgb.DMatrix('train.svm.txt')
dtest = xgb.DMatrix('test.svm.buffer')

dtrain = xgb.DMatrix('train.csv?format=csv&label_column=0')

import sys 
sys.getsizeof(dtrain)
>>>
55 # 占用内存大小55 bytpe
# dtrain 是一个对象，没有加载数据,
```

## 1.2. 设置参数
参数通过字典的形式传达到训练器中 
```python
param = {"booster":"gbtree", "verbosity：1",'max_depth':6, 'eta':0.1, "gamma":0,"subsample":1, "tree_method":"hist","lambda":1,"alpha":0,
'objective':'binary:logistic',"subsample":1, }
num_round = 10

```


## 1.3. 训练

### 1.3.1. 通用模式
```python
bst = xgb.train(param, dtrain, num_round,)
```

### 1.3.2. 早停模式

如果您有一个验证集, 你可以使用提前停止找到最佳数量的 boosting rounds（梯度次数）. 提前停止至少需要一个 evals 集合. 如果有多个, 它将使用最后一个.

```python
xgb.train(..., evals=evals, early_stopping_rounds=10)
```

该模型将开始训练, 直到验证得分停止提高为止. 验证错误需要至少每个 early_stopping_rounds 减少以继续训练.

如果提前停止，模型将有三个额外的字段: bst.best_score, bst.best_iteration 和 bst.best_ntree_limit. 请注意 train() 将从上一次迭代中返回一个模型, 而不是最好的一个.

这与两个度量标准一起使用以达到最小化（RMSE, 对数损失等）和最大化（MAP, NDCG, AUC）. 请注意, 如果您指定多个评估指标, 则 param ['eval_metric'] 中的最后一个用于提前停止.
预测

当您 训练/加载 一个模型并且准备好数据之后, 即可以开始做预测了.
```python
# 7 个样本, 每一个包含 10 个特征
data = np.random.rand(7, 10)
dtest = xgb.DMatrix(data)
ypred = bst.predict(xgmat)
```
如果在训练过程中提前停止, 可以用 bst.best_ntree_limit 从最佳迭代中获得预测结果:
```python
ypred = bst.predict(xgmat,ntree_limit=bst.best_ntree_limit)
```
## 1.4. 模型评估

1. 在 param 字典中添加<eval_metric:value_list>
   - value_list 中 可选项为 `rmse`,`error`,`auc`
2. 添加 watchlist
3. 定义空的evals_result，并传入到xgb.train 中间

```shell
# 在 param 中添加eval_metric
param = {'bst:max_depth': 2, 'bst:eta': 1,
                 'silent': 1, 'objective': 'binary:logistic', 'eval_metric': ['error', "auc"]}
num_round = 2
# 添加 watchlist
watchlist = [(dtest,'eval'), (dtrain,'train')]
# 定义空的evals_result，并传入到xgb.train 中间
evals_result = {}
bst = xgb.train(param, dtrain, num_round, watchlist, evals_result=evals_result)

print(evals_result)
>>>
{'watchlist中的name': {'eval_metric 中的类型': [0.151299, 0.150435, 0.150391, 0.150028, 0.149955, 0.150004, 0.149852, 0.149685, 0.149008, 0.148895], 'auc': [0.719014, 0.72576, 0.73082, 0.733395, 0.738091, 0.74203, 0.745483, 0.747434, 0.750762, 0.754281]}}
```
## 1.5. 模型保存
训练之后，您可以保存模型并将其转储出去。
```python
bst.save_model('0001.model')
```

转储模型和特征映射 您可以将模型转储到 txt 文件并查看模型的含义
```python 
# 转存模型
bst.dump_model('dump.raw.txt')
# 转储模型和特征映射
bst.dump_model('dump.raw.txt','featmap.txt')
```
## 1.6. 加载模型
当您保存模型后, 您可以使用如下方式在任何时候加载模型文件
```python 
bst = xgb.Booster({'nthread':4}) #init model
bst.load_model("model.bin") # load data
```
## 1.7. 预测
```python 
ypred = bst.predict(dtest)

type(ypred)
>>>
numpy.array 

```

## 1.8. 绘图
xgb 的 plotting（绘图）模块可以绘制出 importance（重要性）以及输出的 tree（树）.
前提：
1. matplotlib
2. graphviz


当您使用 IPython时, 你可以使用 to_graphviz 函数, 它可以将 target tree（目标树） 转换成 graphviz 实例. graphviz 实例会自动的在 IPython 上呈现.

```python
import xgboost as xgb

xgb.plot_importance(bst)
xgb.plot_tree(bst, num_trees=2)
# num_trees

# 使用 IPython
xgb.to_graphviz(bst, num_trees=2)
```


## 1.9. GPU 加速
xgboost的GPU 加速只支持 英伟达 显卡的CUDA 上，且只有在 P100 之后的显卡才效率的有显著提高。对Pascal架构之前的显卡会使得计算变得更慢。

参考 ：https://xgboost.readthedocs.io/en/latest/gpu/index.html

**NOTE**
Pascal架构作为 Maxwell 架构的升级版，2016 发布第一款产品 Tesla P100 (GP100) 

## 1.10. 特征重要性
评价特征重要性的指标：

1. `weight`
    - 在这个树集合模型中，用该特征进行决策树分割的总次数
    - the number of times a feature is used to split the data across all trees.
2. `gain` 
   - 用该特征进行决策树分割 基尼系数（或其他指标）的评价增加
   - the average gain of the feature when it is used in trees
3. `cover` 
   - the average coverage of the feature when it is used in trees
4. `total_gain` 
   - the total gain across all splits the feature is used in.
5. `total_cover` 
   - the total coverage across all splits the feature is used in.

```python 
score_dict=booster.get_score(fmap='', importance_type='weight')
score_dict
>>>
# {
#     "feature_1":100,
#     "feature_2":100,
#     ...
# }

score_dict=booster.get_fscore(fmap='', importance_type='weight')

# 以下为 xgboost Sklearn API 的 特征重要性
score_dict=model.booster().get_score(importance_type='weight')
score_dict=clf.get_booster().get_score(importance_type="gain")
score_dict=regr.get_booster().get_score(importance_type="gain")
```


