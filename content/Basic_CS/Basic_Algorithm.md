---
title: "数据结构及算法思想的实现"
layout: page
date: 2099-06-02 00:00
---
# 数据结构及算法思想的实现
[TOC]

## 0. 算法评价

### 0.1. 时间消耗
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

### 0.2. 空间消耗
```
import sys
sys.getsizeof()
>>> 123 #betye
```

### 0.3. 时间复杂度/空间复杂度

> 大O法（Order）：$O(n)$

1. 空间复杂度(Space Complexity)
执行这个算法所需要的内存空间  $S(n)=···=O(n)$


2. 时间复杂度（Time Complexity）
时间复杂度是指执行算法所需要的计算工作量 $T(n)=···=O(n)$

#### 0.3.1 工具


## 1. 基础数据结构 

### 1.1 链表
非连续内存存储
类型：
#### 1.1.1 基本链表

```python 
# python
class ListNode(object):
    def __init__(self,value=None):
        self.data=value
        self.next=None
    # 获得数据
    def getData(self):
        return self.data
    # 获得下一个节点的引用
    def getNext(self):
        return self.next
    # 修改数据
    def setData(self, newdata):
        self.data = newdata
    # 修改下一节点的引用
    def setNext(self, newnext):
        self.next = newnext
```

```C++
struct ListNode
{
    double value;
    ListNode *next;
};

```
#### 1.1.2. 双向链表
#### 1.1.3. 循环链表

### 1.2 数组
连续内存存储

1. python

```python
import numpy as np

np.array(···，dtype=None,shape=[])
```

<p>

| 类型        | 说明                         |
| :---------- | :--------------------------- |
| numpy array | 内存中一个连续块             |
| list        | 每个元素其实是一个地址的引用 |

一个numpy array需要确定变量类型(int/float32)和大小，然后在 是内存中申请一个确定大小的连续块。

list完全不同，它的每个元素其实是一个地址的引用，这个地址又指向了另一个元素，这些元素的在内存里不一定是连续的。所以list其实是只能塞进地址的“数组”，而且由于地址不用连续，每当我想加入新元素，我只用把这个元素的地址添加进list
</p>


```python

list_1=["abc","defffff","ghiiiiiiiiiii"]
list_2=["abc","defffff"]
list_3=["abc"]
array_1=np.array(list_1)
array_2=np.array(list_2)
array_3=np.array(list_3)

print (sys.getsizeof(list_1)-sys.getsizeof(list_2)) #8 
print (sys.getsizeof(list_2)-sys.getsizeof(list_3)) #8
print (sys.getsizeof(list_3)) #72

print (sys.getsizeof(array_1)-sys.getsizeof(array_2)) #100
print (sys.getsizeof(array_2)-sys.getsizeof(array_3)) # 44
print (sys.getsizeof(array_3)) # 108

print(sys.getsizeof("abc")) #60
print (sys.getsizeof("defffff")) #72
print (sys.getsizeof("ghiiiiiiiiiii")) #90 
```
2. c++
```c++
// 1维数组

int array[100]; 　　//定义了数组array，并未对数组进行初始化
int array[100] = {1，2}；　　//定义并初始化了数组array

int* array = new int[100];  
delete []array;　　//分配了长度为100的数组array 

int* array = new int[100](1，2); 　
delete []array;　//为长度为100的数组array初始化前两个元素

//2 维数组

int array[10][10];　　//定义了数组，并未初始化
int array[10][10] = { {1,1} , {2,2} };　　//数组初始化了array[0][0,1]及array[1][0,1]

int (*array)[n] = new int[m][n];
delete []array;

int** array = new int*[m];　
for(i) array[i] = new int[n];  
for(i) delete []array[i]; 
delete []array;    //多次析构
int* array = new int[m][n];  
delete []array;      //数组按行存储

//多维数组
int* array = new int[m][3][4];    //只有第一维可以是变量，其他维数必须是常量，否则会报错
delete []array;       //必须进行内存释放，否则内存将泄漏
```


### 1.3 栈

LIFO队列,Last in First Out,后进先出

