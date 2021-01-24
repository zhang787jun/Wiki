---
title: "01_FFmpeg--基础"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 什么是 FFmpeg

> FFmpeg is a free and open-source **software** project consisting of a large suite of libraries and programs for handling video, audio, and other multimedia files and streams. 

FFmpeg 是一个<**开源的**>软件<**项目**>，不仅仅是一个独立的软件。它包含了一整套且数量庞大的包与软件，这些包与软件可以用于处理视频、影片及其他多媒体文件和多媒体流

>FFmpeg is NOT an independent program only.

它功能强大，用途广泛，大量用于视频网站和商业软件（比如 Youtube 和 iTunes），也是许多音频和视频格式的标准编码/解码实现。

## 1.1. 安装

```shell
# FFmpeg dev package
sudo apt install libavcodec-dev
```


## 1.2. 验证

```shell
# 验证安装
ffmpeg
>>>
ffmpeg version 3.4.8-0ubuntu0.2 Copyright (c) 2000-2020 the FFmpeg developers
  built with gcc 7 (Ubuntu 7.5.0-3ubuntu1~18.04)
```


# 2. 组成

FFmpeg主要由 `format`,`codec`,`util` 三大核心模块的功能。

## 2.1. format
## 2.2. codec
## 2.3. util

# 3. 基于FFmpeg CML的使用

FFmpeg CML 是一个功能强大的**工具**，用于操作FFmpeg

## 3.1. 基础
FFmpeg 的命令行参数非常多，可以分成五个部分。

```shell
ffmpeg {1} {2} -i {3} {4} {5}

1. 全局参数
2. 输入文件参数
3. 输入文件
4. 输出文件参数
5. 输出文件
```

```shell
ffmpeg \
-y \ # 全局参数
-c:a libfdk_aac -c:v libx264 \ # 输入文件参数
-i input.mp4 \ # 输入文件
-c:v libvpx-vp9 -c:a libvorbis \ # 输出文件参数
output.webm # 输出文件
```

如果不指明编码格式，FFmpeg 会自己判断输入文件的编码。因此，上面的命令可以简单写成下面的样子。


```shell
ffmpeg -i input.avi output.mp4
```

## 3.2. Tips

上面命令会输出很多冗余信息，加上`-hide_banner`参数，可以只显示元信息。


```shell
ffmpeg -i input.mp4 -hide_banner
```
## 3.3. 查看信息

### 3.3.1. 支持的容器

```shell
# 查看 FFmpeg 支持的容器。
ffmpeg -formats
ffmpeg -formats| grep "mp4" -hide_banner
```
### 3.3.2. 支持的编解码格式
```shell 
# 查看 FFmpeg 支持的编码格式。
ffmpeg -codecs 
ffmpeg -codecs | grep "h264" -hide_banner

# 查看 FFmpeg 支持的编码格式。
ffmpeg -encoders| grep "h264" -hide_banner
```
### 3.3.3. 支持的硬件加速方法

```shell
ffmpeg -hwaccels -hide_banner
>>>
Hardware acceleration methods:
vdpau
vaapi
cuvid
```
>Note
>>1. **VDPAU** (Video Decode and Presentation API for Unix)是一个最初由NVIDIA开发的针对其GeForce 8系列以及更高系列的GPU[1][2] ，在UNIX和类UNIX系统（包括 Linux、FreeBSD和Solaris）下基于X窗口系统下的开源库(libvdpau)和API
>>2.  **VAAPI** Video Acceleration API (VA-API) is an open source API that allows applications such as VLC media player or GStreamer to use hardware video acceleration capabilities, usually provided by the graphics processing unit (GPU). It is implemented by the free and open-source library libva, combined with a hardware-specific driver, usually provided together with the GPU driver 主要针对Intel的集成显卡


**参考资料**
[知乎: FFmpeg 硬件加速方案概览-上](https://zhuanlan.zhihu.com/p/40006235)
[知乎: FFmpeg 硬件加速方案概览-下（主要）](https://zhuanlan.zhihu.com/p/40020428)



# 4. 参考资料

https://zhuanlan.zhihu.com/p/143195044

[阮一峰的网络日志: FFmpeg 视频处理入门教程
](http://www.ruanyifeng.com/blog/2020/01/ffmpeg.html)