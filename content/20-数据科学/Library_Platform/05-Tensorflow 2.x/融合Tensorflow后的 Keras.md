---
title: "融合Tensorflow后的 Keras"
layout: page
date: 2099-06-02 00:00
---
[TOC]


# 模型的保存与加载
```python
imported =tf.saved_model.load(export_dir, tags=None, options=None)


saver =tf.saved_model.save(export_dir, tags=None, options=None)

```

```python
writer = tf.summary.create_file_writer("/tmp/mylogs/eager")

with writer.as_default():
  for step in range(100):
    # other model code would go here
    tf.summary.scalar("my_metric", 0.5, step=step)
    writer.flush()
```