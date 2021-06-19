---
title: "xgboost--基于sklearn API的使用"
layout: page
date: 2099-06-02 00:00
---
[TOC]

xgboost 设计了 Scikit-Learn API


# 前提
xgboost 使用 Scikit-Learn API 需要提前安装sklearn

短语参数命名规则。现在在xgboost的module中，有一个sklearn的封装。在这个module中命名规则和sklearn的命名规则一致。
1. eta –> learning_rate
2. lambda –> reg_lambda
3. alpha –> reg_alpha
4. num_round ->n_estimators