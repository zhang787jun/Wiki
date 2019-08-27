---
title: "python中特有数据结构及特性"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# python中特有数据结构及特性

## python 实现经典数据结构
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


## 高阶函数

什么是**高阶函数**？（不是高级函数）
把函数名当做参数传给另外一个函数，在另外一个函数中通过参数调用执行

```python 
#!/usr/bin/python3

def func_x(x):
    return x * 2

def func_y(y):
    return y * 3

def func_z(x, y):
    # 等价于 return func_x(5) + func_y(3)
    return x(5) + y(3)

if __name__ == '__main__':
    # 把函数当做参数，本质上是把函数的内存地址当做参数传递过去，
    result = func_z(func_x, func_y)
    print(result)
``` 
### map

### sorted


##　修饰器@ [^1]

**函数就是用来写core 函数的**--路飞

### 基本定性

装饰器本质上是一个高级Python函数，通过给别的函数添加@标识的形式实现对函数的装饰，这个函数的特殊之处在于它的返回值也是一个函数

**优势：**
1. 可以让其他函数在不需要做任何代码变动的前提下增加额外功能

**应用场景：**

经常用于有切面需求的场景，例如: 
1. 插入日志
2. 性能测试
3. 事务处理
4. 缓存
5. 权限校验等场景

有了装饰器，我们就可以抽离出大量与函数功能本身无关的雷同代码并继续重用。

### 详解

#### 1. 简单修饰器

**3个关键函数**

关于 decorator, 基本上一共有三个函数:
1. decorator: 修饰器/修饰函数
2. orifunc: 原函数/被修饰函数
3. wrapper: 新函数/取代函数/闭包函数


简单的可以标识为:

```python
def decorator(orifunc):
    # do something here (register...)
    def wrapper(*args, **kwargs):
        # do something before (preprocess)
        result = orifunc()
        # do something after (postprocess)
        return result
    return wrapper
```
它们的关系是:
```python
wrapper = decorator(orifunc)
```
上述表示等同于
```python
@decorator
def orifunc(*args, **kwargs):
    # do something...
```

**执行顺序**

```python
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

>>> 
"[1]"
"[2]  pi is 3.1415"
"[3]"
"This function Pi cost time:{}"
```






#### 2. 内置修饰器 
修饰器可以自定义，同时，python中也有自定义的几个修饰器
内置的装饰器有三个，分别是staticmethod、classmethod和property，作用分别是把类中定义的实例方法变成静态方法、类方法和类属性。

使用频率也非常低。
##### @staticmethod

##### @classmethod--类方法

##### @property--属性


在绑定类属性时，如果我们直接把属性暴露出去，虽然写起来很简单，但是，没办法检查参数，导致可以把成绩随便改：
```python
s = Student()
s.score = 9999 # 成绩不能大于100 ，参数值不合理 
```
这显然不合逻辑。**为了限制score的范围**，可以通过一个set_score()方法来设置成绩，再通过一个get_score()来获取成绩，这样，在set_score()方法里，就可以检查参数：
```
class Student(object):
    def get_score(self):
         return self._score

    def set_score(self, value):
        if not isinstance(value, int):
            raise ValueError('score must be an integer!')
        if value < 0 or value > 100:
            raise ValueError('score must between 0 ~ 100!')
        self._score = value

```

还记得装饰器（decorator）可以给函数动态加上功能吗？对于类的方法，装饰器一样起作用。Python内置的@property装饰器就是负责把一个方法变成属性调用的：
```python
class Student(object):

    @property
    def score(self):
        return self._score

    @score.setter
    def score(self, value):
        if not isinstance(value, int):
            raise ValueError('score must be an integer!')
        if value < 0 or value > 100:
            raise ValueError('score must between 0 ~ 100!')
        self._score = value
```
@property的实现比较复杂，我们先考察如何使用。把一个getter方法变成属性，只需要加上@property就可以了，此时，@property本身又创建了另一个装饰器@score.setter，负责把一个setter方法变成属性赋值，于是，我们就拥有一个可控的属性操作：


还可以定义只读属性，只定义getter方法，不定义setter方法就是一个只读属性：
```python
class Student(object):

    @property
    def birth(self):
        return self._birth

    @birth.setter
    def birth(self, value):
        self._birth = value

    @property
    def age(self):
        return 2015 - self._birth
```
上面的birth是可读写属性，而age就是一个只读属性，因为age可以根据birth和当前时间计算出来