```python
class Stack(object):
    def __init__(self):
        self.stack=[]
    def isEmpty(self):
        return self.stack==[]
    def push(self,item):
        self.stack.append(item)
    def pop(self):
        if self.isEmpty():
            raise IndexError,'pop from empty stack'
        return self.stack.pop()
    def peek(self):
        return self.stack[-1]
    def size(self):
        return len(self.stack)

# 内置
from queue import LifoQueue #LIFO队列,Last in First Out,后进先出
lifoQueue = LifoQueue()
lifoQueue.put(1)
lifoQueue.put(2)
lifoQueue.put(3)
print('LIFO队列',lifoQueue.queue)
lifoQueue.get() #返回并删除队列尾部元素
lifoQueue.get()
print(lifoQueue.queue)

```
### 1.4 队列

Last in Last Out,后进后出
```python
class Queue(object):
    def __init__(self):
        self.queue=[]
    def isEmpty(self):
        return self.queue==[]
    def enqueue(self,x):
        self.queue.append(x)
    def dequeue(self):
        if self.queue:
            a=self.queue[0]
            self.queue.remove(a)
            return a
        else:
            raise IndexError,'queue is empty'
    def size(self):
        return len(self.queue)

# 内置
from queue import Queue #LILO队列 Last in Last Out,后进后出
q = Queue() #创建队列对象
q.put(0)    #在队列尾部插入元素
q.put(1)
q.put(2)
print('LILO队列',q.queue)  #查看队列中的所有元素
print(q.get())  #返回并删除队列头部元素
print(q.queue)

from queue import PriorityQueue #优先队列
priorityQueue = PriorityQueue() #创建优先队列对象
priorityQueue.put(3)    #插入元素
priorityQueue.put(78)   #插入元素
priorityQueue.put(100)  #插入元素
print(priorityQueue.queue)  #查看优先级队列中的所有元素
priorityQueue.put(1)    #插入元素
priorityQueue.put(2)    #插入元素
print('优先级队列:',priorityQueue.queue)  #查看优先级队列中的所有元素
priorityQueue.get() #返回并删除优先级最低的元素
print('删除后剩余元素',priorityQueue.queue)
priorityQueue.get() #返回并删除优先级最低的元素
print('删除后剩余元素',priorityQueue.queue)  #删除后剩余元素
priorityQueue.get() #返回并删除优先级最低的元素
print('删除后剩余元素',priorityQueue.queue)  #删除后剩余元素
priorityQueue.get() #返回并删除优先级最低的元素
print('删除后剩余元素',priorityQueue.queue)  #删除后剩余元素
priorityQueue.get() #返回并删除优先级最低的元素
print('全部被删除后:',priorityQueue.queue)  #查看优先级队列中的所有元素

from collections import deque   #双端队列
dequeQueue = deque(['Eric','John','Smith'])
print(dequeQueue)
dequeQueue.append('Tom')    #在右侧插入新元素
dequeQueue.appendleft('Terry')  #在左侧插入新元素
print(dequeQueue)
dequeQueue.rotate(2)    #循环右移2次
print('循环右移2次后的队列',dequeQueue)
dequeQueue.popleft()    #返回并删除队列最左端元素
print('删除最左端元素后的队列：',dequeQueue)
dequeQueue.pop()    #返回并删除队列最右端元素
print('删除最右端元素后的队列：',dequeQueue)
```

### 1.5 哈希表
哈希表，一种key-value形式的数据结构
构建哈希表的关键在于运用`1.哈希函数及相应的数学运算` 和`2. 冲突管理机制`构建`哈希表地址 `
**关键点：**
1. 哈希函数
2. 冲突处理`

```
    address_in_table=hash(key)mod(n)
    if address_in_table 相同:
        依据冲突处理规则处理
```

#### 1. 哈希（散列/摘要）函数
功能：将给定数据转换成为固定长度的无规律数值
特性:
1. 函数输出的长度相同
2. 相同输入数据的输出相同
3. 不同数据输出大概率不同
4. 不同输入的输出也有可能相同（概率低），若发生则成为`哈希冲突`
5. 不可逆，不可以通过输出反推出输入值
6. 正向计算较为容易


| 类型 | 描述                                                                                                                                                                                         |
| ---: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  md4 | MD4(RFC 1320）是 MIT 的Ronald L. Rivest在 1990 年设计的，MD 是 Message Digest 的缩写。它适用在32位字长的处理器上用高速软件实现--它是基于 32位操作数的位操作来实现的。                        |
|  md5 | MD5(RFC 1321）是 Rivest 于1991年对MD4的改进版本。它对输入仍以512位分组，其输出是4个32位字的级联，与 MD4 相同。MD5比MD4来得复杂，并且速度较之要慢一点，但更安全，在抗分析和抗差分方面表现更好 |
| sha1 | SHA1是由NIST NSA设计为同DSA一起使用的，它对长度小于2^64位的输入，产生长度为160bit的散列值，因此抗穷举（brute-force）性更好。SHA-1 设计时基于和MD4相同原理，并且模仿了该算法。                |
| sha2 | 较常使用                                                                                                                                                                                     |



```python
import hashlib

