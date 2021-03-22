---
title: "02_Numpy--财务分析"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 财务分析
numpy提供了简单的财务分析函数

## 1.1. 终值

```python
# 求按比率计算n步后的值
np.fv(rate, nper, pmt, pv[, when])
#参数：
rate：每一期的利率（rate of interest）。数值或矩阵(M, )。
nper：期数。
pmt：payment。
pv：present value，现值。
when：{{‘begin’, 1}, {‘end’, 0}}, {string, int}, optional. 
    每一期的开头还是结尾付。

```

例如: 现在存200美元,且每月存100美元,假设利率是5%,6%,7%（每月）复利,求10年后的未来价值是多少

```python

a = np.array((0.05, 0.06, 0.07))/12
np.fv(a, 10*12, -100, -200)
>>>
array([15857.6298441 , 16751.81402745, 17710.41301869])

【负值代表现金流出，比如存到银行后目前就不可用了。】

```
## 1.2. 现值

计算未来金额在现在的价值
```python
np.pv(rate, nper, pmt, fv=0.0, when='end')

# 参数 含义同fv
# 例子：年利率5%，每月投入100，需要投入多少本金才可以在10年后的15682.93。

>>> np.pv(0.05/12, 10*12, -100, 15692.93)
-100.00067131625819
```

## 1.3. 每期支付金额 

```python
np.pmt(rate, nper, pv, fv=0, when='end')

# 参数
> nper是计算次数
> pv是本金
np.pmt(0.075/12, 12*15, 200000)
```

### 1.3.1. 每期支付金额--本金部分

```python 
np.ppmt(rate, per, nper, pv, fv=0.0, when='end')
```
### 1.3.2. 每期支付金额--利息部分

```python
np.ipmt(rate, per, nper, pv, fv=0.0, when='end')
```

## 1.4. 分期数

```python
np.nper(rate, pmt, pv, fv=0, when='end')
```
计算公式为:

```python
fv + pv*(1+rate)**nper + pmt*(1+rate*when)/rate*((1+rate)**nper-1) = 0
fv+pv∗(1+rate)∗∗nper+pmt∗(1+rate∗when)/rate∗((1+rate)∗∗nper−1)=0
```


如果rate = 0,那么:

```python
fv + pv + pmt*nper = 0
fv+pv+pmt∗nper=0
print(np.nper(0.07/12, -150, 8000))
Copy to clipboardErrorCopied
rate(nper, pmt, pv, fv, when='end', guess=0.1, tol=1e-06, maxiter=100)
```
## 1.5. 利率
计算每个周期的利率
通过迭代求解(非线性)方程来计算利息率:

```python
np.rate(nper, pmt, pv, fv[, when='end', guess=0.1, tol=1e-06, maxiter=100])
```

```python
fv + pv*(1+rate)**nper + pmt*(1+rate*when)/rate * ((1+rate)**nper - 1) = 0
fv+pv∗(1+rate)∗∗nper+pmt∗(1+rate∗when)/rate∗((1+rate)∗∗nper−1)=0
```



# 2. 投资决策

## 2.1. 内部收益率(IRR)
```python
np.irr(values)
```
numpy使用公式

$$\sum_{t=0}^M{\frac{v_t}{(1+irr)^{t}}} = 0
t=0
∑
M
(1+irr) 
t
v 
t
​	=0$$


```python
print(round(np.irr([-100, 39, 59, 55, 20]), 5))
print(round(np.irr([-100, 0, 0, 74]), 5))
print(round(np.irr([-100, 100, 0, -7]), 5))
print(round(np.irr([-100, 100, 0, 7]), 5))
print(round(np.irr([-5, 10.5, 1, -8, 1]), 5))
>>>
0.28095
-0.0955
-0.0833
0.06206
0.0886
```
### 2.1.1. 修正内部收益率
```python
mirr(values, finance_rate, reinvest_rate)
```

## 2.2. 净现值



$$\sum_{t=0}^{M-1}{\frac{values_t}{(1+rate)^{t}}}t=0∑M−1
(1+rate) t values t$$

```python
np.npv(rate, values)
>>>
values: 为现金流量时间序列的价值

np.npv(0.281,[-100, 39, 59, 55, 20])
-0.00847859163845488
```

现金流"事件"之间的(固定)时间间隔必须与给出费率的时间间隔相同(即如果费率是每年,则恰好一年被理解为在每个现金流事件之间流逝).

按惯例,投资或"存款"是负数,收入或"提款"是正数; 值必须以初始投资开始,因此值通常为负值.

净现值是一项投资所产生的未来现金流的折现值与项目投资成本之间的差值. 净现值指标是反映项目投资获利能力的指标.

**决策标准**:
1. 净现值≥0 方案可行;
2. 净现值＜0 方案不可行;
3. 净现值均＞0 净现值最大的方案为最优方案.

**优点**:
1. 考虑了资金时间价值,增强了投资经济性的评价;
2. 考虑了全过程的净现金流量,体现了流动性与收益性的统一;
3. 考虑了投资风险,风险大则采用高折现率,风险小则采用低折现率.

**缺点**：
1. 净现值的计算较麻烦,难掌握;
2. 净现金流量的测量和折现率较难确定;
3. 不能从动态角度直接反映投资项目的实际收益水平;
4. 项目投资额不等时,无法准确判断方案的优劣.


