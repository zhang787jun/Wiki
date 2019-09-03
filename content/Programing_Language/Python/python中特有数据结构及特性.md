---
title: "python中特有数据结构及特性"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. python中特有数据结构及特性

## 1.1. python 实现经典数据结构
参考：https://github.com/TheAlgorithms/Python/tree/master/data_structures


## 1.2. 字典
hash 表 实现 

## 1.3. with 上下文管理器
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


## 1.4. 高阶函数

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
### 1.4.1. map

### 1.4.2. sorted


## 1.5. 修饰器@ [^1]

**函数就是用来写core 函数的**--路飞

### 1.5.1. 基本定性

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

### 1.5.2. 详解

#### 1.5.2.1. 简单修饰器

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






#### 1.5.2.2. 内置修饰器
修饰器可以自定义，同时，python中也有自定义的几个修饰器
内置的装饰器有三个，分别是staticmethod、classmethod和property，作用分别是把类中定义的实例方法变成静态方法、类方法和类属性。

使用频率也非常低。
##### 1.5.2.2.1. @staticmethod

##### 1.5.2.2.2. @classmethod--类方法

##### 1.5.2.2.3. @property--属性


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

### 1.5.3. 进阶修饰器
#### 1.5.3.1. 原函数有参数传入
python 中函数的参数分为
1.必选参数
2.默认参数
3.可变参数 *args  仅仅在参数前面加了一个*号。
4.关键字参数 **kw

###### 1.5.3.1.1. 原函数有确定参数输入
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
###### 1.5.3.1.2. 原函数可变参数输入

```python
#------[2] 参数列表输入


def foo(name):
    print("i am %s" % name)

def wrapper(*args):
        logging.warn("%s is running" % func.__name__)
        return func(*args)
    return wrapper

```
###### 1.5.3.1.3. 原函数字典参数输入

```python
def foo(name, age=None, height=None):
    print("I am %s, age %s, height %s" % (name, age, height))

def wrapper(*args, **kwargs):
        # args是一个数组，kwargs一个字典
        logging.warn("%s is running" % func.__name__)
        return func(*args, **kwargs)
    return wrapper

```


#### 1.5.3.2. 装饰器有参数传入
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



### 1.5.4. 装饰器顺序

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
### 1.5.5. 装饰器类

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


## 1.6. 类

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


## 魔方方法

什么是Python魔法方法?
魔法方法就如同它的名字一样神奇，总能在你需要的时候为你提供某种方法来让你的想法实现。魔法方法是指Python内部已经包含的，被双下划线所包围的方法，这些方法在进行特定的操作时会自动被调用，它们是Python面向对象下智慧的结晶。初学者掌握Python的魔法方法也就变得尤为重要了。

为什么要使用Python魔法方法?

使用Python的魔法方法可以使Python的自由度变得更高，当不需要重写时魔法方法也可以在规定的默认情况下生效，在需要重写时也可以让使用者根据自己的需求来重写部分方法来达到自己的期待。而且众所周知Python是支持面向对象的语言Python的基本魔法方法就使得Python在面对对象方面做得更好。

```python
基础魔法方法（较为常用）

__new__(cls[, ...]) 才是实例化对象调用的第一个方法，它只取下 cls 参数，并把其他参数传给 __init__。 __new__很少使用，但是也有它适合的场景(单例模式)，尤其是当类继承自一个像元组或者字符串这样不经常改变的类型的时候。

__init__(self[, ...])构造方法，初始化类的时候被调用

__del__(self)析构方法，当实例化对象被彻底销毁时被调用（实例化对象的所有指针都被销毁时被调用）

__call__(self[, args...])允许一个类的实例像函数一样被调用：x(a, b) 调用 x.__call__(a, b)

__len__(self)定义当被 len() 调用时的行为__repr__(self)定义当被 repr() 调用时的行为

__str__(self)定义当被 str() 调用时的行为__bytes__(self)定义当被 bytes() 调用时的行为

__hash__(self)定义当被 hash() 调用时的行为

__bool__(self)定义当被 bool() 调用时的行为，应该返回 True 或 False

__format__(self, format_spec)定义当被 format() 调用时的行为



属性相关的方法

__getattr__(self, name)定义当用户试图获取一个不存在的属性时的行为

__getattribute__(self, name)定义当该类的属性被访问时的行为

__setattr__(self, name, value)定义当一个属性被设置时的行为

__delattr__(self, name)定义当一个属性被删除时的行为

__dir__(self)定义当 dir() 被调用时的行为

__get__(self, instance, owner)定义当描述符的值被取得时的行为

__set__(self, instance, value)定义当描述符的值被改变时的行为

__delete__(self, instance)定义当描述符的值被删除时的行为



比较操作符

__lt__(self, other)定义小于号的行为：x < y 调用 x.__lt__(y)

__le__(self, other)定义小于等于号的行为：x <= y 调用 x.__le__(y)

__eq__(self, other)定义等于号的行为：x == y 调用 x.__eq__(y)

__ne__(self, other)定义不等号的行为：x != y 调用 x.__ne__(y)

__gt__(self, other)定义大于号的行为：x > y 调用 x.__gt__(y)

__ge__(self, other)定义大于等于号的行为：x >= y 调用 x.__ge__(y)



类型转换

__complex__(self)定义当被 complex() 调用时的行为（需要返回恰当的值）

__int__(self)定义当被 int() 调用时的行为（需要返回恰当的值）

__float__(self)定义当被 float() 调用时的行为（需要返回恰当的值）__round__(self[, n])定义当被 round() 调用时的行为（需要返回恰当的值）



容器类型（一般用于操作容器类）

__len__(self)定义当被 len() 调用时的行为（一般返回容器类的长度）

__getitem__(self, key)定义获取容器中指定元素的行为，相当于 self[key]

__setitem__(self, key, value)定义设置容器中指定元素的行为，相当于 self[key] = value

__delitem__(self, key)定义删除容器中指定元素的行为，相当于 del self[key]

__iter__(self)定义当迭代容器中的元素的行为

__reversed__(self)定义当被 reversed() 调用时的行为

__contains__(self, item)定义当使用成员测试运算符（in 或 not in）时的行为
```



## 1.7. 参考资料
[^1]:理解 Python 装饰器看这一篇就够了
https://foofish.net/python-decorator.html