---
title: "python中特有数据结构及特性"
layout: page
date: 2099-06-02 00:00
---

# python中特有数据结构及特性

##python 实现经典数据结构
参考：https://github.com/TheAlgorithms/Python/tree/master/data_structures


## 字典 
hash 表 实现 

## with 上下文管理器
```python 
with 上下文管理器对象：
    　语句体

dir(上下文管理器对象)
>>>
...
__enter__
__exit__
...

```

　　当with遇到上下文管理器对象，就会在执行语句体之前，先执行上下文管理器对象的`__enter__`方法，然后再执行语句体，执行完语句体后，最后执行`__exit__`方法

##　修饰器@
```python
def Timer(func):
    def newFunc(*args, **args2):
        t1 = datetime.datetime.now()
        back = func(*args, **args2)
        print (" This function【{}】cost time:{} \n".format(func.__name__,datetime.datetime.now()-t1))
        #logger.info (" This function【{}】cost time:{} \n".format(func.__name__,datetime.datetime.now()-t1))
        return back
    return newFunc

@Timer
def Pi(N):
    #N=10**7
    N=int(N)
    data= np.random.uniform(-1,1,size=(N,2))
    inside=(np.sqrt((data**2).sum(axis=1))<1).sum()
    pi=4*inside/N
    print ("pi is %.5f"%pi)

```

#类 
```python

obj = 12 
# obj can be an object from any class, even object.__new__(object)

class returnExistedObj(object):
    def __new__(cls):
        print("__new__ is called")
        return obj

    def __init(self):
        print("__init__ is called")

returnExistedObj()

执行结果如下：
__new__ is called
12

同时另一个需要注意的点是：
如果我们在__new__函数中不返回任何对象，则__init__函数也不会被调用。
如下面代码所示：
class notReturnObj(object):
    def __new__(cls):
        print("__new__ is called")

    def __init__(self):
        print("__init__ is called")

print(notReturnObj())

执行结果如下：
__new__ is called
None

可见如果__new__函数不返回对象的话，不会有任何对象被创建，__init__函数也不会被调用来初始化对象。
总结几个点

__init__不能有返回值
__new__函数直接上可以返回别的类的实例。如上面例子中的returnExistedObj类的__new__函数返回了一个int值。
只有在__new__返回一个新创建属于该类的实例时当前类的__init__才会被调用。如下面例子所示：
```