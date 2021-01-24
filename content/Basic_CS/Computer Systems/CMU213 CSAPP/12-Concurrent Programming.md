---
title: "01-Concurrent Programming(并发编程)"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 基础


死锁（Deadlock）： 十字路口，4辆车都同时要通过，结果谁都过不去。

# 并发

`并发` ： 指在同一时刻，有多条指令在多个处理器上**同时**执行。所以无论从微观还是从宏观来看，二者都是一起执行的。


`并行`：指在同一时刻只能有一条指令执行，但多个进程指令被快速的轮换执行，使得在宏观上具有多个进程同时执行的效果，但在微观上并**不是同时**执行的，只是把时间分成若干段，使多个进程**快速交替**的执行。


## 内核级并发与程序级并发

现代操作系统提供了3种基本的构造并发程序的方法：

1. 多进程、
2. I/O多路复用、
3. 多线程。

# 基于进程的并发编程

每个逻辑控制流都是一个进程，由内核来调度和维护。因为进程有独立的虚拟地址空间，所以要想和其他进程通信，控制流必须使用某种显式的进程间通信机制（比较慢）。 如服务器端监听特定的端口，当有新的客户端连接时，创建新的端口号，并派生一个子进程，子进程使用这个新的端口号与客户端进行通信。这样，当有多个客户端连接时，它们将以多进程的方式并发地执行。 子进程与父进程共享文件表，但是不共享用户地址空间。
# 基于I/O多路复用(事件)的并发编程

应用程序在一个进程的上下文中显式地调度它们自己的逻辑流，逻辑流被模型化为状态机，数据达到文件描述符后，主程序显式地从一个状态机换到另一个状态机。因为程序是一个单独的进程，所以所有的流都共享同一个地址空间。 基本的思路是使用select函数，要求内核在发生读写操作时挂起进程，只有在一个或多个I/O事件发生后，才将控制返回给应用程序。

// 返回已准备好的描述符的个数

int select(int n, fd_set *fdset, NULL, NULL, NULL);

I/O多路复用可以作为并发事件驱动程序的基础。在事件驱动程序中，将逻辑流模型化为状态机，一个状态机就是一组状态、输入事件和转移。其中转移就是将状态和输入事件映射到新的状态。对于每个新的客户端，基于I/O多路复用的并发服务器会创建一个新的状态机，并将它和已连接的描述符联系起来。每个状态机都有一个状态：等待相应的描述符准备好可读；一个输入事件：描述符可读了；一个转移：从描述符读一个文本行。 服务器使用I/O多路复用，借助select函数检测输入事件的发生，当每个已连接描述符准备好可读时，服务器就为相应的状态机执行转移。

基于I/O多路复用的事件驱动服务器是运行在单一进程上下文中的，因此每个逻辑流都能访问该进程的全部地址空间，这使得在流之间共享数据非常容易。

# 基于线程的并发编程

线程是运行在进程上下文中的逻辑流，由内核自动调度，每个线程都有自己的线程上下文，包括唯一的线程ID、栈、程序计数器、通用目的寄存器和条件码等。所有运行在一个进程里的线程共享该进程的整个虚拟地址空间。

基于线程的逻辑流结合了基于进程和基于I/O多路复用的流的特性，同进程一样，线程由内核自动调度，并且内核会通过一个整数ID来识别线程。同基于I/O多路复用的流一样，多个线程运行在单一进程的上下文中，因此共享这个进程虚拟地址空间的整个内容：代码、数据、堆、共享库、打开的文件。

每个进程开始时都是单一线程，这个线程称为主线程，之后在某一时刻主线程创建一个对等线程（peer thread），然后两个线程就并发地运行。当主线程执行一个慢速系统调用时，因为它被系统的间隔计时器中断，控制就会通过切换上下文传递到对等线程，对等线程执行一段时间后再将控制传递回主线程。

线程不同于进程的方面在于线程的上下文要比进程小很多，线程的上下文切换也比进程的上下文切换开销小。此外不像进程那样严格地按照父子层次来组织，一个进程的所有线程组成一个对等线程池，独立于其他进程创建的线程。因为有对等线程池，一个线程可以杀死它的任何对等线程，或者等待它的任意对等线程终止。每个对等线程都能读写相同的共享数据。



Posix线程是在C程序中处理线程的一个标准接口，在大多数Unix系统上都可用，定义了大约60个函数（以Pthread_开头），可以执行创建、杀死、回收线程，与对等线程安全地共享数据，通知对等线程系统状态的变化等等。
多线程程序中的共享变量

信号量，P、V操作，同步、互斥等，略。
