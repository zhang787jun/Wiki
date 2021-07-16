---
title: "05-NNCF"
layout: page
date: 2099-06-02 00:00
---
[TOC]



NNCF
NNCF是intel推出的专门针对OpenVINO的模型压缩框架，也有一篇专门的tech report对其进行介绍。个人认为这是目前看到的最多的考虑了实用性并经过了较多打磨的一个库，不足之处是他忽略了一个非常重要的特性，不支持QAT中的merge BN。大概说一下NNCF的特点：