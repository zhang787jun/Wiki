---
title: "01-[概念]安全与算法"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 安全问题

数据传输的4个安全问题 
| No. | 问题     | 解决方案            |
| --- | -------- | ------------------- |
| 1   | 窃听     | 加密                |
| 2   | 假冒     | 数字签名/消息认证码 |
| 3   | 篡改     | 数字签名/消息认证码 |
| 4   | 事后否认 | 数字签名            |

# 2. 密码学基础
##  2.1. 哈希函数
##  2.2. 共享密钥（对称加密）
##  2.3. 公开密钥（非对称加密）
##  2.4. 混合加密
##  2.5. 迪菲Herman 加密
##  2.6. 消息验证码
## 2.7. 数字签名
##  2.8. 数字证书


# 3. 实践与应用

## 3.1. uuid

UID含义是通用唯一识别码 (Universally Unique Identifier)，这是一个软件建构的标准，也是被开源软件基金会 (Open Software Foundation, OSF) 的组织在分布式计算环境 (Distributed Computing Environment, DCE) 领域的一部份。
uuid是指在一台机器上生成的数字，它保证对在同一时空中的所有机器都是唯一的。
### 3.1.1. uuid1——基于时间戳
由MAC地址、当前**时间戳**、**随机数**生成。可以保证全球范围内的唯一性，
但MAC的使用同时带来安全性问题，局域网中可以使用IP来代替MAC。
### 3.1.2. uuid2——基于分布式计算环境DCE
算法与uuid1相同，不同的是把**时间戳**的前4位置换为POSIX的UID。实际中很少用到该方法。
（Python中没有这个内置函数）
### 3.1.3. uuid3——基于名字的MD5散列值

通过计算**名字**和**命名空间**的MD5散列值得到，保证了同一命名空间中不同名字的唯一性，和不同命名空间的唯一性，但同一命名空间的同一名字生成相同的uuid。    
### 3.1.4. uuid4——基于随机数
由伪随机数得到，有一定的重复概率，该概率可以计算出来。
### 3.1.5. uuid5——基于名字的SHA-1散列值
算法与uuid3相同，不同的是使用` Secure Hash Algorithm 1` 算法


**示例**
```python
>>> import uuid

>>> # make a UUID based on the host ID and current time
>>> a=uuid.uuid1()
>>> a
UUID('a8098c1a-f86e-11da-bd1a-00112444be1e')

>>>type(a)
<class 'uuid.UUID'>
>>>dir(a)
a.int
a.hex
...

>>> # make a UUID using an MD5 hash of a namespace UUID and a name
>>> uuid.uuid3(uuid.NAMESPACE_DNS, 'python.org')
UUID('6fa459ea-ee8a-3ca4-894e-db77e160355e')

>>> # make a random UUID
>>> uuid.uuid4()
UUID('16fd2706-8baf-433b-82eb-8c7fada847da')

>>> # make a UUID using a SHA-1 hash of a namespace UUID and a name
>>> uuid.uuid5(uuid.NAMESPACE_DNS, 'python.org')
UUID('886313e1-3b8a-5372-9b90-0c9aee199e5d')

>>> # make a UUID from a string of hex digits (braces and hyphens ignored)
>>> x = uuid.UUID('{00010203-0405-0607-0809-0a0b0c0d0e0f}')

>>> # convert a UUID to a string of hex digits in standard form
>>> str(x)
'00010203-0405-0607-0809-0a0b0c0d0e0f'

>>> # get the raw 16 bytes of the UUID
>>> x.bytes
'\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\x0c\r\x0e\x0f'

>>> # make a UUID from a 16-byte string
>>> uuid.UUID(bytes=x.bytes)
UUID('00010203-0405-0607-0809-0a0b0c0d0e0f')
```



# 4. 公钥/私钥


# 5. CA 证书

核心作用：**认证（开证明）**

你有钱，谁能证明？
银行人员 
银行行长 

## 5.1. 根CA

`只要这个公钥说的话我都无条件相信`。的机构

![](../../../../../attach/images/2019-12-13-21-10-07.png)
