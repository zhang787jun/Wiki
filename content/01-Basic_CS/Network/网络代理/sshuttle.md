---
title: "sshuttle 使用"
layout: page
date: 2019-06-17 00:00
---
[TOC]



# 1. 安装
```shell
sudo apt install sshuttle
```

# 使用


```shell
docker run -e PASSWORD=abc123456 -p 21022:8388 -p 21022:8388/udp -d shadowsocks/shadowsocks-libev


```

```shell


sshuttle -r <remote node user>@<remote node ip>
sshuttle -r username@remotehost 0.0.0.0/0

sshuttle -l 21015 -r zhangj414@10.0.77.98/0

export NAMESPACE=istio-system
kubectl port-forward --address 0.0.0.0 -n ${NAMESPACE} svc/istio-ingressgateway 8080:80
```
![](https://upload-images.jianshu.io/upload_images/7914265-c48d65b233906c6a.png?imageMogr2/auto-orient/strip|imageView2/2/w/962/format/webp)