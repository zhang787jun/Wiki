---
title: "02_pyav--FFmpeg的python实现"
layout: page
date: 2099-06-02 00:00
---

[TOC]

官网 https://pyav.org/docs/stable/

PyAV库使用介绍
PyAV
Posted by Shaozi on March 26, 2020
目前使用最广泛的视频编解码库为FFmepg，虽然该库有Python的封装ffmpeg-python，但是该封装功能简单，只能替代在python中调用命令行工具罢了。PyAV同样是FFmpeg封装，不过功能更为强大，能够灵活的编解码视频和音频，并且支持Python常用的数据格式（如numpy）。由于PyAV在ffmpeg的基础上进行开发，所以并不会提升编解码的效率。但是能够方便Python的开发者对视频或者音频数据进行处理。在模型的训练测试中能够发挥很好的作用。

安装
```shell
# 通过conda-forge，该方法会同时安装需要的ffmpeg库，比较方便
conda install av -c conda-forge
```

```shell
# 如果想使用现有的ffmpeg库，可以使用pip安装
pip install av
```
```shell
# 另外也可以通过源码安装
git clone git@github.com:mikeboers/PyAV
cd PyAV
source scripts/activate.sh
## Either install the testing dependencies:
pip install --upgrade -r tests/requirements.txt
## or have it all, including FFmpeg, built/installed for you:
./scripts/build-deps
## Build PyAV.
make
使用示例
```
抽取所有帧
```shell
import av

container = av.open(path_to_video)

for frame in container.decode(video=0):
    frame.to_image().save('frame-%04d.jpg' % frame.index)
```
抽取关键帧
```shell
import av
import av.datasets


content = 'video_pth'
with av.open(content) as container:
    # Signal that we only want to look at keyframes.     stream = container.streams.video[0]
    stream.codec_context.skip_frame = 'NONKEY'

    for frame in container.decode(stream):

        print(frame)

        # We use `frame.pts` as `frame.index` won't make must sense with the `skip_frame`.         frame.to_image().save(
            'night-sky.{:04d}.jpg'.format(frame.pts),
            quality=80,
        )
```
合成视频
```shell

import numpy as np
import av

duration = 4
fps = 24
total_frames = duration * fps
container = av.open('test.mp4', mode='w')
stream = container.add_stream('mpeg4', rate=fps)
stream.width = 480
stream.height = 320
stream.pix_fmt = 'yuv420p'

for frame_i in range(total_frames):

    img = np.empty((480, 320, 3))
    img[:, :, 0] = 0.5 + 0.5 * np.sin(2 * np.pi * (0 / 3 + frame_i / total_frames))
    img[:, :, 1] = 0.5 + 0.5 * np.sin(2 * np.pi * (1 / 3 + frame_i / total_frames))
    img[:, :, 2] = 0.5 + 0.5 * np.sin(2 * np.pi * (2 / 3 + frame_i / total_frames))

    img = np.round(255 * img).astype(np.uint8)
    img = np.clip(img, 0, 255)

    frame = av.VideoFrame.from_ndarray(img, format='rgb24')
    for packet in stream.encode(frame):
        container.mux(packet)
# Flush stream for packet in stream.encode():
    container.mux(packet)
# Close the file container.close()
提取音频
import av
in_container = av.open(video_path)
in_stream = in_container.streams.get(audio=0)[0]

out_container = av.open(self.audio_pth, 'w')
out_stream = out_container.add_stream('mp3')

for frame in in_container.decode(in_stream):
    print('\rAudio frame: pts %d, time %f'%(frame.pts, frame.time), end = '')
    frame.pts = None
    for packet in out_stream.encode(frame):
        out_container.mux(packet)
    for packet in out_stream.encode(None):
        out_container.mux(packet)
    out_container.close()
提取音频帧
import av
import numpy as np
in_container = av.open(audio_path)
stream = in_container.streams.get(audio=0)[0]
for frame in in_container.decode(stream):
    print('\rFrame info: pts %d, time %f'%(frame.pts, frame.time), end = '')
    frame_value = frame.to_ndarray()[0]
访问网络视频流
import av
import cv2

#video = av.open('rtsp://admin:ts123456@10.21.38.241:554', 'r') video = av.open('url', 'r')
index = 0
try:
    for frame in video.decode():
        img = frame.to_nd_array(format='bgr24')
        cv2.imshow("Test", img)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
except Exception as e:
    print('fate erro:{}'.format(e))
cv2.destroyAllWindows()
```
以上代码示例基本满足通常使用需求，更多内容可以参考文档和git主页
# 实践

## 关键帧提取
```python
import av
import av.datasets


content = av.datasets.curated('pexels/time-lapse-video-of-night-sky-857195.mp4')
with av.open(content) as container:
    # Signal that we only want to look at keyframes.
    stream = container.streams.video[0]
    stream.codec_context.skip_frame = 'NONKEY'

    for frame in container.decode(stream):

        print(frame)

        # We use `frame.pts` as `frame.index` won't make must sense with the `skip_frame`.
        frame.to_image().save(
            'night-sky.{:04d}.jpg'.format(frame.pts),
            quality=80,
        )
```