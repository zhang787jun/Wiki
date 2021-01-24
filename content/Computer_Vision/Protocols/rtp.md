---
title: "01_RTSP协议"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 什么是RTSP
Real-Time Streaming Protocol.


# RTSP in ffmeg
RTSP is not technically a protocol handler in libavformat, it is a demuxer and muxer. The demuxer supports both normal RTSP (with data transferred over RTP; this is used by e.g. Apple and Microsoft) and Real-RTSP (with data transferred over RDT).
##  编码器muxer
The muxer can be used to send a stream using RTSP ANNOUNCE to a server supporting it (currently Darwin Streaming Server and Mischa Spiegelmock’s RTSP server).

The required syntax for a RTSP url is:

```
rtsp://hostname[:port]/path
```
Options can be set on the ffmpeg/ffplay command line, or set in code via AVOptions or in avformat_open_input.

The following options are supported.

initial_pause
Do not start playing the stream immediately if set to 1. Default value is 0.

rtsp_transport
Set RTSP transport protocols.

It accepts the following values:

‘udp’
Use UDP as lower transport protocol.

‘tcp’
Use TCP (interleaving within the RTSP control channel) as lower transport protocol.

‘udp_multicast’
Use UDP multicast as lower transport protocol.

‘http’
Use HTTP tunneling as lower transport protocol, which is useful for passing proxies.

Multiple lower transport protocols may be specified, in that case they are tried one at a time (if the setup of one fails, the next one is tried). For the muxer, only the ‘tcp’ and ‘udp’ options are supported.

rtsp_flags
Set RTSP flags.

The following values are accepted:

‘filter_src’
Accept packets only from negotiated peer address and port.

‘listen’
Act as a server, listening for an incoming connection.

‘prefer_tcp’
Try TCP for RTP transport first, if TCP is available as RTSP RTP transport.

Default value is ‘none’.

allowed_media_types
Set media types to accept from the server.

The following flags are accepted:

‘video’
‘audio’
‘data’
By default it accepts all media types.

min_port
Set minimum local UDP port. Default value is 5000.

max_port
Set maximum local UDP port. Default value is 65000.

timeout
Set maximum timeout (in seconds) to wait for incoming connections.

A value of -1 means infinite (default). This option implies the rtsp_flags set to ‘listen’.

reorder_queue_size
Set number of packets to buffer for handling of reordered packets.

stimeout
Set socket TCP I/O timeout in microseconds.

user-agent
Override User-Agent header. If not specified, it defaults to the libavformat identifier string.

When receiving data over UDP, the demuxer tries to reorder received packets (since they may arrive out of order, or packets may get lost totally). This can be disabled by setting the maximum demuxing delay to zero (via the max_delay field of AVFormatContext).

When watching multi-bitrate Real-RTSP streams with ffplay, the streams to display can be chosen with -vst n and -ast n for video and audio respectively, and can be switched on the fly by pressing v and a.

# Server  媒体服务器

## Darwin Streaming Server 

Darwin Streaming Server 编辑 讨论 上传视频
Darwin Streaming Server简称DSS。DSS是Apple公司提供的开源实时流媒体播放服务器程序。整个程序使用C++编写，在设计上遵循高性能，简单，模块化等程序设计原则，务求做到程序高效，可扩充性好。并且DSS是一个开放源代码的，基于标准的流媒体服务器，可以运行在Windows NT和Windows 2000，以及几个UNIX实现上，包括Mac OS X，Linux，FreeBSD，和Solaris操作系统上的。

## rtsp-server
[rtsp-server](https://github.com/revmischa/rtsp-server) 一般是指 revmischa 写的一个开源的轻量级RTSP/RTP 流媒体服务 (Lightweight RTSP/RTP streaming media server)

