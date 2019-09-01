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

## 二级网页css 不能正常布置的问题

CSS路径有问题，你这里用到了二级目录

主题里配置CSS文件路径应该改为:

    <link rel="Stylesheet" type="text/css" href="{{ site.root }}/static/css/style.css">
    <link rel="Stylesheet" type="text/css" href="{{ site.root }}/static/css/tango.css">


	simiki generate --ignore-root

且在 _config.yml 中配置:

root: /wiki

g158yp


## 发布Github Page

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