### 进阶修饰器 
#### 1. 原函数有参数传入
python 中函数的参数分为
1.必选参数
2.默认参数
3.可变参数 *args  仅仅在参数前面加了一个*号。
4.关键字参数 **kw

###### 原函数有确定参数输入
```python
# 非语法糖
def use_logging(func):
    def wrapper(name):
        logging.warn("%s is running" % func.__name__)
        return func(name)   # 把 orifunc 当做参数传递进来时，执行func()就相当于执行 orifunc()
    return wrapper

def orifunc(name):
    print("i am {}".format(name))
# 因为装饰器 use_logging(foo) 返回的时函数对象 wrapper，这条语句相当于  orifunc = wrapper
# orifunc()就相当于执行 wrapper()
>>> orifunc = use_logging(orifunc) 
>>> orifunc("me")


# 语法糖
def use_logging(func):
    def wrapper(name):
        logging.warn("%s is running" % func.__name__)
        return func(name)
    return wrapper

@use_logging
def orifunc(name):
    print("i am {}".format(name))

>>> orifunc("me")
```
###### 原函数可变参数输入

```python
#------[2] 参数列表输入


def foo(name):
    print("i am %s" % name)

def wrapper(*args):
        logging.warn("%s is running" % func.__name__)
        return func(*args)
    return wrapper

```
###### 原函数字典参数输入

```python
def foo(name, age=None, height=None):
    print("I am %s, age %s, height %s" % (name, age, height))

def wrapper(*args, **kwargs):
        # args是一个数组，kwargs一个字典
        logging.warn("%s is running" % func.__name__)
        return func(*args, **kwargs)
    return wrapper

```


####　2.装饰器有参数传入
有多种方式让装饰器接受可选参数。根据你是想使用位置参数、关键字参数还是两者皆是，需要使用稍微不同的模式。如下我将展示一种接受一个可选关键字参数的方式：
1.定义3层闭包
2.Layer 1 最外层形参用来接收装饰器参数
3.Layer 2 第二层用来接受被修饰的原函数
4.Layer 3 第三层用来传递原函数的参数

```python
def nominally_decorator(*args,**kw):       
    # Layer 1  *args,**kw 为nominally_decorator的参数
    def core_decorator(orifunc):           
        # Layer 2 第二层用来接受被修饰的原函数
        def wrapper(*arguments_for_orifunc, **kwargs_for_orifunc): 
            # Layer 3 Layer 3 第三层用来传递原函数的参数
            
            # do something before (preprocess)
            result = orifunc(*arguments_for_orifunc, **kwargs_for_orifunc)
            # do something after (postprocess)
            
            return result
        return wrapper
    return core_decorator
```


```python
from inspect import signature
from functools import wraps

def typeassert(*ty_args, **ty_kwargs):
    def decorate(func):
        # If in optimized mode, disable type checking 关闭类型检测模式
        if not __debug__:
            return func
        # 通过signature方法，获取函数形参：name, age, height
        sig = signature(func)
        bound_types = sig.bind_partial(*ty_args, **ty_kwargs).arguments

        @wraps(func)
        def wrapper(*args, **kwargs):
            bound_values = sig.bind(*args, **kwargs)
            # Enforce type assertions across supplied arguments
            for name, value in bound_values.arguments.items():
                if name in bound_types:
                    if not isinstance(value, bound_types[name]):
                        raise TypeError(
                            'Argument {} must be {}'.format(name, bound_types[name])
                            )
            return func(*args, **kwargs)
        return wrapper
    return decorate
```



### 装饰器顺序

一个函数还可以同时定义多个装饰器，比如：
```python
@a
@b
@c
def f ():
    pass
```
它的执行顺序是从里到外，最先调用最里层的装饰器，最后调用最外层的装饰器，它等效于
```
f = a(b(c(f)))
```
### 装饰器类

仅装饰器可以装饰一个类，并且装饰器也可以是一个类！对于装饰器的唯一要求就是它的返回值必须可调用(callable)。这意味着装饰器必须实现 __call__ 魔术方法，当你调用一个对象时，会隐式调用这个方法。函数当然是隐式设置这个方法的。我们重新将 identity_decorator 创建为一个类来看看它是如何工作的。
```python
class IdentityDecorator(object):
    def __init__(self, func):
        self.func = func

    def __call__(self):
        self.func()


@IdentityDecorator
def a_function():
    print "I'm a normal function."

a_function()
# >> I'm a normal function.
```


## 类 

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
## 参考资料
[^1]:理解 Python 装饰器看这一篇就够了
https://foofish.net/python-decorator.html