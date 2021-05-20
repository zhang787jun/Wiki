---
title: "CTC--全时连接分类器"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. CTC 是什么
CTC 的全称是`Connectionist Temporal Classification`。

# 2. 使用场景?

这个方法主要是解决神经网络 label 和output **不对齐的问题**（Alignment problem）。

# 3. 原理

CTC是借鉴了隐马尔科夫模型(Hidden Markov Nodel)的Forward-Backward算法思路，是利用动态规划的思路计算CTC-Loss及其导数的。

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
2. `prefix search decoding`.  这个方法据说给定足够的计算资源和时间， 能找到最优解。 但是复杂度会指数增长 随着输入sequence 长度的变化。  这里推荐用有限长度的prefix search decode 来做。 但是具体考虑多长的sequence做判断 还需具体问题具体分析。 这里的理论基础和就是 每一个node  都是condition 在上一个输出的前提下  算出整个序列的概率。

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
这个方法最大的缺点是忽略了一个输出可能对应多个对齐(alignments)方式。虽然单个路径可能分数很高，但是这样的方法不能保证一定会找到最大概率的sequence。

### 4.2.3. Beam search decoding

#### 4.2.3.1. 基础版本

**基本步骤**


1)(2). Then, the algorithm iterates over all time-steps of the NN output matrix (3–15). At each time-step, only the best scoring beams from the previous time-step are kept (4). The beam width (BW) specifies the number of beams to keep. For each of these beams, the score at the current time-step is calculated (8). Further, each beam is extended by all possible characters from the alphabet (10) and again, a score is calculated (11). After the last time-step, the best beam is returned as a result (16).

1. 创建候选项目（beams）
> creates text candidates (beams)
> the list of beams is initialized with an empty beam (line 1) and a corresponding score 
1. 计算概率
> scores them.


Beam Search是寻找全局最优值和Greedy Search在查找时间和模型精度的一个折中。一个简单的beam search在每个时间片计算所有可能假设的概率，并从中选出最高的几个作为一组。然后再从这组假设的基础上产生概率最高的几个作为一组假设，依次进行，直到达到最后一个时间片。


#### 4.2.3.2. 改进版本1-  Beam search with character-LM

时间复杂度 `O(T·BW·C·log(BW·C))`
### 4.2.4. Token passing

Token passing: “A random number”. This algorithm uses a dictionary and word-LM. It searches for the most probable sequence of dictionary words in the NN output. But it can’t handle arbitrary character sequences (numbers, punctuation marks) like “: 1234.”.

### 4.2.5. prefix beam decode
Top-path is (1, 2), after many-to-one map, the path is (1, 2) which is same from top-path in raw decode, and the score is 0.12 which is lower than score in raw decode. So, obviously, prefix beam decode is better than greedy decode and beam decode. And the reason why score is lower than score in raw decode is that I set the beamSize be 2, if beamSize=3, the score will 0.2178, which is same with the score in raw decode.







[^1][^2]


# 5. 实践 

TF和keras 都提供了CTC的解决方案
最终我是用keras.backend.ctc_batch_cost 做的。但是也把tf.nn.ctc_loss 的解读放前面。


## 5.1. Tensorflow



```python
tf.nn.ctc_loss(
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

```




```python 

```python
#%% CTC loss

def ctc_loss(y_true, y_pred):

    print(y_true)
    print(y_pred)
    
    y_true = tf.reshape(y_true, (BATCH_SIZE, time_step_len))
    y_pred = tf.reshape(y_pred, (BATCH_SIZE, time_step_len, NUM_CHARACTERS+1) )
    #
    return tf.keras.backend.ctc_batch_cost(y_true, y_pred, np.array([[90], [150]]), np.array([[150], [20]]))

```

```

###  5.1.1. SparseTensor 类介绍
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

sp = tf.sparse_placeholder(tf.int64)
sess.run(xxx, feed_dict={sp: (indices, values, dense_shape)})
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
### 5.1.2. 生成 SparseTensor

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

### 5.1.3. SparseTensor 转 DenseTensor
```python
tf.sparse_tensor_to_dense(sp_input, default_value=0, validate_indices=True, name=None)
```
输入参数：

sp_input： 输入的 SparseTensor
default_value： Scalar value to set for indices not specified in sp_input，默认为 0
validate_indices： A boolean value. If True, indices are checked to make sure they are sorted in lexicographic order and that there are no repeats in indices
输出：

A dense tensor with shape sp_input.dense_shape and values specified by the non-empty values in sp_input， Indices not in sp_input are assigned default_value
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

### 5.1.4. ctc_loss 函数介绍
处理输出标签和真实标签之间的损失，解决输出标签数和真实标签数不对齐的问题

