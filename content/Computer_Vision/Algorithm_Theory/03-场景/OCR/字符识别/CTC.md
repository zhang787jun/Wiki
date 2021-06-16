---
title: "CTC--全时连接分类器"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. CTC 是什么
CTC 的全称是`Connectionist Temporal Classification`。

# 2. 使用场景

这个方法主要是解决神经网络 label 和output **不对齐的问题**（Alignment problem）。

# 3. 原理

CTC是借鉴了隐马尔科夫模型(Hidden Markov Nodel)的Forward-Backward算法思路，是利用动态规划的思路计算CTC-Loss及其导数的。
**特点**

1. 引入blank字符，解决有些位置没有字符的问题；
2. 通过递推，快速计算梯度。

## 3.1. Softmax 之后

# 4. 关键

## 4.1. CTC Loss
### 4.1.1. 基本步骤
训练神经网络需要计算`loss function`，与其他常见的`loss function`不同，计算**CTC loss**需要2步：
1. 计算所有可能的序列组合的概率和
   > We first need to sum over probabilities of all possible alignments of the text present in the image.

2. 取负对数
   > Then take the negative logarithm of this to calculate the loss.



## 4.2. CTC decoder
在推理阶段，需要 `CTC decoder`从神经网络的输出获得文本。
训练和的 Nw 可以用来预测新的样本输入对应的输出字符串，这涉及到解码。
按照最大似然准则，最优的解码结果为：

$$h(x)=argmax_{l∈L≤T} p(l|x)$$


然而，上式不存在已知的高效解法。下面介绍几种实用的近似破解码方法。

这里主要有2种分类方法 (decoding method)：
1. `Best path decoding`.   
2. `prefix search decoding`.  这个方法据说给定足够的计算资源和时间， 能找到最优解。 但是复杂度会指数增长 随着输入sequence 长度的变化。  这里推荐用有限长度的prefix search decode 来做。 但是具体考虑多长的sequence做判断 还需具体问题具体分析。 这里的理论基础和就是 每一个node  都是condition 在上一个输出的前提下 算出整个序列的概率。

### 4.2.1. Raw decode 全局最优值求解
将所有路径组合, `O(n**m)`。
例如：3个标签，时序3，27 路径。
$$3^3=27$$

**适用性**
小样本 ，大样本计算量大太

### 4.2.2. Best path decoding (Greedy decode 贪心搜索)

**基本步骤**
1. 选取每个步长概率最高的字符
   >Takes the characters with the highest probability for each time step.
2. 去重和移除空白符号
    >Remove the duplicate characters and then remove the blank character from the outputs.

这是一种启发式算法，按照正常分类问题，那就是概率最大的sequence 就是分类器的输出。 这个就是用每一个 time step的输出做最后的结果。 
```python
tf.nn.ctc_greedy_decoder(inputs, sequence_length, merge_repeated=True)

output = tf.edit_distance(hypothesis, truth, normalize=True, name='edit_distance')
```
**缺点**
1. 忽略了一个输出可能对应多个对齐(alignments)方式。
2. 虽然单个路径可能分数很高，但是这样的方法不能保证一定会找到最大概率的sequence。


### 4.2.3. Beam search decoding

#### 4.2.3.1. 基础版本

**基本步骤**


1)(2). Then, the algorithm iterates over all time-steps of the NN output matrix (3–15). At each time-step, only the best scoring beams from the previous time-step are kept (4). The beam width (BW) specifies the number of beams to keep. For each of these beams, the score at the current time-step is calculated (8). Further, each beam is extended by all possible characters from the alphabet (10) and again, a score is calculated (11). After the last time-step, the best beam is returned as a result (16).

1. 创建候选项目（beams）
> creates text candidates (beams)
> the list of beams is initialized with an empty beam (line 1) and a corresponding score 
1. 计算概率
> scores them.


Beam Search 是寻找全局最优值和Greedy Search在查找时间和模型精度的一个折中。一个简单的beam search在每个时间片计算所有可能假设的概率，并从中选出最高的几个作为一组。然后再从这组假设的基础上产生概率最高的几个作为一组假设，依次进行，直到达到最后一个时间片。
#### 4.2.3.2. Word Beam Search 

Word Beam Search （以下简称“WBS”）则针对上述缺点进行了改进：

It constrains words to those contained in a dictionary, allows non-word character strings between words, optionally integrates a word-level language model and has a better running time than token passing.
使用语言模型，WBS提供了四种给beam打分的方法：

限制beam在字典内：
only constrain the beams by the dictionary;
2. 给被完全识别出的词打分：

score when a word is completely recognized;
3. 预测下个句子的分值：

forecast the score by calculating possible next words;
4. 预测随机得到的下一组句子的分值：

forecast the score with a random sample of possible next words;

