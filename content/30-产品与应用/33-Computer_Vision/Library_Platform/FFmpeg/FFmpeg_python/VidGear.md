---
title: "01_VidGear--FFmpeg的python实现"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# VidGear 是什么
> [VidGear](https://abhitronix.github.io/vidgear/) is a High-Performance Framework that provides an one-stop Video-Processing solution for building real-time media applications in python
VidGearOverviewVidGearOverview

# 解码
vidgear 后端使用 OpenCV video decoding, 而不是原生的 ffmpeg

 too slow for vidgear - ffmpeg might be better suited for decoding


 OpenCV seamlessly support multiple backends, which include powerful GStreamer, libav and FFmpeg itself too.
OpenCV is available on pretty much every Linux distribution, while FFmpeg might not be (for legal reasons).
OpenCV itself is available under flexible 3-clause BSD license while FFmpeg you have to make sure that no GPL components are enabled (some notable examples are x264 (H264 encoder) and libac3 (Dolby AC3 audio codec)). See https://www.ffmpeg.org/legal.html for details.
Plus FFmpeg is still buggy to be completely adopted reliably in my experience.
This is some of the reason why it's not a good idea. Being said that, we can still implement another Videocapture gear which works purely on FFmpeg. Thanks for this idea anyways.

