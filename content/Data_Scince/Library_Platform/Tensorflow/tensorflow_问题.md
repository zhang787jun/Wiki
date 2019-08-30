---
title: "[测试]Tensorflow异常集锦"
date: 2019-06-12 00:00
render: True 
tag: Tensorflow,框架,AI,
---


# Tensorflow异常集锦 
## 1. tensorflow checkpoint报错
在调用tf.train.Saver#save时，如果使用的路径是绝对路径，那么保存的checkpoint里面用的就是绝对路径；如果使用的是相对路径，那么保存的checkpoint里面用的就是相对路径。正确的方法应该是使用相对路径进行保存，这样才能保证较好的可移植性。
如果使用相对路径，复制到本地之后，会报找不到文件的错误。
tensorflow.python.framework.errors_impl.NotFoundError: FindFirstFile failed for: 
一个绝对路径...... : ϵͳ\udcd5Ҳ\udcbb\udcb5\udcbdָ\udcb6\udca8\udcb5\udcc4·\udcbe\udcb6\udca1\udca3
; No such process

**解决方法：**
1. 手动修改checkpoint文件，checkpoint文件是一个文本文件。
2. 注意路径的斜杠"\"，特别是windows 平台下,部分需要双饭斜杠 “\”、


## 
以上结论可以通过以下代码进行验证。


用以下代码，加载图模型的时候会报错
```python
#保存图模型
tf.train.write_graph(sess.graph_def, graph_dir, 'graph.pbtxt',as_text=True)
# 注意 as_text=True

#加载图模型
with tf.gfile.FastGFile("modle_graph/graph.pbtxt","rb") as f:
    graph_def = tf.GraphDef()
    graph_def.ParseFromString(f.read())


>>> 
google.protobuf.message.DecodeError: Error parsing message

```

**解决:**
```python
tf.train.write_graph(sess.graph_def, graph_dir, 'graph.pbtxt',as_text=False)



```

# TypeError: Cannot interpret feed_dict key as Tensor: Can not convert a int into a Tensor
解释：你的占位符中传入的已经是tensor了，没必要feed_dict,
可以直接sess.run， 如果你非要feed__dict的话，可以参考

ph=tf.placeholder（......）
ph_tensor=sess.run(tensor)
sess.run([......],feed_dict{ph:ph_tensor})