#### 4.2.3.3. 改进版本1-  Beam search with character-LM

时间复杂度 `O(T·BW·C·log(BW·C))`
### 4.2.4. Token passing

Token passing: “A random number”. This algorithm uses a dictionary and word-LM. It searches for the most probable sequence of dictionary words in the NN output. But it can’t handle arbitrary character sequences (numbers, punctuation marks) like “: 1234.”.

### 4.2.5. prefix beam decode
Top-path is (1, 2), after many-to-one map, the path is (1, 2) which is same from top-path in raw decode, and the score is 0.12 which is lower than score in raw decode. So, obviously, prefix beam decode is better than greedy decode and beam decode. And the reason why score is lower than score in raw decode is that I set the beamSize be 2, if beamSize=3, the score will 0.2178, which is same with the score in raw decode.







[^1][^2]


# 5. 实践 
## 5.1. ctc_loss
TF 和 keras 都提供了CTC的解决方案
最终我是用keras.backend.ctc_batch_cost 做的。但是也把tf.nn.ctc_loss 的解读放前面。


### 5.1.1. Tensorflow



```python
tensor= tf.nn.ctc_loss(
    labels,
    inputs,
    sequence_length,
    preprocess_collapse_repeated=False,
    ctc_merge_repeated=True,
    ignore_longer_outputs_than_inputs=False,
    time_major=True
)


# labels：int32 类型的稀疏向量
# inputs：3维的float向量，如果time_major为默认的，那么其形状为[max_time, batch_size, num_classes]，把LSTM输出的第0维和第1维换一下即可。另外，如同TensorFlow源码解读之greedy search及beam search中所讲的那样，输入值是经过logit处理的变量。
# sequence_length：是一个int32列表，维度为 batch_size，里面每个值的大小为系列的长度。
# preprocess_collapse_repeated: 是否需要预处理，将重复的 label 合并成一个，默认是 False
# ctc_merge_repeated: 默认为 True

## 输出：
# Tensor: A 1-D float Tensor, size [batch], containing the negative log probabilities，同样也需要对 ctc_loss 求均值。
```


```python 
def ctc_loss(y_true, y_pred):
    print(y_true)
    print(y_pred)
    y_true = tf.reshape(y_true, (BATCH_SIZE, time_step_len))
    y_pred = tf.reshape(y_pred, (BATCH_SIZE, time_step_len, NUM_CHARACTERS+1) )
    return tf.keras.backend.ctc_batch_cost(y_true, y_pred, np.array([[90], [150]]), np.array([[150], [20]]))
```



####  5.1.1.1. SparseTensor 类介绍
`稀疏矩阵`： 当密集矩阵中大部分的数都是 0 的时候，就可以用一种更好的存储方式（只将矩阵中不为 0 的）
```python 
class tf.SparseTensor(indices, values, dense_shape)
```
输入参数：

indices： 指定 Sparse Tensor 中非 0 值的索引，是一个 2D 的 int64 张量，形状为[N, ndims]，其中 N 为非 0 值的维数，ndims 为 dense_shape 的维数
values： 指定 Sparse Tensor 索引处的值，是 一个1D 张量，维数为[N]
dense_shape： 指定 Sparse Tensor 的形状，是一个 1D 的 int64 张量，维数为[ndims]，代表原来密集矩阵的形状
输出：

形状为 dense_shape、指定索引 indices 处的值为 values 的稀疏张量
常用属性：

indices
values
dense_shape
喂数据(tf.sparse_placeholder)：

```python
sp = tf.sparse_placeholder(tf.int64)
sess.run(xxx, feed_dict={sp: (indices, values, dense_shape)})
```
代码示例
```python
import tensorflow as tf

a = tf.SparseTensor(indices=[[0, 0], [1, 2]], values=[1, 2], dense_shape=[3, 4])
[[1, 0, 0, 0]
 [0, 0, 2, 0]
 [0, 0, 0, 0]]

with tf.Session() as sess:
	b = sess.run(a)
	print(b)
	print(b.indices)
	print(b.values)
	print(b.dense_shape)

>>>SparseTensorValue(indices=array([[0, 0], [1, 2]], dtype=int64), values=array([1, 2]), dense_shape=array([3, 4], dtype=int64))

>>>[[0 0]
    [1 2]]
>>>[1 2]
>>>[3 4]

```
##### 5.1.1.1.1. 生成 SparseTensor

TensorFlow 中没有现成的函数，可以自己封装起来，以备不时之需。

