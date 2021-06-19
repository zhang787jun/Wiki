---
title: "scipy--数据科学库 "
layout: page
date: 2099-06-02 00:00
---

# scipy 网格搜索

通过蛮力最小化给定范围内的函数。

```python
from scipy.optimize import brute

def func():
    return 1


a,f,g,j = brute(func,range,args =()，Ns = 20,full_output = 0,finish = <function fmin>,disp = False,workers = 1 )

# func 要最小化的目标函数
# range 范围
# Ns int，可选 如果没有另外指定，沿轴的网格点数。见注2。
# full_output bool，可选 如果为True，则返回评估网格和目标函数的值。
```


x0 ndarray
一维数组，包含目标函数具有最小值的点的坐标。（参见注1，返回哪一点。）

fval float
点x0处的函数值。（当full_output为True 时返回。）

网格元组
表示评估网格。它与x0的长度相同。（当full_output为True 时返回。）

Jout ndarray
函数值在评价网格，每个点即，。（当full_output为True 时返回。）Jout = func(*grid)