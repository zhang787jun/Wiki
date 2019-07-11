---
title: "关于RNN的几点理解"
date: 2019-06-17 00:00
---
# 关于RNN的几点理解
[TOC]
[![The MIT License](http://img.shields.io/badge/license-MIT-yellow.svg)](https://github.com/tankywoo/simiki/blob/master/LICENSE)



## 0. LSTM

LSTM cell 的输入
1. $C_{i-1}$   $i-1$ cell 的statue 状态
2. $H_{i-1}$   $i-1$ cell 的statue 状态

### 关于门

**遗忘门**的功能是决定应丢弃或保留哪些信息
**输入门（更新门**用于更新细胞状态。
**输出门**用来确定下一个隐藏状态的值

#### - 遗忘门 Forget gate

In an LSTM, the forget gate lets us do this: 

$$\Gamma_f^{\langle t \rangle} = \sigma(W_f[h^{\langle t-1 \rangle}, x^{\langle t \rangle}] + b_f)\tag{1} $$

$b_f$ :遗忘门的偏执，在tensorflow 中 体现为:` tf.nn.rnn_cell.BasicLSTMCell(num_units,forget_bias=1.0) `
$h^{\langle t-1 \rangle}$: 上一个cell 的 hidden state
$W_f$: 权重 recurrent_initializer对应的权重
$x^{\langle t \rangle}$: 当下输入 


参数 num_units=128 的话，对于公式 (1) 

|                                               参数 | 维度                         |
| -------------------------------------------------: | :--------------------------- |
|                          $h^{\langle t-1 \rangle}$ | shape=(128,1)                |
|                            $x^{\langle t \rangle}$ | shape=(28,1)                 |
| $[h^{\langle t-1 \rangle}, x^{\langle t \rangle}]$ | shape=(28,1)+(128,1)=(156,1) |
|                                              $W_f$ | shape=(128,156)              |
|                                              $b_f$ | shape=(128,1)                |



由于激活函数的存在 $0<=\Gamma_f^{\langle t \rangle}<=1$
如果 $\Gamma_f^{\langle t \rangle}==0$ 意味着 当前 LSTM cell 将忽略 上一个cell 传来的 $h^{\langle t-1 \rangle}$


如果 $\Gamma_f^{\langle t \rangle}==1$ 意味着 当前 LSTM cell 将保存 上一个cell 传来的 $h^{\langle t-1 \rangle}$


#### - 更新门/输入门 Update gate/Inuput gat




$$\Gamma_u^{\langle t \rangle} = \sigma(W_u[h^{\langle t-1 \rangle}, x^{\{t\}}] + b_u)\tag{2} $$ 

Similar to the forget gate, here $\Gamma_u^{\langle t \rangle}$ is again a vector of values between 0 and 1. This will be multiplied element-wise with $\tilde{c}^{\langle t \rangle}$, in order to compute $c^{\langle t \rangle}$.

#### - 更新细胞 Updating the cell （基于 更新门和遗忘门）

To update the new subject we need to create a new vector of numbers that we can add to our previous cell state. The equation we use is: 


$$ \tilde{c}^{\langle t \rangle} = \tanh(W_c[h^{\langle t-1 \rangle}, x^{\langle t \rangle}] + b_c)\tag{3} $$

Finally, the new cell state is: 


$$ c^{\langle t \rangle} = \Gamma_f^{\langle t \rangle}* c^{\langle t-1 \rangle} + \Gamma_u^{\langle t \rangle} *\tilde{c}^{\langle t \rangle} \tag{4} $$

tanh 对应  


#### - 输出门 Output gate

To decide which outputs we will use, we will use the following two formulas: 

$$ \Gamma_o^{\langle t \rangle}=  \sigma(W_o[h^{\langle t-1 \rangle}, x^{\langle t \rangle}] + b_o)\tag{5}$$ 
$$ h^{\langle t \rangle} = \Gamma_o^{\langle t \rangle}* \tanh(c^{\langle t \rangle})\tag{6} $$









## 1. LSTMCell 实例


Keras LSTM 参数解析 




```python
tf.keras.layers.LSTM

tf.layers.Layer
|_tf.keras.layers.Layer
    |_tf.keras.layers.RNN
        |_tf.keras.layers.LSTM

__init__(
    units,
    activation='tanh',
    recurrent_activation='hard_sigmoid',
    use_bias=True,
    kernel_initializer='glorot_uniform',
    recurrent_initializer='orthogonal',
    bias_initializer='zeros',
    unit_forget_bias=True,
    kernel_regularizer=None,
    recurrent_regularizer=None,
    bias_regularizer=None,
    activity_regularizer=None,
    kernel_constraint=None,
    recurrent_constraint=None,
    bias_constraint=None,
    dropout=0.0,
    recurrent_dropout=0.0,
    implementation=1,
    return_sequences=False,
    return_state=False,
    go_backwards=False,
    stateful=False,
    unroll=False,
    **kwargs
)

__call__(
    inputs,
    initial_state=None, # a tensor or list of tensors representing the initial state of the RNN layer.
    constants=None,
    **kwargs
)


```


1. return_sequences=False; return_state=False

```python
x=tf.placeholder(dtype=tf.float32,shape=(None,1,3))
cell_num=2
a=LSTM(cell_num)(x)
print ("cell_num is {}".format(cell_num))
sess=tf.Session()
x_instance=np.array([[[1,2,3]],[[1,2,3]],[[1,2,3]],[[1,2,3]]])
print ("x input counts/shape[0] is {}".format(x_instance.shape[0]))
sess.run(tf.global_variables_initializer())
h_t=sess.run(a,feed_dict={x:x_instance})
print ("h_t shape is {}".format(result.shape))

#cell_num is 2
#x input counts/shape[0] is 4
#result shape is (4, 2)
```
h_t 是 $h^{\langle t \rangle}$ ,$h^{\langle t \rangle} shape=()$ 

2. return_sequences=True; return_state=False

```python
x=tf.placeholder(dtype=tf.float32,shape=(None,1,3))
cell_num=2
a=LSTM(cell_num, return_sequences=True, return_state=False)(x)
print ("cell_num is {}".format(cell_num))
sess=tf.Session()
x_instance=np.array([[[1,2,3]],[[1,2,3]],[[1,2,3]],[[1,2,3]]])
print ("x input counts/shape[0] is {},x input timestamp/shape[1] is {},shape is {}".format(x_instance.shape[0],x_instance.shape[1],x_instance.shape))
sess.run(tf.global_variables_initializer())
H_all=sess.run(a,feed_dict={x:x_instance})
print ("H_all shape is {}".format(H_all.shape))
# cell_num is 2
# x input counts/shape[0] is 4,x input timestamp/shape[1] is 1,shape is (4, 1, 3)
# H_all shape is (4, 1, 2)

```
H_all 是 $np.array(h^{\langle t \rangle},h^{\langle t-1 \rangle},h^{\langle t-2 \rangle},...,h^{\langle 1 \rangle})$

3. return_sequences=False; return_state=True

```python
x=tf.placeholder(dtype=tf.float32,shape=(None,1,3))
cell_num=2

a=LSTM(cell_num, return_sequences=False, return_state=True)(x)
print ("cell_num is {}".format(cell_num))
sess=tf.Session()
x_instance=np.array([[[1,2,3]],[[1,2,3]],[[1,2,3]],[[1,2,3]]])
print ("x input counts/shape[0] is {},x input timestamp/shape[1] is {},shape is {}".format(x_instance.shape[0],x_instance.shape[1],x_instance.shape))
sess.run(tf.global_variables_initializer())
H_all, h_t, c_t  =sess.run(a,feed_dict={x:x_instance})
```
此时 H_all==h_t


4. return_sequences=True; return_state=True

```python
x=tf.placeholder(dtype=tf.float32,shape=(None,1,3))
cell_num=2
a=LSTM(cell_num, return_sequences=True, return_state=True)(x)
print ("cell_num is {}".format(cell_num))
sess=tf.Session()
x_instance=np.array([[[1,2,3]],[[1,2,3]],[[1,2,3]],[[1,2,3]]])
print ("x input counts/shape[0] is {},x input timestamp/shape[1] is {},shape is {}".format(x_instance.shape[0],x_instance.shape[1],x_instance.shape))
sess.run(tf.global_variables_initializer())
H_all, h_t, c_t  =sess.run(a,feed_dict={x:x_instance})
```
H_all 是 $np.array(h^{\langle t \rangle},h^{\langle t-1 \rangle},h^{\langle t-2 \rangle},...,h^{\langle 1 \rangle})$


经过初步调查，常用的LSTM层有Keras.layers.LSTM 和 Tensorflow.contrib.nn.LSTMCell 及 Tensorflow.nn.rnn_cell.LSTMCell ，其中后面两个的实现逻辑是一样的。



```python
tf.keras.layers.RNN(
    cell,
    return_sequences=False,
    return_state=False,
    go_backwards=False,
    stateful=False,
    unroll=False,
    **kwargs
) # 推荐
```

## 2. 时间 BBTP 反向传播

## 3. 梯度消逝与爆炸