md5 = hashlib.md5()
md5.update('how to use md5 in python hashlib?'.encode('utf-8'))
print(md5.hexdigest())

>>> d26a53750bc40b38b65a520292f69306
```
哈希表地址的
 (1) 除法散列法

 哈希表的大小为m行,通过取哈希值hash_num除以m的余数，将关键字映射到m个槽中去，即
 
`hash_num=hash(key)`
$$address\_in\_table= mod(hash\_num,m)$$

其中m的取值很重要，这个函数得出的散列地址值不会超过m，同时可以选作p的值常常是与2的整数幂不太接近的质数。当存放位置m较大时，p不宜过小。

(2)乘法散列法

$$h(hash\_ num)=[p*(hash\_num*A-(int)hash\_num*A)]$$

用hash_num乘以常数A,并且抽出kA的小数部分，然后用m乘以这个值，再取底floor.

其中0<A<1,一般取，$(\sqrt5-1)/2$，m没有太多限制，一般取2的整数次幂

(3)全域散列

#### 2. 冲突处理

##### 2.1 开放寻址法


##### 2.2 链地址法
把散列到同一个槽中的所有元素都放在一个链表中。相对于开放地址法，可能会增加存储空间。

##### 2.3 建立一个公共溢出区

若发生冲突，把key存入公共溢出区。

#### 3. 实现

在Python中，dict的底层是依靠哈希表(Hash Table)进行实现的，使用开放地址法解决冲突。所以其查找的时间复杂度会是O(1)

```python
# python dict 
dict={key:value}
```


```c++

#include <iostream> 
#include <vector> 
#include <unordered_map>
using namespace std; 
 
class Myclass { 
    public: int first; 
    vector<int> second; // 重载等号，判断两个Myclass类型的变量是否相等 
    bool operator== (const Myclass &other) const { 
        return first == other.first && second == other.second; } }; // 实现Myclass类的hash函数 
    
    namespace std { 
        template <> struct hash<Myclass> { 
            size_t operator()(const Myclass &k) const 
            {   int h = k.first;
                for (auto x : k.second) { 
                    h ^= x;
                    } 
                return h;
                } 
        }; 
    } 

int main()
{ 
    unordered_map<Myclass, double> S; 
    Myclass a = { 2, {3, 4} }; 
    Myclass b = { 3, {1, 2, 3, 4} };
    S[a] = 2.5; 
    S[b] = 3.123; 
    cout << S[a] << ' ' << S[b] << endl; 
    return 0;
 }
```

```python
class LinearMap(object):
    def __init__(self):
         self.items = []
    # 往表中添加元素    
    def add(self, k, v):  
        self.items.append((k,v))

    # 线性方式查找元素
    def get(self, k): 
        for key, value in self.items:      
            if key == k:      # 键存在，返回值，否则抛出异常
                return value
        raise KeyError
```

### 1.7 树 


#### 1.7.1 二叉树
```python
class BinaryTree:
    def __init__(self,rootObj):
        self.key = rootObj
        self.leftChild = None
        self.rightChild = None
 
    def insertLeft(self,newNode):
        if self.leftChild == None:
            self.leftChild = BinaryTree(newNode)
        else:
            t = BinaryTree(newNode)
            t.leftChild = self.leftChild
            self.leftChild = t
 
    def insertRight(self,newNode):
        if self.rightChild == None:
            self.rightChild = BinaryTree(newNode)
        else:
            t = BinaryTree(newNode)
            t.rightChild = self.rightChild
            self.rightChild = t
    def getRightChild(self):
        return self.rightChild
 
    def getLeftChild(self):
        return self.leftChild
 
    def setRootVal(self,obj):
        self.key = obj
 
    def getRootVal(self):
        return self.key

