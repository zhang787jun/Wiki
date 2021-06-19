---
title: "xgboost 概述"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. What's Xgboost

XGBoost is an open-source software library which provides a gradient boosting framework for C++, Java, Python, R, and Julia. It works on Linux, Windows, and macOS. From the project description, it aims to provide a "Scalable, Portable and Distributed Gradient Boosting Library"

XGBoost 是一个实现梯度提升算法的开源软件框架，核心是基于梯度提升树实现的集成算法。

XGBoost 使用`C++` 实现的,提供C、python、Java 等接口。


![](../../../../attach/images/2019-10-24-09-22-15.png)


# 2. 原理

## 2.1. 数学建模

## 2.2. 分裂节点算法

### 2.2.1. 精确算法
精确贪婪算法 Basic Exact Greedy Algorithms

![](/attach/images/2019-11-22-14-38-03.png)

由于要遍历所有的属性的所有取值，因此，通常需要在训练之前对所有样本做一个预排序(pre-sort)，从而避免每次选择属性都要重新排序。

### 2.2.2. 近似算法
近似算法(Approximate Algorithm for Split Finding)

![](/attach/images/2019-11-22-15-12-14.png)
对于值为连续值的特征，当样本数非常大，特征取值过多，遍历所有取值复杂度较高，而且容易过拟合。因此，考虑将特征值分桶，即找到ll个分位点，将位于相邻分位点之间的样本分在一个桶中，在遍历该特征的时候，只需要遍历各个分位点，从而计算最优划分。


