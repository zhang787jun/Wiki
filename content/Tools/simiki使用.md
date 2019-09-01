---
title: "Simiki--轻量级Wiki框架"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# Simiki 使用教程



Simiki is a simple wiki framework, written in [Python](https://www.python.org/).

* Easy to use. Creating a wiki only needs a few steps
* Use [Markdown](http://daringfireball.net/projects/markdown/). Just open your editor and write
* Store source files by category
* Static HTML output
* A CLI tool to manage the wiki


## 1. Quick Start

### Install

	pip install simiki

### Update

	pip install -U simiki

### Init Site 

	mkdir mywiki && cd mywiki
	simiki init

### Create a new wiki

	simiki new -t "Hello Simiki" -c first-catetory

### Generate 生成静态网页文件(html 等)

	simiki g

### Preview 本地查看网页

	simiki p -w

For more information, `simiki -h` or have a look at [Simiki.org](http://simiki.org)

### Others 

* [simiki.org](http://simiki.org)
* <https://github.com/tankywoo/simiki>
* Email: <me@tankywoo.com>
* [Simiki Users](https://github.com/tankywoo/simiki/wiki/Simiki-Users)

## 2. 修改配置
### 1. 增加对数学符号的支持
在主题的模板html 文件中添加 `MathJax.js`(可通过本地或CDN远程加速添加)
```shell
vim  ./themes/xxx/base.html 
```
头文件中

```html
<html>
	<head>
		...
		<script type="text/javascript" async
		src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML">
		</script>
		...
	</head>
	<body>
		...
	</body>
</html>

```

### 2. 本地图片及文件的支持

在`_config.yml`配置文件中，配置 attach，默认值为"attach"文件夹
新建`./attach` 文件夹,运行`simiki -g` 时将会把 `./attach` 文件夹的内容复制到 `./output/attach`

### 3. 图片缩放
jquery


http://www.360doc.com/content/17/0628/01/11559041_667078111.shtml

### 4. Favicon 支持

Favicon
(v1.5.0.post1版本)

将文件名为favicon.ico的icon文件放在wiki根目录下.

另外, 主题需要额外支持:
```html
<link rel="shortcut icon" href="{{ site.root }}/favicon.ico" type="image/x-icon">
<link rel="icon" href="{{ site.root }}/favicon.ico" type="image/x-icon">
```

### 5.二级网页css 不能正常布置的问题

CSS路径有问题，你这里用到了二级目录

主题里配置CSS文件路径应该改为:

    <link rel="Stylesheet" type="text/css" href="{{ site.root }}/static/css/style.css">
    <link rel="Stylesheet" type="text/css" href="{{ site.root }}/static/css/tango.css">


	simiki generate --ignore-root

且在 _config.yml 中配置:

root: /Wiki/



## Smiki 生成wiki 并发布到Github Page

### github page的相关概念

#### user pages
1. 数量
Github 为每一个账户都设置了一个默认的user pages, 如果你要使用，创建的 <repository name> 必须符合 XXX.github.io
2. 发布分支
并且 user pages 只能使用这个项目的主分支master来作为发布源。

例如本账户的user pages 地址就是 https://zhang787jun.github.io


#### project page
1. 数量
每个账户下可以创建多个项目，每一个项目都可以创建 一个project pages 来发布github page。
2.
对于project page，你可以选择 master 作为 githubpages 发布源，也可以选择 gh-pages 分支作为发布源，因为pages一般是用来说明项目的，因此项目一般不要使用主分支发布，直接使用 gh-pages 分支更好，这样就和你的 master 代码分开了。如果你就是想要在主分支发布，那么在主分支的root目录下必须要有一个 /docs 目录，发布源代码需要在 /docs 目录下。 自定义域名只要 在发布源的代码目录下面加入CNAME文件即可，里面只需要填写你的自定义域名！如果你的域名还未被DNS收录，那么github会发出警告消息。

我的wiki就是使用 project page，然后 master 是所有的源文件代码目录和markdown笔记文件，但是这个并不是发布源，发布源使用 gh-pages 分支，每次只发布 output 目录下的东西，也就是说我的 gh-pages 分支，只有simiki 生成的output目录下的内容。主分支是整个内容。每次最终要发布的内容推送到 gh-pages 分支，然后备份是推送到 master 分支，这样我的md文件就不会丢失了！在其他电脑上我也可以下载下来编辑和修改，然后重新发布！

在 _config.yml 中配置
```
url:https://xx.github.io/Wiki/
root: /Wiki/
```
###  Fabric 部署
simiki官方的推荐使用 Fabric 部署，Fabric目前版本较乱，注意

如果使用Fabric, 可能会出现一些问题, 首先确认安装了以下模块:
```shell 
#pycrypto:
easy_install http://www.voidspace.org.uk/downloads/pycrypto26/pycrypto-2.6.win32-py2.7.exe
# ecdsa:
pip install ecdsa
```


### ghp-import 部署



同时可以使用 [ghp-import](https://github.com/davisp/ghp-import) 部署 
```
Usage: ghp-import [OPTIONS] DIRECTORY

Options:
  -n, --no-jekyll       Include a .nojekyll file in the branch.
  -c CNAME, --cname=CNAME
                        Write a CNAME file with the given CNAME.
  -m MESG, --message=MESG
                        The commit message to use on the target branch.
  -p, --push            Push the branch to origin/{branch} after committing.
  -f, --force           Force the push to the repository
  -r REMOTE, --remote=REMOTE
                        The name of the remote to push to. [origin]
  -b BRANCH, --branch=BRANCH
                        Name of the branch to write to. [gh-pages]
  -s, --shell           Use the shell when invoking Git. [False]
  -l, --follow-links    Follow symlinks when adding files. [False]
  -h, --help            show this help message and exit

ghp-import -p -m "Update output documentation" -r origin -b gh-pages output
```

### git手动部署
```shell 
git checkout gh-pages
git push origin gh-pages
```


[1]https://help.github.com/articles/creating-project-pages-manually/