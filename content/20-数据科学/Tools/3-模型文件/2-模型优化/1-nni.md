---
title: "NNI--自动机器学习（AutoML）工具包"
layout: page
date: 2099-06-02 00:00
---
[TOC]


对的 nni 也可以做模型压缩

NNI (Neural Network Intelligence) 是一个轻量但强大的工具包，帮助用户自动的进行特征工程，神经网络架构搜索，超参调优以及**模型压缩**。

NNI的中文官方文档写的非常详细，建议阅读。 https://github.com/microsoft/nni/blob/master/README_zh_CN.md


```python
from nni.compression.pytorch.utils.counter import count_flops_params
from nni.compression.pytorch.speedup import ModelSpeedup
from nni.algorithms.compression.pytorch.pruning import L1FilterPruner, SlimPruner, FPGMPruner
from nni.compression.pytorch import apply_compression_results

from alfred.dl.torch.common import device
import time


model = resnet50(pretrained=True).to(device)
torch.save(model.state_dict(), 'origin.pth')
# print(model)
ori_model = model

config_list = [{
    'sparsity': 0.8,
    'op_types': ['Conv2d']
    # 'op_types': ['BatchNorm2d']
}]

input_size = [1, 3, 640, 640]
dummy_input = torch.randn(input_size).to(device)

tic = time.time()
a = model(dummy_input)
print('first time: ', time.time() - tic)

# flops, params, _ = count_flops_params(model, dummy_input, verbose=True)
# print(f"Model FLOPs {flops/1e6:.2f}M, Params {params/1e6:.2f}M")


pruner = FPGMPruner(model, config_list)
pruner.compress()

# flops, params, _ = count_flops_params(model, dummy_input, verbose=True)
# print(f"Model FLOPs {flops/1e6:.2f}M, Params {params/1e6:.2f}M")

pruned_model_path = 'slim_pruned.pth'
pruned_model_mask_path = 'slim_pruned_mask.pth'

pruner.export_model(model_path=pruned_model_path, mask_path=pruned_model_mask_path,
                    onnx_path='pruned.onnx', input_shape=dummy_input.shape, device=device)
model = resnet50(pretrained=True).to(device)
print('model pruned done.')


if __name__ == '__main__':

    apply_compression_results(model, masks_file=pruned_model_mask_path)
    print('apply_compression_results time:  ')
    tic = time.time()
    a = model(dummy_input)
    print('apply_compression_results time: ', time.time() - tic)

    m_speedup = ModelSpeedup(
        model, dummy_input, masks_file=pruned_model_mask_path)
    m_speedup.speedup_model()

    tic = time.time()
    a = model(dummy_input)
    print('speedup_model time: ', time.time() - tic)

    # # print(model)
    torch.save(model.state_dict(), 'slim_speedup_model.pth')

    torch.onnx.export(model, dummy_input, 'slim_speedup.onnx', verbose=False, opset_version=11)
    print('pruned model exported.')

    # flops, params, _ = count_flops_params(model, dummy_input, verbose=True)
    # print(f"Model FLOPs {flops/1e6:.2f}M, Params {params/1e6:.2f}M")


```
