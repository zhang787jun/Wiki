---
title: "Python--文件IO及路径问题"
layout: page
date: 2099-06-02 00:00
---

[TOC]

**全面拥抱 pathlib**



# 1. 文件系统
我们知道主流的操作系统文件系统都是由两部分组成：
1. 文件夹
2. 文件
文件夹是保存文件的容器,基本上是起到分类管理不同文件的功能.文件埋藏在一层一层的文件夹之下,生成一个路径.多个路径组合成树状就可以描述一个系统的整体文件结构.

# 2. Pathlib


## 2.1. 判断路径

功能|接口
--|--
判断路径是否存在|.exists()
判断路径是否是文件|.is_file()
判断路径是否是文件夹|.is_dir()
判断路径是否是符合特定的文本规则(由re定义)|.match(pattern)

## 2.2. 获取路径信息

功能|接口
--|--
拼接路径|.joinpath(str)
拆分路径中的文件/文件夹|.parts
获取路径上一层的路径|.parent
获取文件/文件夹名|.name
获取文件多级后缀|.suffixes
获取文件后缀|.suffix
获取文件除后缀外的名字|.stem
通过路径获取其对应的uri表示|.as_uri()
获取路径的绝对路径表示|.absolute()
获取文件夹路径下的文件路径生成器|.iterdir()

## 2.3. 文件系统操作

功能|接口
--|--
创建文件夹|.mkdir()
删除文件夹|.rmdir()
创建文件|.touch()
删除文件|.unlink()
查看文件/文件夹基本信息|.stat()
文件/文件夹改名|.rename(target)
文件/文件夹修改权限|.chmod(mode)
```python
from pathlib import Path

Path(".").absolute()
PosixPath('/Users/huangsizhe/Workspace/Documents/TutorialForPython/python-io')
```

# 3. shutil
shutil用于将文件/文件夹递归的迁移至别处或整个文件/文件夹递归的删除

# 4. tempfile
tempfile用于创建临时文件/文件夹

