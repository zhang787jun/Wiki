---
title: "什么是runtime"
layout: page
date: 2099-06-02 00:00
---

Runtime describes software/instructions that are executed while your program is running, especially those instructions that you did not write explicitly, but are necessary for the proper execution of your code.

Low-level languages like C have very small (if any) runtime. More complex languages like Objective-C, which allows for dynamic message passing, have a much more extensive runtime.

You are correct that runtime code is library code, but library code is a more general term, describing the code produced by any library. Runtime code is specifically the code required to implement the features of the language itself.

# runtime library

runtime library 是被编译器使用，将（通过特定编程语言实现的）函数执行的库。


In computer programming, a runtime library is a special program library used by a compiler, to implement functions built into a programming language, during the runtime (execution) of a computer program. This often includes functions for input and output, or for memory management.

# run-time system

A run-time system (also called runtime system or just runtime) is software designed to support the execution of computer programs written in some computer language. The run-time system contains implementations of basic low-level commands and may also implement higher-level commands and may support type checking, debugging, and even code generation and optimization. Some services of the run-time system are accessible to the programmer through an application programming interface, but other services (such as task scheduling and resource management) may be inaccessible.