```
##### 1.7.1.1 二叉查找树

```python
class BinarySearchTree(object):
    def __init__(self,key):
        self.key=key
        self.leftChild=None
        self.rightChild=None

    def search(self, node, parent, data):
        if node is None:
            return False, node, parent
        if node.data == data:
            return True, node, parent
        if node.data > data:
            return self.search(node.leftChild, node, data)
        else:
            return self.search(node.rightChild, node, data)
        # 插入
    def insert(self, data):
        flag, n, p = self.search(self.root, self.root, data)
        if not flag:
            new_node = BinarySearchTree(data)
        if data > p.data:
            p.leftChild = new_node
        else:
            p.rightChild = new_node
```


##### 1.7.1.2 堆 

堆(heap)又被为优先队列(priority queue)

```python
import heapq 
heap = []            # creates an empty heap
heappush(heap, item) # pushes a new item on the heap
item = heappop(heap) # pops the smallest item from the heap
item = heap[0]       # smallest item on the heap without popping it
heapify(list_x)           # transforms list into a heap, in-place, in linear time
item = heapreplace(heap, item) # 返回最小值，同时将新item加入堆中，堆的大小不变
```




## 2.基础算法思想 

### 1. 枚举/遍历
#### 1.1 枚举的基本思想

枚举是基于已有知识进行答案猜测的一种问题求解策略。

枚举从可能的集合中一一列举各元素， 对问题可能解集合的每一项，根据问题给定的检验条件判定哪些是成立的，使条件成立的即是问题的解。

#### 1.2 枚举过程

- 判断猜测的答案是否正确
- 进行新的猜测: 有两个关键因素要注意
  - 猜测的结果必须是前面的猜测中没有出现过的. 
  - 猜测的过程中要及早排除错误的答案. 

#### 1.3 枚举中的三个关键问题

1. 给出解空间

- 给出解空间，建立简洁的数学模型 
- 模型中变量数尽可能少, 它们之间相互独立 

2. 减少搜索空间

- 利用知识缩小模型中各变量的取值范围, 避免不必要的计算 
- 减少代码中循环体执行次数

3. 合适的搜索顺序
- 搜索空间的遍历顺序要与模型中条件表达式一致 



```c++
D={}
while (没有找到正确答案)：
    正确答案=Di?
    i+=1
```

### 2. 递归
分治法就是把1个分为多个,递归法就是把多个归一的解决问题方法。
层次结构
分治策略--拆解成小问题
判断停止条件


#### 2.1 递归的基本思想

递归 — 某个函数直接或间接的调用自身

问题的求解过程

- 划分成许多相同性质的子问题的求解
- 而小问题的求解过程可以很容易的求出

这些子问题的解就构成里原问题的解

#### 2.2  递归与枚举

枚举把一个问题划分成一组子问题，依次对这些子问题求解

- 子问题之间是横向的，同类的关系

把一个问题逐级分解成子问题

- 子问题与原问题之间是纵向的, 同类的关系
- 语法形式上: 在一个函数的运行过程中, 调用这个函数自己
  - 直接调用: 在`fun()`中直接执行`fun()`
  - 间接调用: 在`fun1()`中执行`fun2()`; 在`fun2()`中又执行`fun1()`

#### 2.3 三个要点

- 递归式
  - 如何将原问题划分成子问题
- 递归出口
  - 递归终止的条件, 即最小子问题的求解,可以允许多个出口
- 界函数
  - 问题规模变化的函数, 它保证递归的规模向出口条件靠拢

#### 2.4 关键--递推公式\递归中止条件
- 找出递推公式
- 找到递归终止条件

注意事项: 由于函数的局部变量是存在栈上的，如果有体积大的局部变量（比如数组）而递归层次可能很深的情况下，也许会导致栈溢出。可以考虑使用全局数组或动态分配数组。


```c++
function (n){
    return function (n-1) ;
}
```

### 3. 动态规划
#### 3.1 动态规划的基本思想
* 避免重复计算 
* 存储


```c++

int* product =new product[3]
product[1]=~~

