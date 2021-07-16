---
title: "NNI--自动机器学习（AutoML）工具包"
layout: page
date: 2099-06-02 00:00
---
[TOC]


NNI (Neural Network Intelligence) 是一个轻量但强大的工具包，帮助用户自动的进行特征工程，神经网络架构搜索，超参调优以及模型压缩。

NNI的中文官方文档写的非常详细，建议阅读。 https://github.com/microsoft/nni/blob/master/README_zh_CN.md

# 1. 单机使用

## 1.1. 基本步骤
1. 编写`search_space.json` 文件
2. 修改运行程序脚本
3. 定义nni 程序配置文件`config.yml`
```shell
/root
|__mnist.py 
|__search_space.json
|__config.yml
```

### 1.1.1. 定义搜索空间文件

注意，搜索空间的效果与 Tuner 高度相关。 此处列出了内置 Tuner 所支持的类型。 对于自定义的 Tuner，不必遵循鞋标，可使用任何的类型。

所有采样策略和参数如下：


`{"_type": "choice", "_value": options}`
  
`{"_type": "randint", "_value": [lower, upper]}`
  
  * 从 `lower` (包含) 到 `upper` (不包含) 中选择一个随机整数。
  * 注意：不同 Tuner 可能对 `randint` 有不同的实现。 一些 Tuner（例如，TPE，GridSearch）将从低到高无序选择，而其它一些（例如，SMAC）则有顺序。 如果希望所有 Tuner 都有序，可使用 `quniform` 并设置 `q=1`。

`{"_type": "uniform", "_value": [low, high]}`
  * 变量是 low 和 high 之间均匀分布的值。
  * 当优化时，此变量值会在两侧区间内。

 `{"_type": "quniform", "_value": [low, high, q]}`
  
  * 变量值为 `clip(round(uniform(low, high) / q) * q, low, high)`，clip 操作用于约束生成值的边界。 例如，`_value` 为 [0, 10, 2.5]，可取的值为 [0, 2.5, 5.0, 7.5, 10.0]; `_value` 为 [2, 10, 5]，可取的值为 [2, 5, 10]。
  * 适用于离散，同时反映了某种"平滑"的数值，但上下限都有限制。 如果需要从范围 [low, high] 中均匀选择整数，可以如下定义 `_value`：`[low, high, 1]`。

`{"_type": "loguniform", "_value": [low, high]}`
  
  * 变量值在范围 [low, high] 中是 loguniform 分布，如 exp(uniform(log(low), log(high)))，因此返回值是对数均匀分布的。
  * 当优化时，此变量必须是正数。

* `{"_type": "qloguniform", "_value": [low, high, q]}`
  
  * 变量值为 `clip(round(loguniform(low, high) / q) * q, low, high)`，clip 操作用于约束生成值的边界。
  * 适用于值是“平滑”的离散变量，但上下限均有限制。
`{"_type": "normal", "_value": [mu, sigma]}`
  
  * 变量值为实数，且为正态分布，均值为 mu，标准方差为 sigma。 优化时，此变量不受约束。

`{"_type": "qnormal", "_value": [mu, sigma, q]}`
  
  * 这表示变量值会类似于 `round(normal(mu, sigma) / q) * q`
  * 适用于在 mu 周围的离散变量，且没有上下限限制。

`{"_type": "lognormal", "_value": [mu, sigma]}`
  
  * 变量值为 `exp(normal(mu, sigma))` 分布，范围值是对数的正态分布。 当优化时，此变量必须是正数。

`{"_type": "qlognormal", "_value": [mu, sigma, q]}`
  
  * 这表示变量值会类似于 `round(exp(normal(mu, sigma)) / q) * q`
  * 适用于值是“平滑”的离散变量，但某一边有界。

```json
//search_space.json
{
    "dropout_rate":{"_type":"uniform","_value":[0.5, 0.9]},
    "conv_size":{"_type":"choice","_value":[2,3,5,7]},
    "hidden_size":{"_type":"randint","_value":[124,1024]},
    "batch_size": {"_type":"choice", "_value": [1, 4, 8, 16, 32]},
    "learning_rate":{"_type":"choice","_value":[0.0001, 0.001, 0.01, 0.1]}
}
```
### 1.1.2. 修改程序脚本

修改 Trial 代码来从 NNI 获取超参，并返回 NNI 最终结果。

```python
# import nni
+ import nni

  def run_trial(params):
      mnist = input_data.read_data_sets(params['data_dir'], one_hot=True)

      mnist_network = MnistNetwork(channel_1_num=params['channel_1_num'], channel_2_num=params['channel_2_num'], conv_size=params['conv_size'], hidden_size=params['hidden_size'], pool_size=params['pool_size'], learning_rate=params['learning_rate'])
      mnist_network.build_network()

      with tf.Session() as sess:
          mnist_network.train(sess, mnist)
          test_acc = mnist_network.evaluate(mnist)
# 添加report value
+         nni.report_final_result(test_acc)

  if __name__ == '__main__':

-     params = {'data_dir': '/tmp/tensorflow/mnist/input_data', 'dropout_rate': 0.5, 'channel_1_num': 32, 'channel_2_num': 64,
-     'conv_size': 5, 'pool_size': 2, 'hidden_size': 1024, 'learning_rate': 1e-4, 'batch_num': 2000, 'batch_size': 32}
# 获取params
+     params = nni.get_next_parameter()
      run_trial(params)
```

