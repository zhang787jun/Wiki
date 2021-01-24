---
title: "02_ffprobe组件--查看多媒体文件信息的模块"
layout: page
date: 2099-06-02 00:00
---

[TOC]
# ffprobe 是什么
ffprobe是ffmpeg中一个查看多媒体文件信息的模块。此模块可以用来查看多媒体文件格式以及编码。

```shell
ffprobe
>>>
ffprobe version 3.4.8-0ubuntu0.2 Copyright (c) 2007-2020 the FFmpeg developers
  built with gcc 7 (Ubuntu 7.5.0-3ubuntu1~18.04)
```

ffprobe的命令较多，这里只简单的列举了一些比较常用的命令。


```shell

-L 显示协议
-h/-?/-help/--help topic 帮助可以选择话题
-version 显示版本
-buildconf 展示编译配置选项
-formats 显示支持的编码
-muxers 展示支持的封装器
-demuxers 展示支持的解封装器
-devices 展示支持的设备
-codecs 展示支持的编码
-decoders 显示支持的解码器
-encoders 显示支持的编码器
-bsfs 显示支持的比特流过滤器
-protocols 展示支持的协议
-filters 展示支持的过滤器
-pix_fmts 显示支持的像素格式
-layouts 展示支持的声道格式
-sample_fmts 显示支持的采样格式
-colors 展示支持的颜色名称
-loglevel loglevel 设置日志级别
-v loglevel 设置日志级别
-report 生成报告
-max_alloc bytes 设置单个已分配块的最大大小
-cpuflags flags 指定cpu标志
-hide_banner hide_banner 不显示程序横幅
-sources device 列出源的输出设备
-sinks device 列出输出设备的接收器
-f format 指定格式
-unit 显示显示值的单位
-prefix 对显示的值使用SI前缀
-byte_binary_prefix 对字节单位使用二进制前缀
-sexagesimal 对时间单位使用六十进制格式 HOURS:MM:SS.MICROSECONDS 
-pretty 美化显示输出的值，让人可读
-print_format format 设置打印格式 (available formats are: default, compact, csv, flat, ini, json, xml)
-of format -print_format的编码
-select_streams stream_specifier 选择指定的stream
-sections 打印节结构和节信息，然后退出
-show_data 显示数据包信息
-show_data_hash 显示数据包hash值
-show_error 显示探测中的错误
-show_format 显示格式/容器信息
-show_frames 显示帧信息
-show_format_entry entry 显示格式/容器信息中的特定条目
-show_entries entry_list 显示一组指定的项
-show_log 显示log
-show_packets 显示packet信息
-show_programs  显示程序信息
-show_streams 显示stream的信息
-show_chapters 显示chapters的信息
-count_frames 每个stream中的帧数
-count_packets 每个stream中的包数量
-show_program_version ffprobe的版本
-show_library_versions 库的版本
-show_versions 程序和库的版本号
-show_pixel_formats 展示像素格式描述
-show_private_data 显示私有数据
-private 和显示私有数据一样
-bitexact 强制提取bit输出
-read_intervals read_intervals 设置读取间隔
-default 默认所有选项
-i input_file 读取指定文件
-print_filename print_file 重新显示输入的文件名
-find_stream_info 读取并解码流，用启发式方法填充缺失的信息
```