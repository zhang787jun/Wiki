---
title: "KFServing"
layout: page
date: 2099-06-02 00:00
---

[TOC]


# 什么是KFServing

KFServing Features and Examples
Deploy InferenceService with Predictor
KFServing provides a simple Kubernetes CRD to allow deploying single or multiple trained models onto model servers such as TFServing, TorchServe, ONNXRuntime, Triton Inference Server. 

In addition KFServer is the Python model server implemented in KFServing itself with prediction v1 protocol, MLServer implements the prediction v2 protocol with both REST and gRPC. These model servers are able to provide out-of-the-box model serving, but you could also choose to build your own model server for more complex use case. KFServing provides basic API primitives to allow you easily build custom model server, you can use other tools like BentoML to build your custom model serve image.

After models are deployed onto model servers with KFServing, you get all the following serverless features provided by KFServing.

Scale to and from Zero
Request based Autoscaling on CPU/GPU
Revision Management
Optimized Container
Batching
Request/Response logging
Scalable Multi Model Serving
Traffic management
Security with AuthN/AuthZ
Distributed Tracing
Out-of-the-box metrics
Ingress/Egress control


以下为KFServing规范的具体示例，其中演示了模型的具体部署流程。用户只需要使用storageUri提交模型文件URI即可：

apiVersion: "serving.kubeflow.org/v1alpha2"
kind: "InferenceService"
metadata:
  name: "sklearn-iris"
spec:
  default:
    predictor:
      sklearn:

