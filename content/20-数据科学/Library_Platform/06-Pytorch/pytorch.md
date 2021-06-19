---
title: "Pytorch"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 数据类型与内存大小

| Data type                | dtype                         | CPU tensor         | GPU tensor              | Size/bytes |
| ------------------------ | ----------------------------- | ------------------ | ----------------------- | ---------- |
| 32-bit floating          | torch.float32 or torch.float  | torch.FloatTensor  | torch.cuda.FloatTensor  | 4          |
| 64-bit floating          | torch.float64 or torch.double | torch.DoubleTensor | torch.cuda.DoubleTensor | 8          |
| 16-bit floating          | torch.float16or torch.half    | torch.HalfTensor   | torch.cuda.HalfTensor   | -          |
| 8-bit integer (unsigned) | torch.uint8                   | torch.ByteTensor   | torch.cuda.ByteTensor   | 1          |
| 8-bit integer (signed)   | torch.int8                    | torch.CharTensor   | torch.cuda.CharTensor   | -          |
| 16-bit integer (signed)  | torch.int16or torch.short     | torch.ShortTensor  | torch.cuda.ShortTensor  | 2          |
| 32-bit integer (signed)  | torch.int32 or torch.int      | torch.IntTensor    | torch.cuda.IntTensor    | 4          |
| 64-bit integer (signed)  | torch.int64 or torch.long     | torch.LongTensor   | torch.cuda.LongTensor   | 8          |

# 2. 张量的基本操作

## 2.1. 创建张量
```python
import torch

# 1. 未初始化，都是0
x = torch.Tensor(5, 3)
# 2. 随机初始化
x = torch.rand(5, 3)
x = torch.randn(4, 4)

# 3. 传递参数初始化
x = torch.Tensor([1, 2])


# 4. 通过Numpy初始化
a = np.ones(5)
b = torch.from_numpy(a)




# 5. 获取size，返回一个tuple [5, 3]
print x.size()


```

## 2.2. 数学运算
### 2.2.1. 基础运算
```python
x = torch.rand(5, 3)
y = torch.rand(5, 3)

# 1. 直接相加
z = x + y
# 2. torch相加
z = torch.add(x, y)
# 3. 传递参数返回结果
result = torch.rand(5, 3)
torch.add(x, y, out = result)
# 4. 加到自身去，自身y会改变
y.add_(x)

# 平均
x.mean()
# 范数
x.norm()
```

### 2.2.2. 求梯度

$$z = 2x + 3y + 4$$

求
$$\frac{\partial z}{\partial x},\frac{\partial z}{\partial y}$$
```python
import torch
from torch.autograd import Variable
# 1. 准备式子
# 默认求导是false
x = Variable(torch.Tensor([2]), requires_grad = True)
y = Variable(torch.Tensor([3]), requires_grad = True)
z = 2 * x + 3 * y + 4
# 2. z对x和y进行求导
z.backward()
# 3. 获得z对x和y的导数
print (x.grad.data)		
>>>
# tensor([2.])
print (y.grad.data)
>>>
# tensor([3.])
```

复杂计算
$$y=x+2,z=y*y*3,o=avg(z),求\frac{\partial z}{\partial x}$$


```python 
x = Variable(torch.ones(2, 2), requires_grad = True)
y = x + 2
z = y * y * 3
out = z.mean()
out.backward()
# d(out)/dx
print (x.grad)
>>>
#tensor([[4.5000, 4.5000],
#        [4.5000, 4.5000]])
```


传递梯度
```python
x = Variable(torch.Tensor([2,1]), requires_grad = True)
y = x + 2
gradients = torch.FloatTensor([0.01, 0.1])
y.backward(gradients)
print (x.grad.data)

>>>
#tensor([0.0100, 0.1000])
```