### 1.1.3. 定义配置文件

```yml
authorName: default
experimentName: example_mnist
trialConcurrency: 1
maxExecDuration: 1h
maxTrialNum: 10
#choice: local, remote, pai
trainingServicePlatform: local
searchSpacePath: search_space.json
#choice: true, false
useAnnotation: false
tuner:
  #choice: TPE, Random, Anneal, Evolution, BatchTuner, MetisTuner, GPTuner
  #SMAC (SMAC should be installed through nnictl)
  builtinTunerName: TPE
  classArgs:
    #choice: maximize, minimize
    optimize_mode: maximize
trial:
  command: python3 mnist.py
  codeDir: .
  gpuNum: 0
```
### 1.1.4. 执行试验

```shell
# nnictl 命令行
nnictl create --config <config_file>
nnictl create --config nni\examples\trials\mnist-tfv1\config_windows.yml
```

## 1.2. docker 实践


```shell
docker pull msranni/nni:latest
# docker pull msranni/nni:1.14
```
拉下的官方镜像以`/root `为工作区，`python3` 打开python命令（注意，在编写nni 的`config.yml`的时候）

完成步骤1~3

```shell
# 将workspace 挂载到 docker 中
docker run --rm -it -p 8080:8080 -v <file_path>:/root msranni/nni:latest

>>>
# 在docker 内执行
root@docker:
nnictl create --config <config_file>

>>>
# 开启nni service，8080端口export
...
Successfully started experiment!
-----------------------------------------------
The experiment id is AuXd4oEe
The Web UI urls are: http://172.17.0.3:8080   http://127.0.0.1:8080

```

在Host 机器上的 浏览器中打开 Web UI url，可看到下图的 Experiment 详细信息，以及所有的 Trial 任务。 查看这里的更多页面。
![](/attach/images/2020-02-26-20-32-37.png)



# 2. 在远程计算机上运行 Experiment

NNI 可以通过 SSH 在多个远程计算机上运行同一个 Experiment，称为 `remote` 模式。 这就像一个轻量级的训练平台。 在此模式下，可以从计算机启动 NNI，并将 Trial 并行调度到远程计算机。

## 2.1. 远程计算机的要求

* 仅支持 Linux 作为远程计算机，其[配置需求](../Tutorial/Installation.md)与 NNI 本机模式相同。

* 根据[安装文章](../Tutorial/Installation.md)，在每台计算机上安装 NNI。

* 确保远程计算机满足 Trial 代码的环境要求。 如果默认环境不符合要求，可以将设置脚本添加到 NNI 配置的 `command` 字段。

* 确保远程计算机能被运行 `nnictl` 命令的计算机通过 SSH 访问。 同时支持 SSH 的密码和密钥验证方法。 有关高级用法，参考[配置](../Tutorial/ExperimentConfig.md)的 machineList 部分。

* 确保每台计算机上的 NNI 版本一致。

## 2.2. 运行 Experiment

例如，有三台机器，可使用用户名和密码登录。

| IP       | 用户名 | 密码   |
| -------- | ------ | ------ |
| 10.1.1.1 | bob    | bob123 |
| 10.1.1.2 | bob    | bob123 |
| 10.1.1.3 | bob    | bob123 |

在这三台计算机或另一台能访问这些计算机的环境中安装并运行 NNI。

以 `examples/trials/mnist-annotation` 为例。 示例文件 `examples/trials/mnist-annotation/config_remote.yml` 的内容如下：

```yaml
authorName: default
experimentName: example_mnist
trialConcurrency: 1
maxExecDuration: 1h
maxTrialNum: 10
#choice: local, remote, pai
trainingServicePlatform: remote
# 搜索空间文件
searchSpacePath: search_space.json
# 可选项: true, false
useAnnotation: true
tuner:
  # 可选项: TPE, Random, Anneal, Evolution, BatchTuner
  #SMAC (SMAC 需要先通过 nnictl 来安装)
  builtinTunerName: TPE
  classArgs:
    # 可选项:: maximize, minimize
    optimize_mode: maximize
trial:
  command: python3 mnist.py
  codeDir: .
  gpuNum: 0
#local 模式下 machineList 可为空
machineList:
  - ip: 10.1.1.1
    username: bob
    passwd: bob123
    #使用默认端口 22 时，该配置可跳过
    #port: 22
  - ip: 10.1.1.2
    username: bob
    passwd: bob123
  - ip: 10.1.1.3
    username: bob
    passwd: bob123
```

`codeDir` 中的文件会自动上传到远程计算机中。 可在 Windows、Linux 或 macOS 上运行以下命令，在远程 Linux 计算机上启动 Trial：

```bash
nnictl create --config examples/trials/mnist-annotation/config_remote.yml
```

# 3. 参考资料
[1]: 官方文档 https://github.com/microsoft/nni/blob/master/README_zh_CN.md