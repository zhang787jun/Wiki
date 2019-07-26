---
title: "scikit-learn Notebook"
layout: page
date: 2099-06-02 00:00
---

# scikit-learn Notebook

通过 sklearn 进行大规模机器学习
sklearn 是 python 中一个非常著名的机器学习库，但是一般都是在单机上使用而不支持分布式计算，因此往往跟大规模的机器学习扯不上关系。这里通过 sklearn 进行的大规模机器学习指的也不是分布式机器学习，而是指当数据量比内存要大时怎么通过 sklearn 进行机器学习，更准确来说是 out-of-core learning， 这里涉及到的一个核心思想是将数据转化为流式输入，然后通过 SGD 更新模型的参数，当然其中还涉及到一些其他的细节和trick，下面会详细描述。