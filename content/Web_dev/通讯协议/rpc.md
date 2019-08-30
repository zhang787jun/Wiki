---
title: "远程过程调用协议 RPC"
layout: page
date: 2019-06-17 00:00
---

RPC（Remote Procedure Call）


传输（Transport）
TCP 协议是 RPC 的 基石，一般来说通信是建立在 TCP 协议之上的，而且 RPC 往往需要可靠的通信，因此不采用 UDP。

这里重申下 TCP 的关键词：面向连接的，全双工，可靠传输（按序、不重、不丢、容错），流量控制（滑动窗口）。

另外，要理解 RPC 中的嵌套 header+body，协议栈每一层都包含了下一层协议的全部数据，只不过包了一个头而已，如下图所示的 TCP segment 包含了应用层的数据，套了一个头而已。

RPC 框架可选择的 I/O 模型严格意义上有 5 种，这里不讨论基于 信号驱动 的 I/O（Signal Driven I/O）。这几种模型在《UNIX 网络编程》中就有提到了，它们分别是：

传统的阻塞 I/O（Blocking I/O）
非阻塞 I/O（Non-blocking I/O）
I/O 多路复用（I/O multiplexing）
异步 I/O（Asynchronous I/O）


说起RPC，就不能不提到分布式，这个促使RPC诞生的领域。

假设你有一个计算器接口，Calculator，以及它的实现类CalculatorImpl，那么在系统还是单体应用时，你要调用Calculator的add方法来执行一个加运算，直接new一个CalculatorImpl，然后调用add方法就行了，这其实就是非常普通的本地函数调用，因为在同一个地址空间，或者说在同一块内存，所以通过方法栈和参数栈就可以实现。