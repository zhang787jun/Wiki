---
title: "test"
layout: page
date: 2099-06-02 00:00
---

```shell

apiVersion: "sparkoperator.k8s.io/v1beta2"
kind: SparkApplication
metadata:
  name: spark-pi
  namespace: default
spec:
  type: Scala
  mode: cluster
  image: "registry.aliyuncs.com/acs/spark-pi:ack-2.4.5-latest"
  imagePullPolicy: Always
  mainClass: org.apache.spark.examples.SparkPi
  mainApplicationFile: "local:///opt/spark/examples/jars/spark-examples_2.11-2.4.5.jar"
  sparkVersion: "2.4.5"
  restartPolicy:
    type: Never
  driver:
    cores: 2
    coreLimit: "2"
    memory: "3g"
    memoryOverhead: "1g"
    labels:
      version: 2.4.5
    serviceAccount: spark
    annotations:
      k8s.aliyun.com/eci-kube-proxy-enabled: 'true'
      k8s.aliyun.com/eci-image-cache: "true"
    tolerations:
    - key: "virtual-kubelet.io/provider"
      operator: "Exists"
  executor:
    cores: 2
    instances: 1
    memory: "3g"
    memoryOverhead: "1g"
    labels:
      version: 2.4.5
    annotations:
      k8s.aliyun.com/eci-kube-proxy-enabled: 'true'
      k8s.aliyun.com/eci-image-cache: "true"
    tolerations:
    - key: "virtual-kubelet.io/provider"
      operator: "Exists"

```