function (n){

    return function (n-1) ;
}
```


#### 3.2 动规解题的一般思路：

1. 将原问题分解为子问题 
* 把原问题分解为若干个子问题，子问题和原问题形式相同 或类似，只不过规模变小了。子问题都解决，原问题即解决。 
* 子问题的解一旦求出就会被保存，所以每个子问题只需求解一次

2. 确定状态 

`状态`：在用动态规划解题时，我们往往将和子问题相关的各个变量的一组取值，称之为一个`状态`。
`状态的值`:就是这个`状态`所对应的子问题的解

`状态空间`所有`状态`的集合，构成问题的`状态空间`

`状态空间的大小`，与用动态规划解决问题的时间复杂度直接相关。
>在数字三角形的例子里，一共有N×(N+1)/2个数字，所以这个 问题的状态空间里一共就有N×(N+1)/2个状态。 

`整个问题的时间复杂度`是状态数目乘以计算每个状态所需时间。
>在数字三角形里每个“状态”只需要经过一次，且在每个 状态上作计算所花的时间都是和N无关的常数。 



3. 确定一些初始状态（边界状态）的值 
 
    以“数字三角形”为例，初始状态就是底边数字，值 就是底边数字值。 

4. 确定状态转移方程 
 
    定义出什么是“状态”，以及在该 “状态”下的“值”后，就要 找出不同的状态之间如何迁移――即如何从一个或多个“值”已知的 “状态”，求出另一个“状态”的“值”(“人人为我”递推型)。状 态的迁移可以用递推公式表示，此递推公式也可被称作“状态转移方 程”。       数字三角形的状态转移方程: 


可用用动态规矩解决的问题特点 
 1) 问题具有最优子结构性质。如果问题的最优解所包含的 子问题的解也是最优的，我们就称该问题具有最优子结 构性质。
 2)  无后效性。当前的若干个状态值一旦确定，则此后过程的演变就只和这若干个状态的值有关，和之前是采取哪 种手段或经过哪条路径演变到当前的这若干个状态，没 有关系。 

![avatar](https://user-gold-cdn.xitu.io/2018/12/26/167e8d9d047ce29b?imageslim)




### 4. 深度优先搜索

#### 4.1 dfs

**说明:**
此时所在的顶点 node
候选节点 candidate_node_stack
选择的节点 node_i



```c++
Dfs(node) {
    //可行性减支
    if(node 访问过)
        return ;  
    将node标记为访问过;
    node相邻的点加入到candidate_node_stack 总
    从candidate_node_stack里面确定下一个点node_i:  
    Dfs(node_i);
    }

int main() {
    while(在图中能找到未访问过的点k) {
         Dfs(k);
    } 
         }
```


```python

class Graph(object):
  def __init__(self,*args,**kwargs):
    self.node_neighbors = {}
    self.visited = {}
  def add_nodes(self,nodelist):
    for node in nodelist:
      self.add_node(node)
  def add_node(self,node):
    if not node in self.nodes():
      self.node_neighbors[node] = []
  def add_edge(self,edge):
    u,v = edge
    if(v not in self.node_neighbors[u]) and ( u not in self.node_neighbors[v]):
      self.node_neighbors[u].append(v)
      if(u!=v):
        self.node_neighbors[v].append(u)
  def nodes(self):
    return self.node_neighbors.keys()
  def depth_first_search(self,root=None):
    order = []
    def dfs(node):
      self.visited[node] = True
      order.append(node)
      for n in self.node_neighbors[node]:
        if not n in self.visited:
          dfs(n)
    if root:
      dfs(root)
    for node in self.nodes():
      if not node in self.visited:
        dfs(node)
    print order
    return order
  def breadth_first_search(self,root=None):
    queue = []
    order = []
    def bfs():
      while len(queue)> 0:
        node = queue.pop(0)
        self.visited[node] = True
        for n in self.node_neighbors[node]:
          if (not n in self.visited) and (not n in queue):
            queue.append(n)
            order.append(n)
    if root:
      queue.append(root)
      order.append(root)
      bfs()
    for node in self.nodes():
      if not node in self.visited:
        queue.append(node)
        order.append(node)
        bfs()
    print order
    return order
