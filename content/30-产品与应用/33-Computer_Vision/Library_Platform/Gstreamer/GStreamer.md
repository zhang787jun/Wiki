---
title: "01_GStreamer--基础"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. 什么是 GStreamer

>[GStreamer](https://gstreamer.freedesktop.org/) is a multimedia framework（**框架**）that creates a **pipeline** based workflow for various types of media source.

> GStreamer is a library for constructing graphs of media-handling **components**. The applications it supports range from simple Ogg/Vorbis playback, audio/video streaming to complex audio (mixing) and video (non-linear editing) processing.

GStreamer是一个支持Windows、Linux、Android， iOS的跨平台的多媒体**框架**，应用程序可以通过**管道**（Pipeline）的方式，将多媒体处理的各个步骤串联起来，达到预期的效果。

**基本原理**
每个步骤通过元素（Element）基于GObject对象系统通过插件（plugins）的方式实现，方便了各项功能的扩展。

Plain GStreamer没有插件就无法做任何事情，GStreamer需要各种插件，

## 1.1. 安装

```python
# GStreamer library and plugins
sudo apt install \
    libgstreamer1.0-dev \
    gstreamer1.0-plugins-{base,good,bad} \
    libgstreamer-plugins-{base,good,bad}1.0-dev \
    gstreamer1.0-libav \
    gstreamer1.0-vaapi

```

## 1.2. 组成

gstreamer库主要包含：
1. `gstreamer`: the core package
gst-plugins-base: an essential exemplary set of elements
2. `gst-plugins-<quality>`
   1. `gst-plugins-good`: a set of good-quality plug-ins under LGPL
   2. `gst-plugins-ugly`: a set of good-quality plug-ins that might pose distribution problems
   3. `gst-plugins-bad`: a set of plug-ins that need more quality
3. `gst-libav`: a set of plug-ins that wrap libav for decoding and encoding

4. a few others packages

### 1.2.1. 核心 Core package
### 1.2.2. 插件 Plugins
最下层为各种插件，实现具体的数据处理及音视频输出，应用不需要关注插件的细节，会由Core Framework层负责插件的加载及管理。主要分类为：

1. Protocols：负责各种协议的处理，file，http，rtsp等。
2. Sources：负责数据源的处理，alsa，v4l2，tcp/udp等。
3. Formats：负责媒体容器的处理，avi，mp4，ogg等。
4. Codecs：负责媒体的编解码，mp3，vorbis等。
5. Filters：负责媒体流的处理，converters，mixers，effects等。
6. Sinks：负责媒体流输出到指定设备或目的地，alsa，xvideo，tcp/udp等。



### 1.2.3. 命令行工具gstreamer tools

GStreamer自带了gst-inspect-1.0和gst-launch-1.0等其他命令行工具，我们可以使用这些工具完成常见的处理任务。

#### 1.2.3.1. gst-inspect-1.0

查看gstreamer的plugin、element的信息。直接将plugin/element的类型作为参数，会列出其详细信息。

如果不跟任何参数，会列出当前系统gstreamer所能查找到的所有插件。

```shell
# 列出当前系统gstreamer所能查找到的所有插件
gst-inspect-1.0 playbin
```
#### 1.2.3.2. gst-launch-1.0

用于创建及执行一个Pipline，因此通常使用`gst-launch` 先验证相关功能，然后再编写相应应用。


通过上面ogg视频播放的例子，我们已经看到，**一个pipeline的多个element之间通过 "!" 分隔**，同时可以设置element及Cap的属性。例如：
> **关键**
使用 <**!**> 分割
```shell
# 播放音视频
gst-launch-1.0 playbin file:///home/root/test.mp4

# 转码
gst-launch-1.0 filesrc location=/videos/sintel_trailer-480p.ogv ! decodebin name=decode ! \
videoscale ! "video/x-raw,width=320,height=240" ! x264enc ! queue ! \
mp4mux name=mux ! filesink location=320x240.mp4 decode. ! audioconvert ! \
avenc_aac ! queue ! mux.


# Streaming

# Server
gst-launch-1.0 -v videotestsrc ! "video/x-raw,framerate=30/1" ! x264enc key-int-max=30 ! rtph264pay ! udpsink host=127.0.0.1 port=1234

#Client
gst-launch-1.0 udpsrc port=1234 ! "application/x-rtp, payload=96" ! rtph264depay ! decodebin ! autovideosink sync=fa
```

# 2. 基本概念

## 2.1. Element
Element(GstElement)是GStreamer中最重要的对象类型之一。
1个element实现1个功能（读取文件，解码，输出等），程序需要创建多个element，并按顺序将其串连起来，构成一个完整的pipeline。

### 2.1.1. GstElementFactory
> GstElementFactory is used to create instances of elements

`GstElementFactory` 是用于创建Element实例的函数。
创建GstElement对象，最简单的方法是工厂对象GstElementFactory的gst_element_factory_make()。这个函数使用一个已存在的工厂对象和一个新的元件名来创建元件，GStreamer对应地提供了多种类型的GstElementFactory对象，它们是通过特定的工厂名称来进行区分的。


```C++
//创建工厂实例
srcfactory = gst_element_factory_find ("filesrc");

//创建element实例
element = gst_element_factory_create (srcfactory, "decoder");

element= gst_element_factory_make ("fakesrc", "source");
//
factory = gst_element_factory_find ("haha");

```



## 2.2. Pad

**是什么，干什么的**
Pad是一个element的输入/输出**接口**，每个element可以通过一组Pad（2个pad）**过滤数据**，接收自己支持的数据类型。

**类型**
Pad分为两种：
1. src pad（生产数据）
2. sink pad（消费数据）
   
**规则**
1. 2个element必须通过pad才能连接起来。
2. 1个`src pad`只能与1个`sink pad`相连。

### 2.2.1. Pad Capabilities
Pad通过Pad Capabilities（简称为Pad Caps）来描述支持的数据类型。通过比较src pad和sink pad的Pad Capabilities，程序选择最恰当的数据类型用于传输，如果element不支持，程序会直接退出。


```shell
# 通用格式
# 通过<Pad Capabilities>处理数据
gst-launch-1.0 videotestsrc ! <Pad Capabilities> ! autovideosink
```
例如，下面的命令通过Cap指定了视频的宽高：
```shell
# 指定视频的宽高
# videotestsrc会根据指定的宽高产生相应数据
gst-launch-1.0 videotestsrc ! "video/x-raw,width=1280,height=720" ! autovideosink
```
**Pad Capabilities 示例**

```shell
# 分辨率为300x200，帧率为30fps的RGB视频的Caps： 
"video/x-raw,format=RGB,width=300,height=200,framerate=30/1"

# 采样位宽为16位，采样率44.1kHz，双通道PCM音频的
"audio/x-raw,format=S16LE,rate=44100,channels=2"

# 编码数据格式Voribis，
"audio/x-vorbis"

#  编码数据格式 VP8：
"audio/x-vp8"
```
**数据类型兼容的说明**

1. 1个Pad支持多种类型的Caps
   比如一个video sink可以同时支持RGB或YUV格式的数据，同时可以指定Caps支持的数据范围（比如一个audio sink可以支持1~48k的采样率）。
   
2. 1个Pipeline中只支持1种的数据类型
   1个Pipeline中Pad之间所传输的数据类型必须是唯一的。GStreamer在进行element连接时，会通过协商（negotiation）的方式选择一个双方都支持的类型。

　　因此，为了能使两个Element能够正确的连接，双方的Pad Caps之间必须有交集，从而在协商阶段选择相同的数据类型，这就是Pad Caps的主要作用。在实际使用中，我们可以通过gst-inspect工具查看Element所支持的Pad Caps，从而才能知道在连接出错时如何处理。

### 2.2.2. Pad Templates（模板）

我们曾使用`gst_element_factory_make()`接口创建Element，这个接口内部也会先创建一个Element 工厂(`gst_element_factory`)，再通过工厂方法创建一个Element。

由于大部分Element都需要创建类似的Pad，于是GStreame定义了Pad Template，Pad Template被包含中Element工厂中，在创建Element时，用于快速创建Pad。

Pad Template包含了一个Pad所能支持的所有Caps。通过Pad Template，我们可以快速的判断两个pad是否能够连接（比如两个elements都只提供了sink template，这样的element之间是无法连接的，这样就没必要进一步判断Pad Caps）。


由于Pad Template属于Element工厂，所以我们可以直接使用gst-inspect查看其属性，但Element实际的Pad会根据Element所处的不同状态来进行实例化，具体的Pad Caps会在协商后才会被确定。


### 2.2.3. Pad Availability（有效性）
上面的例子中显示的Pad Template都是一直存在的（Availability: Always），创建的Pad也是一直有效的。但有些Element会根据输入数据以及后续的Element动态增加或删除Pad，

因此GStreamer提供了3种Pad有效性的状态：
1. Always，
2. Sometimes，
3. On request

## 2.3. Bin

`Bin` 是一个容器，用于管理多个element，改变bin的状态时，bin会自动去修改所包含的element的状态，也会转发所收到的消息。如果没有bin，我们需要依次操作我们所使用的element。通过bin降低了应用的复杂度。
## 2.4. Pipeline

`Pipeline` 继承自bin，为程序提供一个bus用于传输消息，并且对所有子element进行同步。当将pipeline的状态设置为PLAYING时，pipeline会在一个/多个新的线程中通过element处理数据。

## 2.5. GstBuffer
　　在GStreamer Pipeline中的plugin间传输的数据块被称为buffer，在GStreamer内部对应于GstBuffer。Buffer由Source Pad产生，并由Sink Pad消耗。一个Buffer只表示一块数据，不同的buffer可能包含不同大小，不同时间长度的数据。同时，某些Element中可能对Buffer进行拆分或合并，所以GstBuffer中可能包含不止一个内存数据，实际的内存数据在GStreamer系统中通过GstMemory对象进行描述，因此，GstBuffer可以包含多个GstMemory对象。
　　每个GstBuffer都有相应的时间戳以及时间长度，用于描述这个buffer的解码时间以及显示时间。





　　appsrc和appsink需要通过特殊的API才能与Pipeline进行数据交互，相应的接口可以查看官方文档，在编译的时候还需连接gstreamer-app库。
# 3. 功能
## 3.1. (解)封装--处理多媒体格式

### 3.1.1. 封装器 muxer
`封装器 (muxer)`，也叫复用器
### 3.1.2. 解封器 demuxer
`解封装器(demuxer)`，也叫解复用器

GStreamer针对常见的容器提供了相应的demuxer。

**自动创建pad**。如果一个容器文件中包含多种媒体数据（例如：一路视频，两路音频），这种情况下，demuxer会为些数据分别创建不同的Source Pad，每一个Source Pad可以被认为一个处理分支，可以创建多个分支分别处理相应的数据。


```shell
gst-launch-1.0 filesrc location=sintel_trailer-480p.ogv ! oggdemux name=demux ! queue ! vorbisdec ! autoaudiosink demux. ! queue ! theoradec ! videoconvert ! autovideosink
```


## 3.2. 编解（转）码

# 4. 进阶
## GStreamer多线程
　　GStreamer框架是一个支持多线程的框架，线程会根据Pipeline的需要自动创建和销毁，例如，将媒体流与应用线程解耦，应用线程不会被GStreamer的处理阻塞。而且，GStreamer的插件还可以创建自己所需的线程用于媒体的处理，例如：在一个4核的CPU上，视频解码插件可以创建4个线程来最大化利用CPU资源。
　　此外，在创建Pipeline时，我们还可以指定某个Pipeline的分支在不同的线程中执行（例如，使audio、video同时在不同的线程中进行解码）。这是通过queue Element来实现的，queue的sink pad仅仅将数据放入队列，另外一个线程从队列中取出数据，并传递到下一个Element。queue通常也被用于作为数据缓冲，缓冲区大小可以通过queue的属性进行配置。

　　在上面的示例Pipeline中，souce是audiotestsrc，会产生一个相应的audio信号，然后使用tee Element将数据分为两路，一路被用于播放，通过声卡输出，另一路被用于转换为视频波形，用于输出到屏幕。

示例图中的红色阴影部分表示位于同一个线程中，queue会创建单独的线程，所以上面的Pipeline使用了3个线程完成相应的功能。拥有多个sink的Pipeline通常需要多个线程，因为在多个sync间进行同步的时候，sink会阻塞当前所在线程直到所等待的事件发生。
# 5. 数据消息交互
在pipeline运行的过程中，各个element以及应用之间不可避免的需要进行数据消息的传输，gstreamer提供了bus系统以及多种数据类型（Buffers、Events、Messages，Queries）来达到此目的：

## 5.1. Bus
Bus是gstreamer内部用于将消息从内部不同的streaming线程，传递到bus线程，再由bus所在线程将消息发送到应用程序。应用程序只需要向bus注册消息处理函数，即可接收到pipline中各element所发出的消息，使用bus后，应用程序就不用关心消息是从哪一个线程发出的，避免了处理多个线程同时发出消息的复杂性。

## 5.2. Buffers
用于从sources到sinks的媒体数据传输。

## 5.3. Events
用于element之间或者应用到element之间的信息传递，比如播放时的seek操作是通过event实现的。

## 5.4. Messages
是由element发出的消息，通过bus，以异步的方式被应用程序处理。通常用于传递errors, tags, state changes, buffering state, redirects等消息。消息处理是线程安全的。由于大部分消息是通过异步方式处理，所以会在应用程序里存在一点延迟，如果要及时的相应消息，需要在streaming线程捕获处理。

## 5.5. Queries
用于应用程序向gstreamer查询总时间，当前时间，文件大小等信息。



## 5.6. 应用程序与Pipeline交互
#### 5.6.0.1. Appsrc与Appsink
GStreamer提供了多种方法使得应用程序与GStreamer Pipeline之间可以进行数据交互，我们这里介绍的是最简单的一种方式：appsrc与appsink。

##### 5.6.0.1.1. appsrc
用于将应用程序的数据发送到Pipeline中。应用程序负责数据的生成，并将其作为GstBuffer传输到Pipeline中。
appsrc有2中模式：
1. 拉模式 pull
   >在拉模式下，appsrc会在需要数据时，通过指定接口从应用程序中获取相应数据。
2. 推模式 push
   >在推模式下，则需要由应用程序主动将数据推送到Pipeline中，应用程序可以指定在Pipeline的数据队列满时是否阻塞相应调用，或通过监听enough-data和need-data信号来控制数据的发送。

##### 5.6.0.1.2. appsink

用于从Pipeline中提取数据，并发送到应用程序中。






# 6. 实践
## 6.1. 初始化

```C++
/* Initialize GStreamer */
gst_init (&argc, &argv);
```
首先我们调用了gstreamer的初始化函数，**该初始化函数必须在其他gstreamer接口之前被调用**，gst_init会负责以下资源的初始化：

1. 初始化GStreamer库
2. 注册内部element
3. 加载插件列表，扫描列表中及相应路径下的插件
4. 解析并执行命令行参数

在不需要gst_init处理命令行参数时，我们可以讲NULL作为其参数，例如：gst_init(NULL, NULL);

## 6.2. 创建Pipeline

> 用字符串描述Pipeline
> 
当我们用字符串描述Pipeline时，每个Element之间需要通过叹号 “!" 分隔Element，这样gst-launch才能正确识别。
　　在使用gst-launch时，根据不同的应用场景，我们可以分为以下的类型。

采用默认的参数创建Pipeline
　　这种方式我们只需将所使用的Element使用叹号分隔即可，例如：

```shell
gst-launch-1.0 videotestsrc ! videoconvert ! autovideosink
```

### 创建rtsp

```markdown
!gst-launch-1.0 rtspsrc location=rtsp://10.1.224.30:55402/PSIA/Streaming/channels/2?videoCodecType=H.264! rtph264depay ! h264parse ! avdec_h264 ! appsink
```


`nvvidconv`: 还有一个用来进行某种视频转换的nvvidconv功能块，该功能块里面需要进行一次Device->Host的传输。在完成了一次性的传输后，这个功能块后面，还有一个CPU上的xvimagesink功能块。

`appsink`: **Sinks**：负责媒体流输出到指定设备或目的地

## 6.3. 播放文件

摘要
在以前的文章中，我们了解到了2种播放文件的方式：一种是在知道了文件的类型及编码方式后，手动创建所需Element并构造Pipeline；另一种是直接使用playbin，由playbin内部动态创建所需Element并连接Pipeline。很明显使用playbin的方式更加灵活，我们不需要在一开始就创建各种Pipeline，只需由playbin内部根据文件类型，自动构造Pipeline。 在了解了Pad的作用后，本文通过一个例子来了解如何通过Pad事件动态的连接Pipeline，为了解playbin内部是如何动态创建Pipeline打下基础。

 

动态连接Pipeline
在本章的例子中，我们在将Pipeline设置为PLAYING状态之前，不会将所有的Element都连接起来，这种处理方式是可以的，但需要额外的处理。如果在设置PLAYING状态后不做任何操作，数据无法到达Sink，Pipeline会直接抛出一个错误并退出。如果在收到相应事件后，对其进行处理，并将Pipeline连接起来，Pipeline就可以正常工作。

我们常见的媒体，音频和视频都是通过某一种容器格式被包含中同一个文件中。播放时，我们需要将音视频数据分离出来，通常将具备这种功能的模块称为分离器（demuxer）。

GStreamer针对常见的容器提供了相应的demuxer，如果一个容器文件中包含多种媒体数据（例如：一路视频，两路音频），这种情况下，demuxer会为些数据分别创建不同的Source Pad，每一个Source Pad可以被认为一个处理分支，可以创建多个分支分别处理相应的数据。

```shell 
gst-launch-1.0 filesrc location=sintel_trailer-480p.ogv ! oggdemux name=demux ! queue ! vorbisdec ! autoaudiosink demux. ! queue ! theoradec ! videoconvert ! autovideosink
```
通过上面的命令播放文件时，会创建具有2个分支的Pipeline：



使用demuxer需要注意的一点是：demuxer只有在收到足够的数据时才能确定容器中包含哪些媒体信息，因此demuxer开始没有Source Pad，所以其他的Element无法在Pipeline创建时就连接到demuxer。
解决这种问题的办法是：在创建Pipeline时，我们只将Source Element到demuxer之间的Elements连接好，然后设置Pipeline状态为PLAYING，当demuxer收到足够的数据可以确定文件总包含哪些媒体流时，demuxer会创建相应的Source Pad，并通过事件告诉应用程序。我们可以通过监听demuxer的事件，在新的Source Pad被创建时，我们根据数据类型，创建相应的Element，再将其连接到Source Pad，形成完整的Pipeline。

## 6.4. Streaming 在线播放

### 6.4.1. 概述
　　我们把直接从网络播放一个媒体文件的方式称为在线播放（Online Streaming），我们已经在以往的例子中体验了GStreamer的在线播放功能，当我们指定播放URI为 http:// 时，GStreamer内部会自动通过网络获取媒体数据。在今天的示例中，我们将进一步了解如何处理由网络问题导致的视频缓冲及时钟丢失的问题。

### 6.4.2. 在线播放
　　在我们进行在线播放时，我们会将收到的媒体数据立即进行解码并送入显示队列显示。当网络不理想时，我们通常不能及时的接收数据，显示队列中的数据会被耗尽而不能得到及时的补充，这会导致播放出现卡顿。
　　一种通用的处理方式是创建一个**缓冲队列**，在队列的数据量达到一定阀值时才进行播放，这样会导致起播时间会有一定的延迟，但会使后续的播放更加流畅，避免了因部分数据无法及时到达造成的停顿。
　　GStreamer框架已经实现了缓冲队列，但在以往的示例中我们并没有使用其相关的功能。
>某些Element（例如playbin中使用的queue2及multiqueue）可以创建缓冲队列，并在超过/低于指定的数据阀值时产生相应的信号。

应用程序可以监听此类信号，在数据不足时（buffer值小于100%）主动暂停播放，在数据充足时恢复播放。
　　为了达到多个Sink的同步（例如音视频同步），我们需要使用一个全局的参考时钟，GStreamer会在播放时自动选取一个时钟。在某些网络在线播放的情况下原有时钟会失效，我们需要重新选取一个参考时钟。例如，RTP Source切换流或者改变输出设备。
　　在参考时钟丢失时，GStreamer框架会产生相应的事件，应用层需要对其作出响应，由于GStreamer在进入PLAYING状态时会自动选取参考时钟，所以我们只需在收到时钟丢失事件时将Pipeline的状态切换到PUASED，再切换到PLAYING即可。

```shell

# Streaming

# Server
gst-launch-1.0 -v videotestsrc ! "video/x-raw,framerate=30/1" ! x264enc key-int-max=30 ! rtph264pay ! udpsink host=127.0.0.1 port=1234

#Client
gst-launch-1.0 udpsrc port=1234 ! "application/x-rtp, payload=96" ! rtph264depay ! decodebin ! autovideosink sync=fa
```

