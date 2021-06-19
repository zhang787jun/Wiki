---
title: "02_OpenCV--GUI操作"
layout: page
date: 2099-06-02 00:00
---


[TOC]


# 1. 读取文件

## 1.1. 图像文件
```python
import numpy as np
import cv2 as cv
# 用灰度模式加载图像
img = cv.imread('messi5.jpg', 0)

# 即使图像路径错误，它也不会抛出任何错误，但是打印 img会给你None
```

## 1.2. 视频
```python 

import numpy as np
import cv2 as cv
cap = cv.VideoCapture(0)
while(True):
    # 一帧一帧捕捉
    ret, frame = cap.read()
    # 我们对帧的操作在这里
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    # 显示返回的每帧
    cv.imshow('frame',gray)
    if cv.waitKey(1) & 0xFF == ord('q'):
        break
# 当所有事完成，释放 VideoCapture 对象
cap.release()
cv.destroyAllWindows()
```


# 2. 显示


```python 
cv.imshow('image', img)

# 任意键盘事件后等待n毫秒
cv.waitKey(0) 
# 销毁我们创建的所有窗口
cv.destroyAllWindows()
```

# 3. 保存


```python 
cv.imwrite('messigray.png',img)
```




