---
title: "3. Spark DataFrame 与 Spark Dataset"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 基础概念
## 1.1. 什么是 DataFrames

DataFrame is a **new API** for Apache Spark. It is basically a **distributed**, **strongly-typed collection** of data. A DataFrame is equivalent to what a table is in a relational database, except for the fact that it has richer optimization options.


在Spark 中， DataFrame 是以RDD 为基础的 **分布式**数据集。类似传统数据库里面的二维数据表

```
DataFrame（表）= Schema（表结构） + Data（表数据）

```


## 1.2. 什么是 Dataset
`Dataset`: 分布式的数据集合。

Dataset是在Spark 1.6中添加的一个新接口，是DataFrame之上更高一级的抽象。它提供了RDD的优点（强类型化）以及Spark SQL优化后的执行引擎的优点。一个Dataset 可以从JVM对象构造，然后使用函数转换（map， flatMap，filter等）去操作。 Dataset API 支持Scala和Java。 **Python（PySpark）不支持Dataset API**。


## 1.3. 比较RDD、DataFrames、Dataset

事实上 DataFrame 和 Dataset 是Catalyst由 RDD 构造的。


| 项目 | RDD                           | DataFrame                                                                                                                                                                                 | Dataset |
| ---- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 定义 | RDD是分布式的Java对象的集合。 | DataFrame 是分布式的Row对象的集合。                                                                                                                                                       |
| 组成 |                               | 带有Schema元数据，列名称                                                                                                                                                                  |
| 计算 |                               | DataFrame除了提供了比RDD更丰富的算子以外，更重要的特点是提升执行效率、减少数据读取以及执行计划的优化，比如filter下推、裁剪等。我们直接操作 RDD 时，會傾向重复声明（定义） RDD造成效率低下 |




### 适用场景

**RDD**
在需要更细致的控制时就退回去使用 RDD；


**DataFrame**
如果你需要丰富的语义、高级抽象和特定领域专用的 API，
如果你的处理需要对半结构化数据进行高级处理，如 filter、map、aggregation、average、sum、SQL 查询、列式访问或使用 lambda 函数
如果你想在不同的 Spark 库之间使用一致和简化的
如果你是 Python /R 语言使用者

**Dataset**
1. 如果你需要丰富的语义、高级抽象和特定领域专用的 API，
2. 如果你的处理需要对半结构化数据进行高级处理，如 filter、map、aggregation、average、sum、SQL 查询、列式访问或使用 lambda 函数
如果你想在编译时就有高度的类型安全，想要有类型的 JVM 对象，用上 Catalyst 优化，并得益于 Tungsten 生成的高效代码，那就使用Dataset；
如果你想在不同的 Spark 库之间使用一致和简化的 API



# 2. DataFrames 操作
参考 https://s3.amazonaws.com/assets.datacamp.com/blog_assets/PySpark_SQL_Cheat_Sheet_Python.pdf
## 2.1. 创建 DataFrames

1. 从现有RDD 创建
2. 从文件创建
3. 指定 schema 创建



### 2.1.1. 从内存创建

内存数据->RDD->DataFrame
```python
# 1. 从list创建
# list->pair_RDDs->DataFrame
person_list = [('AA', 18), ('PLM', 23)]
rdd = sc.parallelize(person_list)	

df = spark.createDataFrame(person_list) # 没有指定列名，默认为_1 _2
df = spark.createDataFrame(person_list, ['name', 'age']) # 指定了列名
df.collect() # df.show()
#[Row(name='AA', age=18), Row(name='PLM', age=23)]

# 2. 从RDD创建
rdd = sc.parallelize(person_list)
df = spark.createDataFrame(rdd, ['name', 'age'])

# 2.2 Row
from pyspark.sql import Row
Person = Row('name', 'age')					# 指定模板属性
persons = rdd.map(lambda r: Person(*r))		# 把每一行变成Person
df = spark.createDataFrame(persons)
df.collect()

# 2.3 指定类型StructType
from pyspark.sql.types import *
field_name = StructField('name', StringType(), True) # 名，类型，非空
field_age = StructField('age', IntegerType, True)
person_type = StructType([field_name, field_age])
# 通过链式add也可以
# person_type = StructType.add("name", StringType(), True).add(...)
df = spark.createDataFrame(rdd, person_type)

```

### 2.1.2. 从外部读取