```python
tf.nn.ctc_loss(labels, inputs, sequence_length, preprocess_collapse_repeated=False, ctc_merge_repeated=True, ignore_longer_outputs_than_inputs=False, time_major=True)
```
输入参数：

labels: 是一个 int32 类型的稀疏张量（SparseTensor）， labels.indices[i, :] == [b, t] 表示 labels.values[i] 保存着(batch b, time t)的 id，labels.values[i] must take on values in [0, num_labels)
inputs: （常用变量 logits 表示）经过 RNN 后输出的标签预测值，是一个 3D 浮点 Tensor，当 time_major=True(默认)时形状为：(max_time * batch_size * num_classes)，否则形状为：batch_size * max_time * num_classes，ctc_loss will perform the softmax operation for you
sequence_length: 1-D int32 vector, size 为 [batch_size]，vector 中的每个值表示序列的长度，形如 [max_time_step,…,max_time_step] ，此 sequence_length 和用在 dynamic_rnn 中的 sequence_length 是一致的， 用来表示 rnn 的哪些输出不是 pad 的.
preprocess_collapse_repeated: 是否需要预处理，将重复的 label 合并成一个，默认是 False
ctc_merge_repeated: 默认为 True
输出：

A 1-D float Tensor, size [batch], containing the negative log probabilities，同样也需要对 ctc_loss 求均值。

## 5.2. Keras
keras.backend.ctc_batch_cost实际上也是用tf做的后端，贴上官方文档。
https://www.tensorflow.org/api_docs/python/tf/keras/backend/ctc_batch_cost
https://keras.io/backend/#ctc_batch_cost

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


## 5.3. Pytorch 




我们用一个简单的例子贯穿我们的调试。

batch 有2个sample。
输入输出必定为3个时间片time_frame。
每个时间片有4个特征n_channel。
有5个类别n_class （0， 1， 2，3，4）

输入
batch_x 的形状为 （batch_size, time_frame, n_channel）。
batch_y 的形状为 （batch_size, time_frame），输入是用数字标记的类别。
可能的y的举例：
[[4, 2, 1],
[1, 2, 0]]

2.1 tf.nn.ctc_loss
官方文档：
https://www.tensorflow.org/api_docs/python/tf/nn/ctc_loss?hl=en

```python 
tf.nn.ctc_loss(
    labels,
    logits,
    label_length,
    logit_length,
    logits_time_major=True,
    unique=None,
    blank_index=None,
    name=None
)

```

其中最重要的是
labels: tensor of shape [batch_size, max_label_seq_length] or SparseTensor


注意这个是SparseTensor，所以要先想办法把输入的dense转为SparseTensor 不然会报错。keras 有给一个tf.keras.backend.ctc_label_dense_to_sparse() 但是我在尝试的时候各种迷之错误，以后再补充。

logits: tensor of shape [frames, batch_size, num_labels], if logits_time_major == False, shape is [batch_size, frames, num_labels].

label_length: tensor of shape [batch_size], None if labels is SparseTensor Length of reference label sequence in labels.

logit_length: tensor of shape [batch_size] Length of input sequence in logits.

label为输入的一个batch的数字标记的真实值。
logit 是每个frame中的各个label 的概率，一般是网络最后一层softmax的输出。

2.2 keras.backend.ctc_batch_cost
而实际上也是用tf做的后端，贴上官方文档。
https://www.tensorflow.org/api_docs/python/tf/keras/backend/ctc_batch_cost
https://keras.io/backend/#ctc_batch_cost

```python
keras.backend.ctc_batch_cost(y_true, y_pred, input_length, label_length)

y_true: tensor (samples, max_string_length) containing the truth labels.
y_pred: tensor (samples, time_steps, num_categories) containing the prediction, or output of the softmax.

input_length: tensor (samples, 1) containing the sequence length for each batch item in y_pred.
label_length: tensor (samples, 1) containing the sequence length for each batch item in y_true.

```


需要注意的是

y_true里面是数字标记的tensor
y_pred 里面是每个frame 各个class的概率。
另外，第三个参数input_length 是y_pred的每个sample的序列长度，而最后一个参数label_length才是y_true的序列长度。并不是1-3，2-4， 而是1-4，2-3.
如果我们用keras 做快速的建模的话，明显keras.backend.ctc_batch_cost 比tf的封装程度高些。可以省很多麻烦。所以用这个。

按照我们上面的例子，简单地写个小程序测试一下，可以通过。需要注意的是我comment的每个输入的形状。这个例子应该能够给予非常直观理解。

```python 
import keras
import tensorflow as tf
import numpy as np

y_true = np.array([[4, 2, 1], [2, 3, 0]])                                    # (2, 3)
y_pred = keras.utils.to_categorical(np.array([[4, 1, 3], [1, 2, 4]]), 5)     # (2, 3, 5)


input_length = np.array([[2], [2]])                                         # (2, 1)
label_length = np.array([[2], [2]])                                         # (2, 1)

cost = keras.backend.ctc_batch_cost(y_true, y_pred, input_length, label_length)
```