```




#### 4.2  剪枝
剪枝：把不会产生答案的，或不必要的枝条“剪掉”。

即在设计剪枝判断方法的基础上，避免一些不必要的遍历过程，从而提高算法效率。

##### 4.2.1 剪枝的关键
剪枝的关键就在于剪枝的判断：**什么枝该剪，什么枝不该剪，在什么地方减**。
##### 4.2.2 剪枝的原则

正确性，准确性，高效性。
##### 4.2.3 常用的剪枝
###### 4.2.3.1. 可行性剪枝

>如果当前条件不合法就不再继续搜索，直接return。这是非常好理解的剪枝。一般的搜索都会加上。

一般格式：
```c++
dfs(int x)
{
    if(x>n)return;
    if(!check1(x))return;
    ....
    return;
}
```

###### 4.2.3.2. 最优性剪枝


>如果当前条件所创造出的答案必定比之前的答案大，那么剩下的搜索就毫无必要，甚至可以剪掉。
我们利用某个函数估计出此时条件下答案的‘下界’，将它与已经推出的答案相比，如果不比当前答案小，就可以剪掉。

一般格式：
```c++
long long ans=987474477434487ll;
dfs(int x,...)
{
    if(x... && ...)
    {
        ans=....;
        return ...;
    }
    //最优性剪枝 
    if(check2(x)>=ans)
    {
        return ...;
    }
    for(int i=1;...;++i)
        {
            vis[...]=1; 
            dfs(...);
            vis[...]=0;
        }
}
```

一般实现：
在搜索取和最大值时，如果后面的全部取最大仍然不比当前答案大就可以返回。
在搜和最小时同理，可以预处理后缀最大/最小和进行快速查询。

###### 4.2.3.3. 记忆化搜索

记忆化搜索其实很像动态规划（DP）。

它的关键是：如果对于相同情况下必定答案相同，就可以把这个情况的答案值存储下来，以后再次搜索到这种情况时就可以直接调用。

还有就是不能搜出环来，不能互相依赖。

一般格式：
```c++
long long ans=987474477434487ll;
dfs(int x,...)
{
    if(x... && ...)
    {
        ans=....;
        return ...;
    }
    if(vis[x]!=0)
        return f[x];
        vis[x]=1;
    for(int i=1;...;++i)
        {
            vis[...]=1;
            dfs(...);
            vis[...]=0;
            f[x]=...;
        }
}
```
###### 4.2.3.4. 搜索顺序剪枝

在一些迷宫题，网格题，或者其他搜索中可以贪心的题，搜索顺序显得十分重要,好的顺序可以提高算法效率。

1. 在迷宫、网格类的题目中，右下左上就明显比左上右下优秀。
2. 推断搜索题中，从已知信息最多的地方开始搜索显然更加优秀。
3. 在一些题中，先搜某个值大的，再搜某个值小的(比如树的度数，产生答案的预计(A*))，速度明显会比乱搜更快。





 

### 5. 广度优先搜索

#### 5.1 核心思想 
广索的基本方法是**使用队列存放已经扩展过的节点**

适用问题:最短路径算法


此时所在的顶点 node
候选节点 candidate_node_queue
选择的节点 node_i
```C++
BFS(){
        初始化队列
        while（队列不为空且未找到目标节点） 
        {
            取队首节点扩展，并将扩展出的非重复节点放入队尾 ；
            必要时记住每个节点的父节点；
        }
}
```

### 6. 二分

二分法是在**有序或单调的区间**中快速寻找答案的有效方法，当数据量很大适宜采用该方法。
时间复杂度 O(logN)

### 7. 贪心
贪心（greedy algorithm）
过程：

    1. 建立数学模型来描述问题；
    2. 把求解的问题分成若干个子问题；
    3. 对每一子问题求解，得到子问题的局部最优解；
    4. 把子问题的解局部最优解合成原来解问题的一个解。


所谓贪心算法，即总是作出在当前看来最好的选择。也就是说贪心算法并不从整体最优考虑，它所作出的选择只是在某种意义上的局部最优选择。但是，贪心算法对很多问题都能得到整体最优解。在一些情况下，即使贪心算法不能得到整体最优解，其最终结果却是最优解的很好近似。贪心算法没有固定的算法框架，算法设计的关键是贪心策略的选择。



## 3.基于问题的划分 

### 3.1 排序 


|          |              |       复杂度 |
| -------: | -----------: | -----------: |
| 插入排序 | 直接插入排序 |     $O(n^2)$ |
| 插入排序 |     希尔排序 | $O(n\log n)$ |
| 选择排序 | 简单选择排序 |     $O(n^2)$ |
| 选择排序 |       堆排序 | $O(n\log n)$ |
| 交换排序 |     冒泡排序 |     $O(n^2)$ |
| 交换排序 |     快速排序 | $O(n\log n)$ |
| 归并排序 |     归并排序 | $O(n\log n)$ |
* 记忆： 涉及二分/树 问题为 $O(nlogn)$
#### 3.1.1. 插入排序
#####  直接插入排序
```python
##  插入排序
### 打牌 拿牌的时候排序
def insert_sort(raw_list):
    # raw_list:[2,5,3,5 ]
    # sorted_list:[2,5]
    for flag_index in range(1,len(raw_list)):
        insert_value = raw_list[flag_index]
        insert_index=flag_index
        # insert_value:3
        if insert_value < raw_list[flag_index-1]:
            # if 3 < 5
            for j in range(insert_index-1,-1,-1):  # 对于  sorted_list
                if raw_list[j] > insert_value :
                    # if 5>3
                    raw_list[j+1] = raw_list[j]
                    # 
                    insert_index = j   #记录待插入下标
                else :
                    break
            raw_list[insert_index] = insert_value
        print ("flag_index {} 的 {}:{}".format(flag_index,raw_list[flag_index],raw_list))
    return raw_list

