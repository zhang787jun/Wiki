---
title: "01 媒体服务基础"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. (Streaming) Media Server （流）媒体服务器

## 1.1. 什么是媒体服务

A  Media Server is a computer appliance or an application software that stores digital media (video, audio or images) and makes it available over a network.

![](https://docs.microsoft.com/zh-cn/azure/media-services/latest/media/live-streaming/live-encoding.svg)

# 3. 功能

![](https://img-blog.csdnimg.cn/20190422113053807.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9odWF3ZWljbG91ZC5ibG9nLmNzZG4ubmV0,size_16,color_FFFFFF,t_70)

流媒体服务器最主要功能是
1. **拉流**。以流式协议（RTP/RTSP、MMS、RTMP等）将视频文件传输到客户端，供用户在线观看；
2. **推流**。

其他：
1. 用户安全管理
2. 内容分发加速
3. 媒体存储


# 4. 典型的解决方案

## Windows Media Service


微软的Windows Media Service（WMS），它采用MMS协议接收、传输视频，采用Windows Media Player（WMP）作为前端播放器；
## Helix Server
RealNetworks公司的Helix Server，采用RTP/RTSP协议接收、传输视频，采用Real Player作为播放前端；

## Flash Media Server
Adobe公司的Flash Media Server,采用RTMP(RTMPT/RTMPE/RTMPS)协议接收、传输视频，采用Flash Player作为播放前端。值得注意的是，随着Adobe公司的Flash播放器的普及（根据Adobe官方数据，Flash播放器装机量已高达99%以上），越来越多的网络视频开始采用Flash播放器作为播放前端，因此，越来越多的企业开始采用兼容Flash播放器的流媒体服务器，而开始淘汰其他类型的流媒体服务器。支持Flash播放器的流媒体服务器，除了Adobe Flash Media Server，还有sewise的流媒体服务器软件和Ultrant Flash Media Server流媒体服务器软件，以及基于Java语言的开源软件Red5。


## 4.2. Darwin Streaming Server 

Darwin Streaming Server简称DSS。DSS是Apple公司提供的开源实时流媒体播放服务器程序。整个程序使用C++编写，在设计上遵循高性能，简单，模块化等程序设计原则，务求做到程序高效，可扩充性好。并且DSS是一个开放源代码的，基于标准的流媒体服务器，可以运行在Windows NT和Windows 2000，以及几个UNIX实现上，包括Mac OS X，Linux，FreeBSD，和Solaris操作系统上的。

## 4.3. rtsp-server
[rtsp-server](https://github.com/revmischa/rtsp-server) 一般是指 revmischa 写的一个开源的轻量级RTSP/RTP 流媒体服务 (Lightweight RTSP/RTP streaming media server)





fmpeg h264转码，并且使用rtps推流

.DDDD 2020-05-19 16:25:18  603  收藏 1
文章标签： ffmpeg linux
版权
ffmpeg h264转码，并且使用rtps推流
先说说rtmp推流：

ffmpeg推流rtmp:

各大网站都能很简单的找到
ffmpeg -i “rtsp://admin:Gdkt_2019@172.0.0.1554/ch1/main/av_stream” -vcodec copy -acodec copy -f flv “rtmp://127.0.0.1:1935/live/”

ffmpeg推流rtsp：
这个需要去到ffmpeg的官方文档才能找到
https://www.ffmpeg.org/ffmpeg-all.html#Examples-19

RTSP推流，实操：
LINUX环境
ffmpeg推流，特点：高延迟低消耗
推流rtsp
下载安装rtsp-server
https://github.com/revmischa/rtsp-server

启动后使用命令行推流
ffmpeg -max_delay 100 -r 25 -re -i “rtsp url(这里是拉流地址或者视频地址)” -b 700000 -rtsp_transport tcp -s 704*576 -vcodec h264 -f rtsp rtsp://localhost/test

-r 是你设置的帧数
-s是设置的图像大小
该命令可以解决h264转码后花屏的问题

WINDOWS环境
下载EasyDarwin开源流媒体服务器
https://github.com/EasyDarwin/EasyDarwin

启动后也是使用相同的命令进行推流

拉流方式: ffplay rtsp://localhost/test

VLC搭建rstp服务器
特点：低延迟高消耗

1)和上面一样开始rtps-server
2)参考此文章：https://blog.csdn.net/qq_29350001/article/details/77979355


Gstreamer 搭建RTSP服务器

树叶-梨花 2019-08-12 17:08:18  4369  收藏 4
分类专栏： Gstreamer 学习笔记 文章标签： RtspServer RtspClient Rtsp服务器
版权
摘要
基于Gstreamer搭建Rtsp Server并不是基于gst-launch方式，而是额外提供了一个工程。工程git地址：git clone git://anongit.freedesktop.org/gstreamer/gst-rtsp-server 这是因为gst-rtsp-server不是以plugin的形式存在，如果您需要基于Gstreamer构建Rtsp Server，则需要同步上述工程，进行本地编译。

工程编译
预先准备：

1、Install gstreamer-1.0 with base/good/ugly/bad plugins
2、Install autoconf automake autopoint libtool and the other missing essential build tools

编译命令：
1、 cd gst-rtsp-server
2、./autogen.sh
3、如果第执行步骤2没出错，则跳过此步骤。如果出错，并类似如下的错误提示，则需进行版本切换。

.......
checking for glib-mkenums... glib-mkenums
checking for GIO... yes
checking for GST... no
configure: Requested 'gstreamer-1.0 >= 1.17.0.1' but version of GStreamer is 1.8.3
configure: error: no gstreamer-1.0 >= 1.17.0.1 (GStreamer) found
1
2
3
4
5
6
版本切换方法：

查看所有版本分支：git branch -av
在这里插入图片描述
切换到目标版本（笔者是1.8）：git checkout remotes/origin/1.8 -b version1.8 “version1.8”为笔者自定义的分支名称。执行成功后，再次执行git branch -av查看分支是否切换成功？
在这里插入图片描述
然后再次执行步骤2，如果提示缺少什么包，则使用apt-get install安装相应包即可。
遇到缺少包错误及解决办法：

错误1

configure: error: You need to have gtk-doc >= 1.12 installed to build
GStreamer RTSP Server Library configure failed

解决办法：sudo apt-get install gtk-doc-tools

错误2

configure: No package ‘gstreamer-plugins-base-1.0’ found configure:
error: no gstreamer-plugins-base-1.0 >= 1.8.0 (GStreamer Base Plugins)
found configure failed

解决办法：sudo apt-get install libgstreamer-plugins-base1.0-dev libgstreamer-plugins-good1.0-dev libgstreamer-plugins-bad1.0-dev

4、执行编译命令：make

注：要注意查看有没有提示编译错误信息，根据错误信息进行对症下药（一般是缺其它依赖库）。

效果演示
1、切换到examples目录：cd examples
2、搭建Rtsp Server：./test-launch "( videotestsrc ! x264enc ! rtph264pay name=pay0 pt=96 )"
3、播放rtsp流：gst-launch-1.0 playbin uri=rtsp://127.0.0.1:8554/test
在这里插入图片描述

注：笔者的rtsp server 与 client的播放均在同一台PC，因此可以使用127.0.0.1，不同需求可更改IP地址进行适配。

# 4.4. 云解决方案



## 4.5. jasonrivers/nginx-rtmp


ffmpeg推送阿里云流媒体服务器脚本
左羊公社
左羊公社
北漂肄业程序员 公众号：左羊公社
1 人赞同了该文章
最近有位前辈询问左羊能否不借助Java程序直接将多个rtsp协议网络摄像头的视频流推送阿里云的直播域名上面去，有左羊当时琐事较多吧！没有时间去想，今天小羊闲下来了，细细思索下还是直接使用shell编写脚本最为便捷了

环境：linux，ffmpeg，阿里云直播域名

阿里云的推流域名是有安全认证的，所我们在处理推流地址时需要获取时间戳并且计算过期时间再进行MD5加密，这么做主要是为了防止所有人都可向你的服务器推流造成流量经济损失！

首先左羊先大家从ffmepg命令逐级讲解：

ffmpeg -re -rtsp_transport tcp -i $rtspUrl -c:a copy -c:v libx264 -preset:v fast -tune:v zerolatency -max_delay 100 -f flv -g 5 -b 1024k $rtmpUrl
$rtspUrl：rtsp抓流地址
$rtmpUrl：rtmp推流地址
我在这里主要说下rtmp推流地址的组成方式

$rtmp2'?auth_key='$timestamp'-0-0-'$md5Str2
$rtmp2：rtmp推流域名
$timestamp:过期时间戳
$md5Str2：MD5加密串
过期时间戳

#获取当前时间戳
current=`date "+%Y-%m-%d %H:%M:%S"`
timeStampStr=`date -d "$current" +%s` 
timestamp=$((timeStampStr*1000+`date "+%N"`/1000000/1000+1800)) #将timeStampStr转换为过期时间戳，精确到毫
MD5加密串

md5Url2='/'$appName'/202-'$timestamp'-0-0-'$pushIdentKey
md5Str2=$(echo -n $md5Url2 | md5sum | awk '{print $1}')
最后附上完整脚本
```shell

#!/bin/sh
#备注:强烈杜绝中文标点符号
#摄像头数量
cameNum=6
#摄像头推流
came1='rtsp://网络摄像头地址1'
came2='rtsp://网络摄像头地址2'
came3='rtsp://网络摄像头地址3'
came4='rtsp://网络摄像头地址4'
came5='rtsp://网络摄像头地址5'
came6='rtsp://网络摄像头地址6'

#获取当前时间戳
current=`date "+%Y-%m-%d %H:%M:%S"`
timeStampStr=`date -d "$current" +%s` 
timestamp=$((timeStampStr*1000+`date "+%N"`/1000000/1000+1800)) #将timeStampStr转换为过期时间戳，精确到毫秒

#阿里云推流地址
Url='阿里云推流地址'
#拉流名称
appName='live'
#阿里云推流Key
pushIdentKey='阿里云推流Key'

#推流地址
rtmp1='rtmp://'$Url'/'$appName'/102'
rtmp2='rtmp://'$Url'/'$appName'/202'
rtmp3='rtmp://'$Url'/'$appName'/302'
rtmp4='rtmp://'$Url'/'$appName'/402'
rtmp5='rtmp://'$Url'/'$appName'/502'
rtmp6='rtmp://'$Url'/'$appName'/602'

#MD5 加密串
md5Url1='/'$appName'/102-'$timestamp'-0-0-'$pushIdentKey
#MD5 加密
md5Str1=$(echo -n $md5Url1 | md5sum | awk '{print $1}')
#完整推流地址
finallyPushUrl1=$rtmp1'?auth_key='$timestamp'-0-0-'$md5Str1

md5Url2='/'$appName'/202-'$timestamp'-0-0-'$pushIdentKey
md5Str2=$(echo -n $md5Url2 | md5sum | awk '{print $1}')
finallyPushUrl2=$rtmp2'?auth_key='$timestamp'-0-0-'$md5Str2

md5Url3='/'$appName'/302-'$timestamp'-0-0-'$pushIdentKey
md5Str3=$(echo -n $md5Url3 | md5sum | awk '{print $1}')
finallyPushUrl3=$rtmp3'?auth_key='$timestamp'-0-0-'$md5Str3

md5Url4='/'$appName'/402-'$timestamp'-0-0-'$pushIdentKey
md5Str4=$(echo -n $md5Url4 | md5sum | awk '{print $1}')
finallyPushUrl4=$rtmp4'?auth_key='$timestamp'-0-0-'$md5Str4

md5Url5='/'$appName'/502-'$timestamp'-0-0-'$pushIdentKey
md5Str5=$(echo -n $md5Url5 | md5sum | awk '{print $1}')
finallyPushUrl5=$rtmp5'?auth_key='$timestamp'-0-0-'$md5Str5

md5Url6='/'$appName'/602-'$timestamp'-0-0-'$pushIdentKey
md5Str6=$(echo -n $md5Url6 | md5sum | awk '{print $1}')
finallyPushUrl6=$rtmp6'?auth_key='$timestamp'-0-0-'$md5Str6

start(){
   echo "开始推流 ............... "  
	for i in $(seq 1 $cameNum)  
	do   
		rtspUrl=`eval echo '$'"came$i"`
		rtmpUrl=`eval echo '$'"finallyPushUrl$i"`
		if [ -n "$rtspUrl" ]; then
		nohup ffmpeg -re -rtsp_transport tcp -i $rtspUrl -c:a copy -c:v libx264 -preset:v fast -tune:v zerolatency -max_delay 100 -f flv -g 5 -b 1024k $rtmpUrl 2> /dev/null &
	fi
	done   
}

stop(){
	ps -e|grep ffmpeg|awk '{print $1}'|xargs kill -9
}

case $1 in
   start)
      start
   ;;
   stop)
      stop
   ;;
   restart)
      stop
      sleep 2
      start
    ;;
   *)
      echo $"Usage: $0 {start|stop|restart}"  
发布于 2020-05-27

```