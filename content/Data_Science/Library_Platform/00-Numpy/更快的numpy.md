---
title: "为了更快的Numpy"
layout: page
date: 2099-06-02 00:00
---

[TOC]

如何使用numpy，使得其在计算时更快？ 
# 1. 更快的 numpy

## 1.1. mkl 加速

![](/attach/images/2019-10-27-13-56-37.png)

Numpy 的许多函数不仅是用C实现了，还使用了BLAS(Basic Linear Algebra Subprograms，基础线性代数程序集)（一般Windows下link到MKL的，Linux下link到OpenBLAS）。基本上那些BLAS实现在每种操作上都进行了高度优化，例如使用AVX向量指令集，甚至能比你自己用C实现快上许多，更不要说和用Python实现的比

英特尔数学核心库(Intel MKL) 的开发是致力于加速在intel处理器上进行的数学运算。该库支持 Windows、Linux和 macOS 操作系统。


在安装 NumPy 的时候，为了速度更快，我们可以安装带 mkl 的版本。

**安装**
可以通过以下方式安装：
1. conda，
2. 下载二进制whl文件，（Unofficial Windows Binaries for Python Extension Packages, [地址](https://www.lfd.uci.edu/~gohlke/pythonlibs/#scipy)）

```shell
pip install intel-numpy

conda install numpy # conda 版本已经是优化过的 Anoconda （base）环境里面已经安装过 
```

**查看**
```python
import numpy as np 
np.show_config()
>>>
# No MKL
blas_mkl_info:
  NOT AVAILABLE
blis_info:
  NOT AVAILABLE
openblas_info:
    library_dirs = ['C:\\projects\\numpy-wheels\\numpy\\build\\openblas']
    libraries = ['openblas']
    language = f77
    define_macros = [('HAVE_CBLAS', None)]
blas_opt_info:
    library_dirs = ['C:\\projects\\numpy-wheels\\numpy\\build\\openblas']
    libraries = ['openblas']
    language = f77
    define_macros = [('HAVE_CBLAS', None)]
lapack_mkl_info:
  NOT AVAILABLE
openblas_lapack_info:
    library_dirs = ['C:\\projects\\numpy-wheels\\numpy\\build\\openblas']
    libraries = ['openblas']
    language = f77
    define_macros = [('HAVE_CBLAS', None)]
lapack_opt_info:
    library_dirs = ['C:\\projects\\numpy-wheels\\numpy\\build\\openblas']
    libraries = ['openblas']
    language = f77
    define_macros = [('HAVE_CBLAS', None)]

# with mkl
mkl_info:
    libraries = ['mkl_rt']
    library_dirs = ['D:/ProgramData/Anaconda3\\Library\\lib']
    define_macros = [('SCIPY_MKL_H', None), ('HAVE_CBLAS', None)]
    include_dirs = ['C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl', 'C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl\\include', 'C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl\\lib', 'D:/ProgramData/Anaconda3\\Library\\include']      
blas_mkl_info:
    libraries = ['mkl_rt']
    library_dirs = ['D:/ProgramData/Anaconda3\\Library\\lib']
    define_macros = [('SCIPY_MKL_H', None), ('HAVE_CBLAS', None)]
    include_dirs = ['C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl', 'C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl\\include', 'C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl\\lib', 'D:/ProgramData/Anaconda3\\Library\\include']      
blas_opt_info:
    libraries = ['mkl_rt']
    library_dirs = ['D:/ProgramData/Anaconda3\\Library\\lib']
    define_macros = [('SCIPY_MKL_H', None), ('HAVE_CBLAS', None)]
    include_dirs = ['C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl', 'C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl\\include', 'C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl\\lib', 'D:/ProgramData/Anaconda3\\Library\\include']      
    libraries = ['mkl_rt']
    library_dirs = ['D:/ProgramData/Anaconda3\\Library\\lib']
    define_macros = [('SCIPY_MKL_H', None), ('HAVE_CBLAS', None)]
    include_dirs = ['C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl', 'C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl\\include', 'C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl\\lib', 'D:/ProgramData/Anaconda3\\Library\\include']      
lapack_opt_info:
    libraries = ['mkl_rt']
    library_dirs = ['D:/ProgramData/Anaconda3\\Library\\lib']
    define_macros = [('SCIPY_MKL_H', None), ('HAVE_CBLAS', None)]
    include_dirs = ['C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl', 'C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl\\include', 'C:\\Program Files (x86)\\IntelSWTools\\compilers_and_libraries_2019.0.117\\windows\\mkl\\lib', 'D:/ProgramData/Anaconda3\\Library\\include'] 
```

## 1.2. 多维数据在内存的形式

在 Numpy 中, 创建 2D Array 的默认方式是 `C-type` 以 row 为主在内存中排列, 而如果是 `Fortran` 的方式创建的, 就是以 column 为主在内存中排列。
```python
col_major = np.zeros((10,10), order='C')    # C-type
row_major = np.zeros((10,10), order='F')    # Fortran
```

## 1.3. 数组选择copy Vs view

在 Numpy 中, 有两个很重要的概念, copy 和 view. copy 顾名思义, 会将数据 copy 出来存放在内存中另一个地方, 而 view 则是不 copy 数据, 直接取源数据的索引部分. 


选择数据的时候, 我们常会用到 view 或者 copy 的形式. 我们知道了, 如果能用到 view 的, 我们就**尽量用 view, 避免 copy 数据**. 那什么时候会是 view 呢? 下面举例的都是 view 的方式:
```python
------view-----
a_view1 = a[1:2, 3:6]    # 切片 slice
a_view2 = a[:100]        # 同上
a_view3 = a[::2]         # 跳步
a_view4 = a.ravel()      # 上面提到了
...                      # 我只能想到这些, 如果还有请大家在评论里提出
那哪些操作我们又会变成 copy 呢?
------copy-----
a_copy1 = a[[1,4,6], [2,4,6]]   # 用 index 选
a_copy2 = a[[True, True], [False, True]]  # 用 mask
a_copy3 = a[[1,2], :]        # 虽然 1,2 的确连在一起了, 但是他们确实是 copy
a_copy4 = a[a[1,:] != 0, :]  # fancy indexing
a_copy5 = a[np.isnan(a), :]  # fancy indexing
...                          # 我只能想到这些, 如果还有请大家在评论里提出
```

pandas 
```python

--- copy ---
df.ix[]
df.iloc[]
df.loc[]
--- view ---

```

可以发现当选择的列数 大于1 的时候是copy了的，但是如果只选择一列，则没copy，在对其赋值的时候要格外小心。最好还是copy一下吧

有时候我们会经常把一个DataFrame传进一个函数里，又害怕它被函数里面的语句更改了，所以我一般做法是先df.copy()一下，但是其实我们在用ix, iloc, loc 索引的时候就已经进行了拷贝.

## 1.4. 使用 out 参数
非常有用的 out 参数 --启动view
不深入了解 numpy 的朋友, 应该会直接忽略很多功能中的这个 out 参数 (之前我从来没用过). 不过当我深入了解了以后, 发现他非常有用! 比如下面两个其实在功能上是没差的, 不过运算时间上有差, 我觉得可能是 a=a+1 要先转换成 np.add() 这种形式再运算, 所以前者要用更久一点的时间.
```python
a = a + 1         # 0.035230
a = np.add(a, 1)  # 0.032738
```
如果是上面那样, 我们就会触发之前提到的 copy 原则, 这两个被赋值的 a, 都是原来 a 的一个 copy, 并不是 a 的 view. 但是在功能里面有一个 out 参数, 让我们不必要重新创建一个 a. 所以下面两个是一样的功能, 都不会创建另一个 copy. 不过可能是上面提到的那个原因, 这里的运算时间也有差.
```shell
a += 1                 # 0.011219
np.add(a, 1, out=a)    # 0.008843
```
带有 out 的 numpy 功能都在这里:`Universal functions`(https://docs.scipy.org/doc/numpy/reference/ufuncs.html#available-ufuncs). 所以只要是已经存在了一个 placeholder (比如 a), 我们就没有必要去再创建一个, 用 out 方便又有效.

## 1.5. GPU

numpy 不支持GPU, pytoch 可以作为 GPU 版本的 NumPy 替代品。

# 用好numpy
在计算方面，实际上有三个概念使NumPy具有强大的功能：

1. 向量化
2. 广播
3. 索引编制

参考： https://realpython.com/numpy-array-programming/
# 2. 更小的numpy
主要针对内存

```python
 <type 'int'> size is 12
 <type 'bool'> size is 12
 <type 'long'> size is 14
 <type 'float'> size is 16
 <type 'str'> size is 21
 <type 'list'> size is 36
 <type 'tuple'> size is 28
 <type 'dict'> size is 140
 <type 'set'> size is 116 


<class 'numpy.float32'> 28
<class 'numpy.float64'> 32

<class 'numpy.int64'> 32
<class 'numpy.int32'> 28
<class 'numpy.int16'> 26

<class 'numpy.ndarray'> 100     # np.int
<class 'numpy.ndarray'> 100     # np.float32
<class 'numpy.ndarray'> 104     # np.float64
```

numpy 默认浮点为float64


# 3. 测试

```python
# 测试用例1--SVD 奇异值分解
import datetime
import numpy as np

for i in range (5):
    t0=datetime.datetime.now()
    a = np.random.rand(10000, 100)
    U, s, V = np.linalg.svd(a)
    t1=datetime.datetime.now()
    print ("time cost {}".format(t1-t0))

time cost 0:00:12.010129 # ubuntu conda numpy mkl
time cost 0:00:13.581722 # ubuntu conda numpy 

time cost 0:00:12.934425 # windows conda numpy mkl
time cost 0:00:13.737275 # windows conda numpy 

time cost 0:00:20.864863 # colab Linux numpy
```

# 4. 参考资料

[^1]: How To Make Your Pandas Loop 71803 Times Faster https://towardsdatascience.com/how-to-make-your-pandas-loop-71-803-times-faster-805030df4f06

