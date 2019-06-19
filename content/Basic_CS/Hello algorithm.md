---
title: "代码质量及工程化"
layout: page
date: 2099-06-02 00:00
---

# Hello algorithm

[TOC]
## 说明
文仓库代码由python/C++ 混合完成
| 文件名      | 描述         |
| :---------- | :----------- |
| basic.md    | 基础算法思想 |
| leetcode.md | Leecode 刷题 |

## 杂谈
###  高质量的代码
#### 1. 代码规范性
##### 1.1 变量/函数命名格式规范
>Java
· 驼峰命名：多个单词组成一个名称时，第一个单词全部小写，后面单词首字母大写；如：
```Java
public void setUserName(String userName)
```
>C/C++/C#
• 帕斯卡命名：多个单词组成一个名称时，每个单词的首字母大写；

```c++
public void SetUserName(String userName)
```
>python
` 类 首字符大写其他全部小写
```python
class Car(object):
    def __init(self):
        return 
    def run(self)
```

##### 1.2 变量/函数命名语义明确

名词合理、动词到位



#### 2. 代码完整性

##### 2.1 核心功能完整
##### 2.2 边界测试通过
1. 考虑边界问题
2. 循环、递归边界
3. 输入输出边界
##### 2.3 负面测试
1. 可能的错误输入
#### 3. 代码鲁棒性
考虑负面输入