```python 
import numpy as np
import tensorflow as tf

# 注意此处 dtype 指定的 values 的数据类型
def sparse_tuple_from(sequences, dtype=np.int32):
	"""Create a sparse representention of x.
	Args:
		sequences: a list of lists of type dtype where each element is a sequence
	Returns:
		A tuple with (indices, values, shape)
	"""
	indices = []
	values = []

	for n, seq in enumerate(sequences):
		indices.extend(zip([n] * len(seq), range(len(seq))))
		values.extend(seq)

	indices = np.asarray(indices, dtype=np.int64)
	values = np.asarray(values, dtype=dtype)
	# 自动寻找序列的最大长度，形状为：batch_size * max_len
	shape = np.asarray([len(sequences), np.asarray(indices).max(0)[1] + 1], dtype=np.int64)

	return tf.SparseTensor(indices=indices, values=values, dense_shape=shape)

```

##### 5.1.1.1.2. SparseTensor 转 DenseTensor
```python
tensor=tf.sparse_tensor_to_dense(sp_input, default_value=0, validate_indices=True, name=None)


```

**输入参数：**
`sp_input`： 输入的 SparseTensor
default_value： Scalar value to set for indices not specified in sp_input，默认为 0
validate_indices： A boolean value. If True, indices are checked to make sure they are sorted in lexicographic order and that there are no repeats in indices
**输出：**
`tensor` : A dense tensor with shape sp_input.dense_shape and values specified by the non-empty values in sp_input， Indices not in sp_input are assigned default_value

代码示例：
```python
import tensorflow as tf

a = tf.SparseTensor(indices=[[0, 1], [0, 3], [2, 0]], values=[2, 3, 5], dense_shape=[3, 5])

# 未指定索引的位置使用 -1 来填充
b = tf.sparse_tensor_to_dense(a, default_value=-1)  

with tf.Session() as sess:
	print(sess.run(b))

[[-1  2 -1  3 -1]
 [-1 -1 -1 -1 -1]
 [ 5 -1 -1 -1 -1]]
```


###  5.1.2. Keras
`keras.backend.ctc_batch_cost`实际上也是用tf做的后端。具体可以参考官方文档
1. https://www.tensorflow.org/api_docs/python/tf/keras/backend/ctc_batch_cost
2. https://keras.io/backend/#ctc_batch_cost

```python
loss=keras.backend.ctc_batch_cost(y_true, y_pred, input_length, label_length)

# y_true: tensor (samples, max_string_length) containing the truth labels.
# y_pred: tensor (samples, time_steps, num_categories) containing the prediction, or output of the softmax.

# input_length: tensor (samples, 1) containing the sequence length for each batch item in y_pred.
# label_length: tensor (samples, 1) containing the sequence length for each batch item in y_true.
```
```python
from tensorflow import  keras
import tensorflow as tf
import numpy as np

y_true = np.array([[4, 2, 1], [2, 3, 0],])                                   # (2, 3)
y_pred = keras.utils.to_categorical(np.array([[4, 1, 3], [1, 2, 4]]), 6)     # (2, 3, 6)


input_length = np.array([[2], [2]])                                            # (2, 1)
label_length = np.array([[2], [2]])                                            # (2, 1)
cost = keras.backend.ctc_batch_cost(y_true, y_pred, input_length, label_length) # (2,1)

```



The ctc_code implementation in Tensorflow's backend is this one: tensorflow.org/api_docs/python/tf/keras/backend/ctc_decode which is different from tf.nn.ctc_beam_search_decoder – GPhilo Jan 25 '18 at 14:56
@GPhilo Exactly, that's the first link in the post. However, if using the option greedy=False, following the code here we will finally reach tf.nn.ctc_beam_search_decoder, as far as I understand. – user1578793 Jan 25 '18 at 15:13
You're right, I got confused by the different import (the script has from tensorflow.python.ops import ctc_ops as ctc) and I thought it called directly the underlying C++ code wrapper, but I see now that tf.nn.ctc_beam_search_decoder is implemented in that python file. – GPhilo Jan 25 '18 at 15:16 
1
It looks like there's no dictionary functionality fully implemented as of this date. See github.com/tensorflow/tensorflow/issues/12356 for info on how to implement it yourself. – bivouac0 Feb 3 '18 at 16:11


https://stackoverflow.com/questions/48445751/keras-constrained-dictionary-search-with-ctc-decode


### 5.1.3. Pytorch 





[^3]
[^4]
# 6. 参考资料

[^1]: Connectionist Temporal Classification - Labeling Unsegmented Sequence Data with Recurrent Neural Networks: Graves et al., 2006 [(pdf)](http://www.cs.toronto.edu/~graves/icml_2006.pdf)

[^3]: https://theailearner.com/2019/05/29/connectionist-temporal-classificationctc/

[^2]: [CSDN: CTC 原理及实现](https://blog.csdn.net/JackyTintin/article/details/79425866)


[^4]: [中文CTC教程](https://github.com/DingKe/ml-tutorial/blob/master/ctc/CTC.ipynb)


