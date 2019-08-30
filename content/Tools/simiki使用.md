---
title: "Simiki 使用教程"
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

Simiki is short for `Simple Wiki` :)

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


起因
开始使用simiki是因为一篇博客——程序员的知识管理，
这篇博客对我启发很大。是的，程序员或者一般的工程师经常需要配置一些开发环境之类的
工作，如果能够将这些过程记录下来，日后再配置的时候会减少很多不必要的时间浪费。
此外，如果能将平常一些琐碎的知识记录下来也是不错的。使用simiki可以将这些工作通过
wiki来实现，并且可以将数据保存在本地，不用担心数据丢失之类的风险。

请不要FORK我的WIKI！！ 因为这个WIKI里面的内容大多是我原创的，请不要FORK，谢谢。

工具准备
为了使用simiki，需要准备好基本环境。

安装python，不同的平台安装方式不同，都很容易。

安装simiki库及其依赖库，我使用pip进行安装，只需要一条命令pip install simiki即可。

注册github账户，并且创建<username>.github.io代码项目。完成之后，你应该可以通过该
子域名访问到自己的page页面，具体细节请参考官方文档。

环境配置过程
在github中创建wiki项目，并创建gh-pages分支[1]。

git clone git@github.com:tracholar/wiki.git
git checkout -b gh-pages
git rm -rf .
切换到master分支初始化simiki，生成content和themes目录和几个文件。并在output目录生成静态文件。

git checkout master
simiki init
simiki g
部署
windows中的部署
为了部署方便，在master分钟中将output目录过滤掉，
在.gitignore文件中添加一行

output
即可。此外，需要将output目录push到gh-pages分支，可以利用我写的一个
批处理脚本deploy.bat。
这个脚本提供两个功能，初始化和部署。

deploy [option]
    -i  初始化
    message  以message作为git commit信息提交并推送到github
如果你要使用请把脚本中库的URL改成你的URL。
初始化之前请删除前面生成的output目录，然后执行以下命令。

deploy -i
然后重新提交部署

deploy init-version
然后就可以在你的项目页面中看到wiki了，对我来说是 tracholar.github.io/wiki。

Tips: 注意文件夹和文件命名统一用小写，否则你会后悔，因为windows不区分大小写
而linux是区分的。

linux/MAC 中的部署
还没试过，等试过之后再写，你可以参考官方指南
使用ghp-import部署，更方便，只是不支持windows。

公司发了mac，我又写了个bash脚本deploy.sh。
使用方法跟windows上的一样，不过要chmod +x deploy.sh给脚本增加执行权限。
当然，你也需要把git仓库的地址改成你自己的地址。

我的效果
请访问https://tracholar.github.io/wiki观看。

请不要FORK我的WIKI！！ 因为这个WIKI里面的内容大多是我原创的，请不要FORK，谢谢。

[1]https://help.github.com/articles/creating-project-pages-manually/