#### 文件系统
```python
# 1. 指定文件格式 
# 每一行就是一个Row，默认的列名是Value
df = spark.read.json("python/test_support/sql/people.json")
df = spark.read.text("python/test_support/sql/text-test.txt")
df = spark.read.csv("python/test_support/sql/text-test.csv")
df = spark.read.parquet("python/test_support/sql/text-test.parquet")

df.collect()
# [Row(value=u'hello'), Row(value=u'this')]

#---[2]- load 数据源

# 3. load
# 从数据源中读取数据
df2 = spark.read.load("people.json", format="json")
df3 = spark.read.load("users.parquet")

## sql
df = spark.sql("SELECT * FROM customer").show()

df = spark.read.format("jdbc").options(url="jdbc:mysql://1.1.1.1:3306/test",driver="com.mysql.jdbc.Driver",dbtable="(SELECT * FROM yourtable) tmp",user="username",password="password").load()

df2 = sc.textFile("python/test_support/sql/people.json")
# df1.dtypes 和 df2.dtypes是一样的
```



## 2.2. 查看 Dataframe
```python
df.dtypes #Return df column names and data types
df.show() #Display the content of df
df.head() #Return first n rows
df.first() #Return first row
df.take(2) #Return the first n rows 
df.schema 
df.printSchema()
```

## 2.3. 查询 

### 2.3.1. 列选择

```python
from pyspark.sql import functions as F
## Select
df.select("firstName").show() # Show all entries in firstName column
df.select("firstName","lastName") .show()
df.select("firstName", "age", F.explode("phoneNumber").alias("contactInfo") ).select("contactInfo.type", "firstName", "age") .show()
```


```python
df.select(df["firstName"],df["age"]+ 1).show()
```
### 2.3.2. 行选择

```python
from pyspark.sql import functions as F

# 通用
## filter 
df.filter(df['age'] > 21).show()



# 数字条件
df.select(df['age'] > 24).show()
df.select(df.age.between(22, 24)).show()
df[df.age.between(22, 24)].show()

# 字符串条件
## Startswith - Endswith
df.select("firstName", df.lastName .startswith("Sm")).show()
df.select(df.lastName.endswith("th")).show()
## Substring
df.select(df.firstName.substr(1, 3).alias("name")).collect()
## isin
df[df.firstName.isin("Jane","Boris")].collect() 
## like
df.select("firstName", df.lastName.like("Smith")) .show()
```


## 2.4. 计算与排序

```python
# bool /replace
df.select("firstName", F.when(df.age > 30, 1).otherwise(0)).show() 
df.na.replace(10, 20).show()
df.na.fill(50).show()
df.na.drop().show()


df.groupBy("age").count().show()
df.sort(df.age.desc()).collect()
```
## 2.5. 增删改列

```python
# Rename Column
df = df.withColumnRenamed('median_income', 'my_median_income')

# 去重
df = df.dropDuplicates()  

# 删除
df = df.drop("address", "phoneNumber")
df = df.drop(df.address).drop(df.phoneNumber)
```


## 2.6. 格式转换



```python
# DataFrame转化为DataSet
# to ds 
ds=df.as[ElementType]
# 把DataSet转化为DataFrame
# to dF
df=ds.toDF()

# to rdd
rdd1 = df.rdd

df.toPandas()
```

![image](https://img.shields.io/badge/图学习-PyG-blue.svg)
![image](https://img.shields.io/badge/NLP-Tensorflow-orange.svg)

![image](https://img.shields.io/badge/推荐-Tensorflow,Xgboost-orange.svg)

![image](https://img.shields.io/badge/推荐-Tensorflow-orange.svg)

![image](https://img.shields.io/badge/时序-Tensorflow-orange.svg)


![image](https://img.shields.io/badge/CV-Pytorch,OpenCV,Gst-blue.svg)

![image](https://img.shields.io/badge/时序,IOT-TensorFlow,sklearn-orange.svg)


## 2.7. 持久化
```python 
df.write.save("nameAndCity.parquet")
df.write.save("namesAndAges.json",format="json")
```

cache()
使用默认存储级别（MEMORY_AND_DISK）持久保存DataFrame。

traffic.cache()

# 3. 参考资料 

1. 强烈推荐 https://s3.amazonaws.com/assets.datacamp.com/blog_assets/PySpark_SQL_Cheat_Sheet_Python.pdf