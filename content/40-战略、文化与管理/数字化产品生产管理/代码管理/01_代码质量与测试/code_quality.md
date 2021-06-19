---
title: "代码质量及工程化"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 高质量的代码
## 1.1. 原则与境界

见字如面，一看就懂

## 1.2. 代码规范性
### 1.2.1. 变量/函数命名格式规范
* Java
驼峰命名：多个单词组成一个名称时，第一个单词全部小写，后面单词首字母大写；如：
```Java
public void setUserName(String userName)
```
* C/C++/C#
帕斯卡命名：多个单词组成一个名称时，每个单词的首字母大写；

```c++
public void SetUserName(String userName)
```
* python
类 首字符大写其他全部小写
```python
class Car(object):
    def __init(self):
        return 
    def run(self)
```



### 1.2.2. 变量/函数命名语义明确

名词合理、动词到位
#### 1.2.2.1. 动词到位
一些比较有表达力的单词：

| 单词  | 可替代单词                                         |
| :---: | -------------------------------------------------- |
| send  | deliver、dispatch、announce、distribute、route     |
| find  | search、extract、locate、recover                   |
| start | launch、create、begin、open                        |
| make  | create、set up、build、generate、compose、add、new |

| 类别                          | 单词                                           |
| ----------------------------- | ---------------------------------------------- |
| 添加/插入/创建/初始化/加载    | add、append、insert、create、initialize、load  |
| 删除/销毁                     | delete、remove、destroy、drop                  |
| 打开/开始/启动                | open、start                                    |
| 关闭/停止                     | close、stop                                    |
| 获取/读取/查找/查询           | get、fetch、acquire、read、search、find、query |
| 设置/重置/放入/写入/释放/刷新 | set、reset、put、write、release、refresh       |
| 发送/推送                     | send、push                                     |
| 接收/拉取                     | receive、pull                                  |
| 提交/撤销/取消                | submit、cancel                                 |
| 收集/采集/选取/选择           | collect、pick、select                          |
| 提取/解析                     | sub、extract、parse                            |
| 编码/解码                     | encode、decode                                 |
| 填充/打包/压缩                | fill、pack、compress                           |
| 清空/拆包/解压                | flush、clear、unpack、decompress               |
| 增加/减少                     | increase、decrease、reduce                     |
| 分隔/拼接                     | split、join、concat                            |
| 过滤/校验/检测                | filter、valid、check                           |


布尔相关的命名加上 is、can、should、has 等前缀。

| 单词   | 含义 |
| ------ | ---- |
| is     | 是   |
| can    | 可以 |
| should | 应该 |
| has    | 用   |


##### 1.2.2.1.1. tips
多查询条件的函数名字谨慎使用介词by
我们平时在写查询接口时，假如有多个查询参数怎么办？每个通过by一起连接依赖？No！这绝对不是明智的方式。假如一开始产品的需求是通过学生姓名查询学生信息，写出来的可能是这样的函数：
public List<Student> getByName(String name);
复制代码
然后突然又有一天产品提出了新的需求，希望同时可以通过姓名和电话号码来查询学生信息，那么函数可能变成这样了：
public List<Student> getByNameAndMobile(String name, String mobile);
复制代码
接着，没过多久，产品又希望根据学生年龄来查询学生信息，那么函数可能变成这样了：
public List<Student> getByNameAndMobileAndAge(String name, String mobile, int age);
复制代码
如果这样来给函数命名，那么你的噩梦大门即将打开。
通常比较好的做法是：
• 如果是通过主键id来查询，那么可以通过by来连接查询信息，比如：
public Student getByStudentId(long studentId);复制代码
• 如果是通过其他属性来查询，并且未来会存在多个组合查询的可能性，建议进行封装，比如：
public List<Student> getStudents(StudentSearchParam searchParam);
复制代码
最后，建议大家平时在写代码过程中，不要怕在函数命名上耗费时间，一个好的函数命名在后期会大大减少你代码重构的成本，争取对函数命名做到"见字如面"

#### 1.2.2.2. 名词合理

使用 i、j、k 作为循环迭代器的名字过于简单，user_i、member_i 这种名字会更有表达力。因为循环层次越多，代码越难理解，有表达力的迭代器名字可读性会更高。

为名字添加形容词等信息能让名字更具有表达力，但是名字也会变长。名字长短的准则是：作用域越大，名字越长。因此只有在短作用域才能使用一些简单名字。


起完名字要思考一下别人会对这个名字有何解读，会不会误解了原本想表达的含义。

#### 1.2.2.3. 标记准确

- 用 min、max 表示数量范围；
- 用 first、last 表示访问空间的包含范围；
```python
a=[1,2,3,4,5]
a[0] # first =0
a[4] # last =4
```
- begin、end 表示访问空间的排除范围，即 end 不包含尾部。begin==first,end=last+1
```python
a=[1,2,3,4,5]
a[0] # begin =0
a[4] # end =5  
```




#### 1.2.2.4. 其他--为什么foo bar？
>1. 为什么国外程序员在编程中喜欢用 Foo bar 这个词？

foo是fu的变体，fu是英语习语fuck-up缩写，就是一团糟的意思。bar是beyond all recognition的缩写，超越所有认知，还是一团糟！

单词“foobar”或分离的“foo”与“bar”常出现于程序设计的案例中，如同Hello World程序一样，它们常被用于向学习者介绍某种程序语言。

“foo”“bar”常被作为函数／方法的名称或变量名。

### 1.2.3. 良好的可读性

#### 1.2.3.1. 注释

尽量简洁明了：

用 TODO 等做标记：

| 标记  | 用法                   |
| ----- | ---------------------- |
| TODO  | 待做                   |
| FIXME | 待修复                 |
| HACK  | 粗糙的解决方案         |
| XXX   | 危险！这里有重要的问题 |


#### 1.2.3.2. 一次只做一件事

只做一件事的代码很容易让人知道其要做的事；

基本流程：列出代码所做的所有任务；把每个任务拆分到不同的函数，或者不同的段落。

#### 1.2.3.3. 用自然语言表述代码

先用自然语言书写代码逻辑，也就是伪代码，然后再写代码，这样代码逻辑会更清晰。

#### 1.2.3.4. 减少代码量

不要过度设计，编码过程会有很多变化，过度设计的内容到最后往往是无用的。

多用标准库实现。


### 1.2.4. 文件名规范

1. 文档的文件名不得含有空格。

2. 文件名必须使用半角字符，不得使用全角字符。这也意味着，中文不能用于文件名。

        错误： 名词解释.md
        正确： glossary.md

3. 文件名建议只使用小写字母，不使用大写字母。

        错误：TroubleShooting.md
        正确：troubleshooting.md 

4. 为了醒目，某些说明文件的文件名，可以使用大写字母，比如README、LICENSE。


## 1.3. 代码完整性

### 1.3.1. 核心功能完整
### 1.3.2. 边界测试通过
1. 考虑边界问题
2. 循环、递归边界
3. 输入输出边界
### 1.3.3. 负面测试
1. 可能的错误输入
## 1.4. 代码鲁棒性
考虑负面输入