另一个问题需要注意的是，根据理论我们知道，y_pred 的序列长度必须要大于y_label的序列长度，也就是说input_length中的每个item 要大过label_length中的对应item，否则会报错。这是CTC的原理决定的。（另外，想想语音识别任务，label可能是句子中的英文字母，而y_pred 则是每一帧的音素预测，帧数明显是多于字母数的。 ）

1. keras.backend.ctc_batch_cost调试错误
3.1 基本文档没讲的注意点。关于模型的null label
 (0) Invalid argument: Saw a non-null label (index >= num_classes - 1) following a null label, batch: 0 num_classes: 28 labels: 24,22,9,17,3,24,4,26,26,21,18,11,10,7,21,8,7,6,20,17,11,4,13,7,20,23,16,27,17,0,22,22,0,4,2,17,11,21,3,26,11,27,5,21,10,19,12,1,14,3 labels seen so far: 24,22,9,17,3,24,4,26,26,21,18,11,10,7,21,8,7,6,20,17,11,4,13,7,20,23,16
	 [[{{node loss_4/time_distributed_45_loss/CTCLoss}}]]
1
2
翻译一下，这个说的是有一个non-null label 在一个null label 后面。说的是label。不过既然它说的是不允许有non-null label 在null label后面是无效的，那么其实这个更相当于文档的终止标记，也就是对一个自动补齐的y_true，应该用null label（字母表最后一个值）来补在每个序列的末尾。

实际上，ctc_loss就是把所有 大于等于 num_classes -1 的值视为空符，其实是说 “你的字母表的最后一个字符是ctc_loss的null label”。而小于的num_class-1为实际的有效的标记。

注意num_class是根据y_pred的形状得来的，是y_pred的shape[2]。

从ctc_loss基本原理,我们知道ctc_loss有一个标记为空符‘-’。而如果我们网络的预测的类别与我们已知的类别数是相等的。那么网络就没有给出ctc_loss 的空符。

如果没有空符则这个函数依然把 index>=num_class - 1 的class 当成了null label。那么就可能出现上面的报错。

解决方案是：

对一开始做数据集的时候就没有用空符的，在网络的最后一层加多一个输出用于预测ctc的null label。
使num_classes 为 n_class + 1。(num_classes 是ctc_loss内部的class数目（也是y_pred 中的类别数目）。而n_class 是我们的字母表里面的类别数目。)。

或者在做数据集的时候增加一个空符在字母表的最后，用于补齐。方法自己选择。

3.2 长度问题，
刚刚已经说了，y_pred 的序列长度必须要大于y_label的序列长度，也就是说input_length中的每个item 要大过label_length中的对应item。
如果不对的话。会报出这个错。

(0) Invalid argument: Not enough time for target transition sequence (required: 150, available: 90)0You can turn this error into a warning by using the flag ignore_longer_outputs_than_inputs
	 [[{{node loss_10/time_distributed_99_loss/CTCLoss}}]]
  (1) Invalid argument: Not enough time for target transition sequence (required: 150, available: 90)0You can turn this error into a warning by using the flag ignore_longer_outputs_than_inputs
	 [[{{node loss_10/time_distributed_99_loss/CTCLoss}}]]
	 [[training_8/Adam/gradients/loss_10/time_distributed_99_loss/CTCLoss_grad/mul/_2619]]
0 successful operations.
1
2
3
4
5
6
还有一些其他的长度问题，解决方案就是检查长度。

3.3 其他问题
我是在keras 中专门把ctc_loss 封装成一个loss来训练的。也就是自定义一个loss 函数如果没有reshape 的话，tf.nn.ctc_loss 会迷之报错。就是这个错误卡了我4天。最后终于在把y_true ，y_pred print出来后发现它们的形状没有指定。于是用reshape指定形状才把draft程序调过。

所有的由tf.keras.backend.ctc_label_dense_to_sparse，和tf.nn.ctc_loss 出的错误。比如下面两个，都可以由先按上面所说确定正确的输入形状，然后用 tf.reshape() 指定形状调过。

Shape (?,  ?) must have rank 1

ValueError: Shape must be rank 0 but is rank 1 for 


示例的keras loss 如下。这也是一个draft

[^3]
# 6. 参考资料

[^1]: Connectionist Temporal Classification - Labeling Unsegmented Sequence Data with Recurrent Neural Networks: Graves et al., 2006 [(pdf)](http://www.cs.toronto.edu/~graves/icml_2006.pdf)

[^3]: https://theailearner.com/2019/05/29/connectionist-temporal-classificationctc/

[^2]: [CSDN: CTC 原理及实现](https://blog.csdn.net/JackyTintin/article/details/79425866)


