---
title: "01 音视频协议Protocols. 基础"
layout: page
date: 2099-06-02 00:00
---

[TOC]


# 1. 常用协议

RTMP、RTSP、HTTP协议这三个协议都属于互联网 TCP/IP 五层体系结构中应用层的协议。理论上这三种都可以用来做视频直播或点播。

通常来说，直播实时录制. 一般用 RTMP、RTSP。而点播视频内容已经存放在服务器. 用 HTTP。

## 1.1. RTMP协议
1. 是流媒体协议。
2. RTMP协议是 Adobe 的私有协议，未完全公开。
3. RTMP协议一般传输的是 flv，f4v 格式流。
4. RTMP一般在 TCP 1个通道上传输命令和数据。

## 1.2. RTSP协议
1. 是流媒体协议。
2. RTSP协议是共有协议，并有专门机构做维护。.
3. RTSP协议一般传输的是 ts、mp4 格式的流。
4. RTSP传输一般需要 2-3 个通道，命令和数据通道分离。

## 1.3. HTTP协议
1. 不是是流媒体协议。
2. HTTP协议是共有协议，并有专门机构做维护。 
3. HTTP协议没有特定的传输流。 
4. HTTP传输一般需要 2-3 个通道，命令和数据通道分离


# 2. 参考资料

1. [ffmpeg 官网--Protocols](https://www.ffmpeg.org/ffmpeg-all.html#Protocols)