---
title: "进程间通信(IPC,Inter-Process Communication)"
layout: page
date: 2099-06-02 00:00
---

[TOC]

进程间通信(IPC,Inter-Process Communication)指至少两个进程或线程间传送数据或信号的一些技术或方法。

使用IPC的理由：
1. 信息共享：Web服务器，通过网页浏览器使用进程间通信来共享web文件（网页等）和多媒体；
2. 加速：维基百科使用通过进程间通信进行交流的多服务器来满足用户的请求；
3. 模块化；
4. 私有权分离。
与直接共享内存地址空间的多线程编程相比，IPC的缺点：
1. 采用了某种形式的内核开销，降低了性能;
3. 几乎大部分IPC都不是程序设计的自然扩展，往往会大大地增加程序的复杂度。


**主要方法编辑**

| 方法               | 提供方（操作系统或其他环境）                         |
| ------------------ | ---------------------------------------------------- |
| 文件               | 多数操作系统                                         |
| 信号               | 多数操作系统                                         |
| Berkeley套接字     | 多数操作系统                                         |
| 消息队列           | 多数操作系统                                         |
| 管道               | 所有的POSIX系统，Windows                             |
| 命名管道           | 所有的POSIX系统，Windows                             |
| 信号量             | 所有的POSIX系统，Windows                             |
| 共享内存           | 所有的POSIX系统，Windows                             |
| Message Passing    | 用于MPI规范，Java RMI，CORBA，MSMQ，MailSlot以及其他 |
| Memory-Mapped File | 所有的POSIX系统，Windows                             |