---
title: "Python--性能优化"
layout: page
date: 2099-06-02 00:00
---
[TOC]
# 1. 时间消耗
## 1.1. python 程序运行时间
```shell
vim  python_file.py
---
print ("hello world")
---
time python python_file.py
>>> 
    real    0m0.146s
    user    0m0.047s
    sys     0m0.063s

```

## 1.2. Jupyter Notebook 记时

- `%%time` 会告诉你cell内代码的单次运行时间信息。

```python
# 
%%time
>>>
Wall time: 0 ns
```
- `%%timeit` 使用了Python的 timeit 模块，该模块运行某语句100000次（默认值），然后提供最快的3次的平均值作为结果。

```python

%%timeit
>>>
9.8 µs ± 277 ns per loop (mean ± std. dev. of 7 runs, 100000 loops each)
# 指定loop次数为5000
%%timeit -n 5000
```
## 修饰器函数计时

```python
import datetime
def Timer(func):
    def newFunc(*args, **args2):
        t1 = datetime.datetime.now()
        print ("[1]")
        result = func(*args, **args2)
        t2=datetime.datetime.now()
        print ("[3]")
        cost_time=t2-t1
        print (" This function【{}】cost time:{} \n".format(func.__name__,cost_time))
        return result
    return newFunc

@Timer
def Pi(N):
    #N=10**7
    N=int(N)
    data= np.random.uniform(-1,1,size=(N,2))
    inside=(np.sqrt((data**2).sum(axis=1))<1).sum()
    pi=4*inside/N
    print ("[2] pi is %.5f"%pi)


```


## cProfile



在进行优化时，我们需要合适的工具来进行性能分析，找到性能的瓶颈，这里推荐使用cProfile模块，官方文档

我们可以在运行python脚本时，使用工具，分析各个调用占用的时间，我们写一个简单的程序：

def fab(num):
    if num == 1:
        return 1
    elif num == 2:
        return 1
    else:
        return fab(num-1) + fab(num-2)

if __name__ == "__main__":
    fab(40)
对以上程序进行性能分析：

$ python -m cProfile -s cumulative sample.py
         1664082 function calls (4 primitive calls) in 0.370 seconds

   Ordered by: cumulative time

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    0.000    0.000    0.370    0.370 {built-in method builtins.exec}
        1    0.000    0.000    0.370    0.370 sample.py:1(<module>)
1664079/1    0.370    0.000    0.370    0.370 sample.py:1(fab)
        1    0.000    0.000    0.000    0.000 {method 'disable' of '_lsprof.Profiler' objects
第一行：1664082个函数调用被监控，其中4个是原生调用（不涉及递归）
ncalls：函数被调用的次数。如果这一列有两个值，就表示有递归调用，第二个值是原生调用次数，第一个值是总调用次数。
tottime：函数内部消耗的总时间。（可以帮助优化）
percall：是tottime除以ncalls，一个函数每次调用平均消耗时间。
cumtime：之前所有子函数消费时间的累计和。
filename:lineno(function)：被分析函数所在文件名、行号、函数名
# 2. 内存消耗

```shell
# 前提 安装 memory_profiler
pip install -U memory_profiler
```

然后，以类似于的方式设置魔术line_profiler。
在IPython 0.11+下，首先创建一个配置文件：

```shell 
$ ipython profile create
```
然后~/.ipython/profile_default/ipython_config.py 在线路分析器旁边注册扩展名 ：

c.TerminalIPythonApp.extensions.append('memory_profiler')
c.InteractiveShellApp.extensions.append('memory_profiler')
这将在IPython终端应用程序和其他前端（例如qtconsole和Notebook）中注册%memit和%mprun魔术命令。

