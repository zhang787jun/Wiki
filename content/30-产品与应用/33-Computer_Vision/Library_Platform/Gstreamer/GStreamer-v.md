---
title: "02_gstreamer-vaapi--支持VA-API的GStreamer"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 什么是 gstreamer-vaapi

VA-API support to GStreamer
* `vaapi<_CODEC_>dec` is used to decode JPEG, MPEG-2, MPEG-4:2, H.264, AVC, H.264 MVC, VP8, VP9, VC-1, WMV3, HEVC videos to VA surfaces,
depending on the actual value of <_CODEC_> and the underlying hardware capabilities.  This plugin is also able to implicitly download the decoded surface to raw YUV buffers.

* `vaapi<_CODEC_>enc` is used to encode into MPEG-2, H.264 AVC, H.264, MVC, JPEG, VP8, VP9, HEVC videos, depending on the actual value of <_CODEC_> (mpeg2, h264, etc.) and the hardware capabilities. Bydefault, raw format bitstreams are generated, so the result may be piped to a muxer, e.g. qtmux for MP4 containers.

* `vaapipostproc` is used to filter VA surfaces, for e.g. scaling, deinterlacing (bob, motion-adaptive, motion-compensated), noise reduction or sharpening. This plugin is also used to upload raw YUV pixels into VA surfaces.

* `vaapisink` is used to render VA surfaces to an X11 or Wayland display. This plugin also features a "headless" mode (DRM) more suited to remote transcode scenarios, with faster throughput.

* `vaapioverlay` is a accelerated compositor that blends or composite different video streams.

# 2. Features

  * VA-API support from 0.39
  * JPEG, MPEG-2, MPEG-4, H.264 AVC, H.264 MVC, VP8, VC-1, HEVC and VP9 ad-hoc **decoders**
  * MPEG-2, H.264 AVC,H.264 MVC, JPEG, VP8, VP9 and HEVC ad-hoc **encoders**
  * OpenGL rendering through VA/GLX or GLX texture-from-pixmap + FBO
  * Support for EGL backend
  * Support for the Wayland display server
  * Support for headless decode pipelines with VA/DRM
  * Support for major HW video decoding solutions on Linux (AMD,Intel, NVIDIA)
  * Support for HW video encoding on Intel HD Graphics hardware
  * Support for VA Video Processing APIs (VA/VPP)
    - Scaling and color conversion
    - Image enhancement filters: Sharpening, Noise Reductio, Color Balance, Skin-Tone-Enhancement
    - Advanced deinterlacing: Motion-Adaptive, Motion-Compensated

# 3. Requirements
## 3.1. Hardware requirements
  * Hardware supported by i965 driver or iHD, such as
    - Intel Ironlake, Sandybridge, Ivybridge, Haswell, Broadwell,
      Skylake, etc. (HD Graphics)
    - Intel BayTrail, Braswell
    - Intel Poulsbo (US15W)
    - Intel Medfield or Cedar Trail
  * Hardware supported by AMD Radeonsi driver, such as the list below
    - AMD Carrizo, Bristol Ridge, Raven Ridge, Picasso, Renoir
    - AMD Tonga, Fiji, Polaris XX, Vega XX, Navi 1X
  * Other hardware supported by Mesa VA gallium state-tracker


# 4. Usage

VA elements are automatically plugged into GStreamer pipelines. So using playbin should work as is.

However, here are a few alternate pipelines that could be manually constructed.

  * Play an H.264 video with an MP4 container in fullscreen mode
```shell
  $ gst-launch-1.0 -v filesrc location=/path/to/video.mp4 ! \
      qtdemux ! vaapidecodebin ! vaapisink fullscreen=true

```
  * Play a raw MPEG-2 interlaced stream
```shell 
  $ gst-launch-1.0 -v filesrc location=/path/to/mpeg2.bits ! \
      mpegvideoparse ! vaapimpeg2dec ! vaapipostproc ! vaapisink
```

  * Convert from one pixel format to another, while also downscaling
```shell
$ gst-launch-1.0 -v filesrc location=/path/to/raw_video.yuv ! \
    videoparse format=yuy2 width=1280 height=720 ! \
    vaapipostproc format=nv12 height=480 ! vaapisink
```

  * Encode a 1080p stream in raw I420 format into H.264
```shell
$ gst-launch-1.0 -v filesrc location=/path/to/raw_video.yuv ! \
    videoparse format=i420 width=1920 height=1080 framerate=30/1 ! \
    vaapih264enc rate-control=cbr tune=high-compression ! \
    qtmux ! filesink location=/path/to/encoded_video.mp4
```