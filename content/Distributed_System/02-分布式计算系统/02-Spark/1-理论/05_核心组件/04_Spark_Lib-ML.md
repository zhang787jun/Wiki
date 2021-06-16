---
title: "Spark Lib--MLib"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# 1. 概要

Apache Spark 提供了一个名为MLlib的机器学习API。 PySpark也在Python中使用这个机器学习API。 它支持不同类型的算法，如下所述
1. mllib.classification - spark.mllib包支持二进制分类，多类分类和回归分析的各种方法。 分类中一些最流行的算法是Random Forest, Naive Bayes, Decision Tree等。

2. mllib.clustering - 聚类是一种无监督的学习问题，您可以根据某些相似概念将实体的子集彼此分组。

3. mllib.fpm - 频繁模式匹配是挖掘频繁项，项集，子序列或其他子结构，这些通常是分析大规模数据集的第一步。 多年来，这一直是数据挖掘领域的一个活跃的研究课题。

4. mllib.linalg - 线性代数的MLlib实用程序。

5. mllib.recommendation - 协同过滤通常用于推荐系统。 这些技术旨在填写用户项关联矩阵的缺失条目。

6. spark.mllib - 它目前支持基于模型的协同过滤，其中用户和产品由一小组可用于预测缺失条目的潜在因素描述。 spark.mllib使用交替最小二乘（ALS）算法来学习这些潜在因素。

7. mllib.regression - 线性回归属于回归算法族。 回归的目标是找到变量之间的关系和依赖关系。 使用线性回归模型和模型摘要的界面类似于逻辑回归案例。






# 2. Classification

'DStream',
 'DenseVector',
 'LabeledPoint',
 'LinearClassificationModel',
 'LinearModel',
 'Loader',
 'LogisticRegressionModel',
 'LogisticRegressionWithLBFGS',
 'LogisticRegressionWithSGD',
 'NaiveBayes',
 'NaiveBayesModel',
 'RDD',
 'SVMModel',
 'SVMWithSGD',
 'Saveable',
 'SparseVector',
 'StreamingLinearAlgorithm',
 'StreamingLogisticRegressionWithSGD',

# 3. Regression

# 4. clustering


# 5. Recommendation

# 6. spark.mllib 

# 7. linalg

# 8. fpm