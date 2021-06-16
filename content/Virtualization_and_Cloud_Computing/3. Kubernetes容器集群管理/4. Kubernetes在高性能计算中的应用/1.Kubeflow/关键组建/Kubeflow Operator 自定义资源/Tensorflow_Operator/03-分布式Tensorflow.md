---
title: "使用TFjob定义分布式Tensorflow 任务"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# Tensorboard 

```shell
cat << EOF >  tensorboard.yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  labels:
    app: tensorboard
  name: tensorboard
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tensorboard
  template:
    metadata:
      labels:
        app: tensorboard
    spec:
      volumes:
        - name: tensorboardfile
          persistentVolumeClaim:
            claimName: tensorboard-pvc
      containers:
      - name: tensorboard
        image: tensorflow/tensorflow:1.10.0
        imagePullPolicy: Always
        command:
         - /usr/local/bin/tensorboard
        args:
        - --logdir
        - /tmp/tensorflow/logs
        volumeMounts:
          - mountPath: /tmp/tensorflow
            subPath: module7-ex1-gpu
            name: tensorboardfile
        ports:
        - containerPort: 6006
          protocol: TCP
      dnsPolicy: ClusterFirst
      restartPolicy: Always
EOF

kubectl apply -f tensorboard.yaml
```