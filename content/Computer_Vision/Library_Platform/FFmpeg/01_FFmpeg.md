---
title: "01_FFmpeg--基础"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 什么是FFmpeg

**Wiki**
> [FFmpeg](https://ffmpeg.org/) is a free and open-source **software project** consisting of a large suite of libraries and programs for handling video, audio, and other multimedia files and streams. 

FFmpeg是软件项目。包含一系列的库和程序。
**官网**
>[FFmpeg](https://ffmpeg.org/):A complete, cross-platform solution to record, convert and stream audio and video.

FFmpeg 是一个款平台的**解决方案**。

FFmpeg功能强大，用途广泛，大量用于视频网站和商业软件（比如 Youtube 和 iTunes），也是许多音频和视频格式的标准编码/解码实现。
## 1.1. 安装 
### 1.1.1. Ubuntu 下安装
如果需要在Linux下进行H.264编码，需要先安装X264，

```shell
apt-get install ffmpeg
# libavcodec-dev
# 
# FFmpeg dev package
sudo apt install libavcodec-dev

sudo apt-get install -y \
    libavformat-dev libavcodec-dev libavdevice-dev \
    libavutil-dev libswscale-dev libswresample-dev libavfilter-dev
```
### 1.1.2. 源码安装


如果需要在Linux下进行H.264编码，需要先安装X264，否则运行时会报Cannot load libcuda.so.1。如果不进行H.264编码，可跳过这步。
```shell
git clone http://git.videolan.org/git/x264.git
cd x264
./configure --enable-shared --disable-asm
make
make install
```


接下来即可安装FFmpeg了
```shell
wget http://www.ffmpeg.org/releases/ffmpeg-3.4.2.tar.gz
tar -zxvf ffmpeg-3.4.2.tar.gz
cd ffmpeg-3.4.2
./configure --enable-libx264 --enable-gpl --prefix=/usr/local/ffmpeg
make
make install
```


安装完后，可在PATH中加入环境变量
`/etc/profile`在最后PATH添加环境变量：
```shell
PATH=$PATH:/usr/local/ffmpeg/bin
```

```shell
#???
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH

echo $PKG_CONFIG_PATH
```
# 2. ffmpeg
## 2.1. Tips

上面命令会输出很多冗余信息，加上`-hide_banner`参数，可以只显示元信息。


```shell
ffmpeg -i input.mp4 -hide_banner
```
## 2.2. 验证

```shell
# 验证安装
ffmpeg
>>>
ffmpeg version 3.4.8-0ubuntu0.2 Copyright (c) 2000-2020 the FFmpeg developers
  built with gcc 7 (Ubuntu 7.5.0-3ubuntu1~18.04)
```


### 2.2.1. 支持的容器

```shell
# 查看 FFmpeg 支持的容器。
ffmpeg -formats
ffmpeg -formats -hide_banner| grep "mp4" 
```
### 2.2.2. 支持的编解码格式
```shell 
# 查看 FFmpeg 支持的编码格式。
ffmpeg -codecs 
ffmpeg -codecs -hide_banner| grep "h264" 

# 查看 FFmpeg 支持的编码格式。
ffmpeg -encoders -hide_banner| grep "h264" 
```

#### 2.2.2.1. h264

`h264_amf` to access **AMD gpu**, (windows only)
`h264_nvenc` use **nvidia gpu** cards (work with windows and linux)
`h264_omx` raspberry pi encoder
`h264_qsv` use Intel Quick Sync Video (hardware embedded in modern **Intel CPU**)
`h264_v4l2m2m` use V4L2 **Linux kernel** api to access hardware codecs
`h264_vaapi` use VAAPI which is another abstraction API to access video acceleration hardware (Linux only)
`h264_videotoolbox` use videotoolbox an API to access hardware on OS X


### 2.2.3. 支持的硬件加速方法

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







# 3. 组成
## 3.1. 工具视角
1）第一部分是四个作用不同的工具软件，分别是：ffmpeg.exe，ffplay.exe，ffserver.exe和ffprobe.exe。

ffmpeg.exe：音视频转码、转换器

ffplay.exe：简单的音视频播放器

ffserver.exe：流媒体服务器

ffprobe.exe：简单的多媒体码流分析器
## 3.2. SDK视角
FFmpeg主要由 `format`,`codec`,`util` 三大核心模块的功能。

```shell
libavformat-dev # 包含多种多媒体容器格式的封装、解封装工具
libavcodec-dev # 包含音视频编码器和解码器
libavfilter-dev # 包含多媒体处理常用的滤镜功能
libavdevice-dev #用于音视频数据采集和渲染等功能的设备相关
libswscale-dev #用于图像缩放和色彩空间和像素格式转换功能
libswresample-dev # 用于音频重采样和格式转换等功能
libavutil-dev # 包含多媒体应用常用的简化编程的工具，如随机数生成器、数据结构、数学函数等功能
```

### 3.2.1. format
### 3.2.2. codec
### 3.2.3. util

# 4. FFmpeg 的使用格式
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

## 常见参数

```shell
-re  # Read input at native frame rate
```

## 更多参数
参考
https://ffmpeg.org/ffmpeg-all.html#Main-options


# 5. 推流

常用参数
```shell
-stream_loop -1 # 循环

```

## 5.1. 推UDP协议


```shell
# push stream local
ffmpeg -re -i h264.mp4 -vcodec copy -f h264 udp://127.0.0.1:1234

# play stream
ffplay  udp://127.0.0.1:1234
ffplay -f h264 udp://127.0.0.1:1234
```

## 5.2. 推RTP协议

```shell
# push stream local
ffmpeg -re -i h264.mp4 -vcodec copy -an -f rtp rtp://127.0.0.1:20000
```

-vcodec codec (output)
Set the video codec. This is an alias for -codec:v.

-an
“-an”（no audio）和“-vn”（no video）分别用来单独输出视频和音频

保上述的sdp信息进文件
```shell

$bash vim a.sdp

SDP:
v=0
o=- 0 0 IN IP4 127.0.0.1
s=No Name
c=IN IP4 127.0.0.1
t=0 0
a=tool:libavformat 58.20.100
m=video 20000 RTP/AVP 96
b=AS:8885
a=rtpmap:96 H264/90000
a=fmtp:96 packetization-mode=1; sprop-parameter-sets=Z0LAHtoBEA8eXwFsgAAAAwCAAAA8B4sXUA==,aM4PLIA=; profile-level-id=42C01E
1
# play stream
ffplay a.sdp -protocol_whitelist file,udp,rtp

```

## 5.3. 推RTMP

```shell
# push stream local
ffmpeg -re -i h264.mp4 -vcodec libx264 -acodec aac -strict -2 -f flv rtmp://localhost:1935/live/stream

# play stream
ffplay rtmp://192.168.0.157:1935/live/stream
```


rtmp服务器的部署方法见这篇博客：https://blog.csdn.net/yeshennet/article/details/72240465




# 6. 参考资料

1. https://zhuanlan.zhihu.com/p/143195044

2. [阮一峰的网络日志: FFmpeg 视频处理入门教程
](http://www.ruanyifeng.com/blog/2020/01/ffmpeg.html)