---
title: "[关注排版]--使用LaTeX"
layout: page
date: 2019-08-30 00:00
---

[TOC]
# 引言

TEX是诞生于20世纪70年代末到80年代初的一款计算机排版软件。
LATEX是对TEX的封装和拓展，实际上就是用TEX语言编写的一组宏代码，拥有比原来TEX格式（Plain TEX）更为规范的命令和一整套预定义的格式。

# 1. 安装 

在VScode上使用latex编辑pdf

    引言
    安装Tex live
        文件下载
        Tex live安装流程
    在Visual Studio code(VS code)安装LateX
        VS code下载
        VS code安装latex
    测试最简单的latex


TEXLive是TEX的一个发行版。
安装Tex live

Tex live官网对Tex live有详细的介绍以及下载说明，感兴趣的同学可以进行阅读。
文件下载

Tex live一般有两种安装方式：
一种是通过本地下载windows或Linux安装文件，然后通过安装文件进行下载安装。
还有一种是下载ISO镜像文件，然后进行安装。为了更快速的下载，这里推荐两个镜像源：清华大学镜像和中科大镜像。下载".iso"后缀的文件（图中以".iso"为后缀的文件，任选一个下载）
注：本文采用下载ISO镜像文件进行安装，且安装windows版本。
在这里插入图片描述
Tex live安装流程

文件下载完成后得到下图中的文件，图中是很久以前下载的文件，现在可能更新了，但后续的安装步骤没有变化。
在这里插入图片描述
打开iso镜像文件后，双击“install-tl-windows.bat”文件即可进行安装
在这里插入图片描述
随后会显示如下界面，在这里可以根据自己的需要去修改安装路径。（可能还有一个命令提示符的页面，这里不用管，可以直接关掉）
点击“Advanced”可以进行更多设置，这里暂不进行演示。
在这里插入图片描述
之后就是漫长的等待了，会显示下图中的界面，安装时间很长，大约40分钟，具体安装时间要看电脑的性能。
在这里插入图片描述
上面安装完成后就可以关掉了。

根据上面步骤安装完成后，就有了下图的这些应用程序。
一般只需要用“TeXworks editor”进行编辑，具体如何编辑此处暂时不做教学，网络上有很多教学视频。
在这里插入图片描述
个人不太喜欢使用“TeXworks editor”进行编辑，觉得很费眼，看着有些难受，所以本文还有后续“改进”…
在Visual Studio code(VS code)安装LateX
VS code下载

vscode可以在官网进行下载，有windows，Linux等版本。
本文下载的是windows版本，VS code安装很简单，这里就不进行详细说明了。
本文安装的windows版本的VS code。
VS code安装latex

打开VS code，界面如下
在这里插入图片描述
在拓展应用中搜索“latex”并进行安装。（重启软件后生效）
在这里插入图片描述
部分同学可能更习惯中文界面，也可以在应用程序中搜索“chinese”进行安装，这是个可选项。（重启软件后生效）
在这里插入图片描述
（注：这里需要重启软件）
到这一步还不能使用VS code进行latex编辑，还需要一些重要的设置。
打开“设置” -> “命令面板”，或者按“Ctrl+Shift+P”打开“命令面板”
在这里插入图片描述
搜索“setting”，并选择“preferences:Open Settings(JSON)” （注意：不要选择错了）
在这里插入图片描述
将里面的代码（有可能是空白的）全部删掉，然后将下面代码复制进去，随后保存（Ctrl+S）。