myList = [49,38,65,97,76,13,27,49]
insert_sort(myList)
print(myList)


flag_index 1 的 49:[38, 49, 65, 97, 76, 13, 27, 49]
flag_index 2 的 65:[38, 49, 65, 97, 76, 13, 27, 49]
flag_index 3 的 97:[38, 49, 65, 97, 76, 13, 27, 49]
flag_index 4 的 97:[38, 49, 65, 76, 97, 13, 27, 49]
flag_index 5 的 97:[13, 38, 49, 65, 76, 97, 27, 49]
flag_index 6 的 97:[13, 27, 38, 49, 65, 76, 97, 49]
flag_index 7 的 97:[13, 27, 38, 49, 49, 65, 76, 97]
```
##### 希尔排序

```python

#!/usr/bin/env python
# -*- coding: utf-8 -*-
#插入排序，缩小增量
def shell_sort(raw_list):
    gap = len_of_list = len(raw_list)
    result_list=[]
    while(gap > 1):
        gap = gap/2
        for i in range(0, len_of_list):
            for j in range(i, len_of_list - gap, gap):
                if result_list[j] > result_list[j+gap]:
                    result_list[j], result_list[j+gap] = result_list[j+gap], result_list[j]
    return result_list
```

#### 3.1.2 选择排序
#####  简单选择排序
```python

## 1.1 选择排序
### 先选第一个，确定第一个最小，再确定第二个 
def select_sort(raw_list):
    sorted_list=raw_list
    len_of_list=len(raw_list)
    for i in range(0, len_of_list- 1):
        selected_index = i
        for j in range(i + 1, len_of_list):
            if sorted_list[selected_index] > sorted_list[j]:
                selected_index = j
            sorted_list[i], sorted_list[selected_index] = sorted_list[selected_index], sorted_list[i]
        print ("选择 {}:{}".format(raw_list[i],sorted_list))
    return sorted_list
s = [3, 4, 1, 6, 2, 9, 7, 0, 8, 5]
select_sort(s)

选择 0:[0, 4, 3, 6, 2, 9, 7, 1, 8, 5]
选择 1:[0, 1, 3, 6, 4, 9, 7, 2, 8, 5]
选择 2:[0, 1, 2, 6, 4, 9, 7, 3, 8, 5]
选择 3:[0, 1, 2, 3, 6, 9, 7, 4, 8, 5]
选择 4:[0, 1, 2, 3, 4, 9, 7, 6, 8, 5]
选择 5:[0, 1, 2, 3, 4, 5, 9, 6, 8, 7]
选择 6:[0, 1, 2, 3, 4, 5, 6, 9, 8, 7]
选择 7:[0, 1, 2, 3, 4, 5, 6, 7, 9, 8]
选择 8:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

```
##### 堆排序



```python

def heap_adjust(L, start, end):
    temp = L[start]

    i = start
    j = 2 * i

    while j <= end:
        if (j < end) and (L[j] < L[j + 1]):
            j += 1
        if temp < L[j]:
            L[i] = L[j]
            i = j
            j = 2 * i
        else:
            break
    L[i] = temp

