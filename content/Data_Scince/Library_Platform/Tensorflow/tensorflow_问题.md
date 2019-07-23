---
title: "Tensorflow异常集锦"
date: 2019-06-12 00:00
render: True 
tag: Tensorflow,框架,AI,
---


# Tensorflow异常集锦 
一、tensorflow checkpoint报错
在调用tf.train.Saver#save时，如果使用的路径是绝对路径，那么保存的checkpoint里面用的就是绝对路径；如果使用的是相对路径，那么保存的checkpoint里面用的就是相对路径。正确的方法应该是使用相对路径进行保存，这样才能保证较好的可移植性。
如果使用相对路径，复制到本地之后，会报找不到文件的错误。
tensorflow.python.framework.errors_impl.NotFoundError: FindFirstFile failed for: 
一个绝对路径...... : ϵͳ\udcd5Ҳ\udcbb\udcb5\udcbdָ\udcb6\udca8\udcb5\udcc4·\udcbe\udcb6\udca1\udca3
; No such process
解决方法：手动修改checkpoint文件，checkpoint文件是一个文本文件。
以上结论可以通过以下代码进行验证。