{
    "files.autoSave": "onFocusChange",
    "latex-workshop.view.pdf.viewer": "tab",
    "latex-workshop.view.pdf.hand": true,
    "latex-workshop.synctex.afterBuild.enabled": true,
    "latex-workshop.latex.tools": [
        {
            "name": "xelatex",
            "command": "xelatex",
            "args": [
                "-synctex=1",
                "-interaction=nonstopmode",
                "-file-line-error",
                "%DOCFILE%"
            ]
        },
        {
            "name": "latexmk",
            "command": "latexmk",
            "args": [
                "-synctex=1",
                "-interaction=nonstopmode",
                "-file-line-error",
                "-pdf",
                "%DOCFILE%"
            ]
        },
        {
            "name": "pdflatex",
            "command": "pdflatex",
            "args": [
                "-synctex=1",
                "-interaction=nonstopmode",
                "-file-line-error",
                "%DOCFILE%"
            ]
        },
        {
            "name": "bibtex",
            "command": "bibtex",
            "args": [
                "%DOCFILE%"
            ]
        }
    ],
    "latex-workshop.latex.recipes": [
        {
            "name": "XeLaTeX",
            "tools": [
                "xelatex"
            ]
        },
        {
            "name": "PDFLaTeX",
            "tools": [
                "pdflatex"
            ]
        },
        {
            "name": "latexmk",
            "tools": [
                "latexmk"
            ]
        },
        {
            "name": "BibTeX",
            "tools": [
                "bibtex"
            ]
        },
        {
            "name": "pdflatex -> bibtex -> pdflatex*2",
            "tools": [
                "pdflatex",
                "bibtex",
                "pdflatex",
                "pdflatex"
            ]
        },
        {
            "name": "xelatex -> bibtex -> xelatex*2",
            "tools": [
                "xelatex",
                "bibtex",
                "xelatex",
                "xelatex"
            ]
        }
    ]
}

    1
    2
    3
    4
    5
    6
    7
    8
    9
    10
    11
    12
    13
    14
    15
    16
    17
    18
    19
    20
    21
    22
    23
    24
    25
    26
    27
    28
    29
    30
    31
    32
    33
    34
    35
    36
    37
    38
    39
    40
    41
    42
    43
    44
    45
    46
    47
    48
    49
    50
    51
    52
    53
    54
    55
    56
    57
    58
    59
    60
    61
    62
    63
    64
    65
    66
    67
    68
    69
    70
    71
    72
    73
    74
    75
    76
    77
    78
    79
    80
    81
    82
    83
    84
    85
    86
    87
    88
    89
    90

测试最简单的latex

可以新建一个后缀为“.tex”的文件，使用VS code打开。
输入下面代码：

\documentclass{article}
\usepackage{ctex} % 中文宏
\begin{document}
Hello, world! 你好，世界！
\end{document}

    1
    2
    3
    4
    5

运行并查看PDF文件，如果得到和下图中类似的结果，那么Congratulation to you ！！！
————————————————
版权声明：本文为CSDN博主「0不觉」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/fq_wallow/article/details/115909254

# 2. 其他
第一次写手稿给我的博士导师看，导师说LaTeX是个非常好的工具，那是我第一次听到这个（原谅我这么out），提议让我用自己的手稿作为材料来练习一下怎么使用LaTeX。

其实当时还是有一点纳闷的，论文排版，不是已经有WORD了吗？即便要输入复杂的公式也已经有MathType了，不过还是听从导师的建议，搜索网络上的教程进行自学。

通过知乎，我看到一个答主提供的教程非常好，他的回答的链接为：
如何从零开始，入门 LaTeX？​
www.zhihu.com图标

这里面提到的那篇：一份其实很短的LaTeX入门文档（以下简称原文），链接地址为：
https://liam.page/2014/09/08/latex-introduction/​
liam.page

我是要抄袭吗？不是的，我是指出，我正是通过这篇文档入了门，并且我在用这篇文档学习的时候，遇到了几个小问题，想在此分享一下给其他朋友们。

第一个问题，中英文

进入文档，第6.1节 Hello, world!中，如下图：

第7.1节作者、标题、日期中，如下图：

这节，因为要在论文里用中文，但我只写英文论文，不写中文的话，是不是在documentclass还是跟{article}就可以了？我这么想，于是把7.1中出现的“你好”等都换成Hello，documentclass后面跟{article}，发现运行失败，心想奇怪，我已经是全英文了啊，后来才发现可能是因为\today这句话获取当前日期是带中文的（因为我的Windows系统是中文的），于是我将\today直接改为英文日期，编译运行通过。

第二个问题，图片大小设置

如上图，9.1节的，我原本是将上面这句话整句抄到我的TeX中，发现图片始终不能与文字同宽，通过改动.8这个数字，我发现这是个比例，就是图片宽度占文字宽度的百分之多少，于是我改成1.0，即百分之百，则图片正好贴好到边。（这个问题，上面的原文没有说明，所以刚开始不清楚）。

第三个问题，论文分栏设置

大家都知道，我们大多数情况下看到的论文是分两栏的，并不像本文这样一栏到底。而原文并没有给出代码，后来网上查了一下，方法为：在documentclass和{article之间}加上[twocolumn]，即如下：

\documentclass[twocolumn]{article}

注：如没标注几栏，则默认为一栏。

第四个问题，浮动体设置

按照源文档描述可知，插图和表格通常需要占据大块空间，所以在文字处理软件中我们经常需要调整他们的位置。figure和table环境可以自动完成这样的任务；这种自动调整位置的环境称作浮动体(float)。我们以figure为例。如下：

结果效果是如下所示：

通过查阅网络，我改为：

即分别加了*，问题解决。

暂时先写这些，后续碰到其他问题及解决，我再更。希望能帮助到和我一样的初学者。

可能我说的也不一定对，在我看来它只是一个工具，先会用，以后再深入。