def heap_sort(raw_list):
    len_of_list = len(raw_list)

    first_sort_count = (len_of_list-1) / 2
    for i in range(first_sort_count):
        heap_adjust(L, first_sort_count - i, len_of_list)

    for i in range(len_of_list - 1):
        L = swap_param(L, 1, len_of_list - i)
        heap_adjust(L, 1, len_of_list - i - 1)

    return [L[i] for i in range(1, len(L))]
```

#### 3.1.3. 交换排序
#####  冒泡排序

```python
## 1.3 交换排序
def bubble_sort(raw_list):
    """冒泡排序 相邻交换, 进行第几轮 最后面的第几个数值确定"""
    print (raw_list)
    for i in range(len(raw_list)-1):    # 这个循环负责设置冒泡排序进行的次数
        print ("交换前{}个数字 ".format(len(raw_list)-i-1))
        for j in range(len(raw_list)-i-1):  # ｊ为列表下标
            if raw_list[j] > raw_list[j+1]:
                raw_list[j], raw_list[j+1] = raw_list[j+1], raw_list[j]
                print ("{}   {}<->{} :{}".format(j,raw_list[j], raw_list[j+1],raw_list))
            else:
                print ("{}   {} --{}: FALSE".format(j,raw_list[j] ,raw_list[j+1]))
    return raw_list

nums = [5,2,4,6,8,2,1]
bubble_sort(nums)

[5, 2, 4, 6, 8, 2, 1]
交换前6个数字 
0   2<->5 :[2, 5, 4, 6, 8, 2, 1]
1   4<->5 :[2, 4, 5, 6, 8, 2, 1]
2   5 --6: FALSE
3   6 --8: FALSE
4   2<->8 :[2, 4, 5, 6, 2, 8, 1]
5   1<->8 :[2, 4, 5, 6, 2, 1, 8]
交换前5个数字 
0   2 --4: FALSE
1   4 --5: FALSE
2   5 --6: FALSE
3   2<->6 :[2, 4, 5, 2, 6, 1, 8]
4   1<->6 :[2, 4, 5, 2, 1, 6, 8]
交换前4个数字 
0   2 --4: FALSE
1   4 --5: FALSE
2   2<->5 :[2, 4, 2, 5, 1, 6, 8]
3   1<->5 :[2, 4, 2, 1, 5, 6, 8]
交换前3个数字 
0   2 --4: FALSE
1   2<->4 :[2, 2, 4, 1, 5, 6, 8]
2   1<->4 :[2, 2, 1, 4, 5, 6, 8]
交换前2个数字 
0   2 --2: FALSE
1   1<->2 :[2, 1, 2, 4, 5, 6, 8]
交换前1个数字 
0   1<->2 :[1, 2, 2, 4, 5, 6, 8]

```

##### 快速排序

```python
# 快速排序
## 1.取基准值
## 2. 确保基准值 左<右
def quick_sort(raw_list):
    """快速排序""" 
    if len(raw_list) >= 2:  # 递归入口及出口
        pivot = raw_list[len(raw_list)//2]  # 选取基准值，也可以选取第一个或最后一个元素      
        left, right = [], []  # 定义基准值左右两侧的列表
        raw_list.remove(pivot)  # 从原始数组中移除基准值
        for num in raw_list:
            if num >= pivot:
                right.append(num)
            else:
                left.append(num)
        sorted_list=quick_sort(left) + [pivot] + quick_sort(right)    
    else:
        sorted_list=raw_list
    return sorted_list
# 示例：
array = [2,3,5,7,1,4,6,15,5,2,7,9,12]
print(quick_sort(array))

[1, 2, 2, 3, 4, 5, 5, 6, 7, 7, 9, 12, 15]
```
#### 3.1.4 归并排序

```python


```



### 3.2 查找
####  3.2.1. 二分查找
针对已经排好序的数据结构，从中间开始查找，比较大小
时间复杂度O(logN)
####  3.2.2. 顺序查找
时间负责度O(n)
####  3.2.3 哈希表查找

时间复杂度 O(1)
####  3.2.4 二叉搜索树查找


### 3.3 图的搜索
####  3.3.1 树的遍历
##### 3.3.1.1 前序
##### 3.3.1.2 中序
##### 3.3.1.3 后序

####  3.3.2 广度优先搜索

#### 3.3.3 深度优先搜索

