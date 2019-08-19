---
title: "Git 常用指令及开发流程"
layout: page
date: 2099-06-02 00:00
---
[TOC]
# Git常用指令


参考资料
https://learngitbranching.js.org/
https://git-scm.com/book/zh/v2
《GitHub入门与实践》

<a><img src="/attach/images/git/Git_V2.16.2.png" ></a>

## 1. 新建，初始化代码库
```shell
# 在当前目录新建一个Git代码库
git init

# 新建一个目录，将其初始化为Git代码库
git init [project-name]

# 下载一个项目和它的整个代码历史
git clone [url]
```

## 2. 仓库内文件管理
### 增加/删除文件到暂存区
```shell
# 添加指定文件到暂存区
git add [file1] [file2] ...

# 添加指定目录到暂存区，包括子目录
git add [dir]

# 添加当前目录的所有文件到暂存区
git add .

# 添加每个变化前，都会要求确认
# 对于同一个文件的多处变化，可以实现分次提交
git add -p

# 删除工作区文件，并且将这次删除放入暂存区
git rm [file1] [file2] ...

# 停止追踪指定文件，但该文件会保留在工作区
git rm --cached [file]

# 改名文件，并且将这个改名放入暂存区
git mv [file-original] [file-renamed]
```
### 忽略文件
在仓库内添加`.gitignore` 文件
```
vim .gitignore
```
`.gitignore` 文件语法：
```shell
# 忽略 以sh结尾的文件
*.sh
#以txt结尾的文件不能忽略
!*.txt
#setting 文件下的所有文件忽略
.setting/
#a文件夹下的所有txt文件忽略
/a/*.txt
```
在线配置`.gitignore`文件: https://www.gitignore.io/


### 代码提交
```shell
# 提交暂存区到仓库区
git commit -m [message]

# 提交暂存区的指定文件到仓库区
git commit [file1] [file2] ... -m [message]

# 提交工作区自上次commit之后的变化，直接到仓库区
git commit -a

# 提交时显示所有diff信息
git commit -v

# 使用一次新的commit，替代上一次提交
# 如果代码没有任何新变化，则用来改写上一次commit的提交信息
git commit --amend -m [message]

# 重做上一次commit，并包括指定文件的新变化
git commit --amend [file1] [file2] ...
```

## 3. 分支管理

### 查看
```shell
# 列出所有本地分支
git branch

# 列出所有远程分支
git branch -r

# 列出所有本地分支和远程分支
git branch -a
```
### 创建

创建分支命名规范
推荐使用如下格式：ownerName/featureName。 这样既便于知道分支覆盖的功能，也便于找到分支的负责人。以后清理分支的时候也很方便。

```shell
# 新建一个分支，但依然停留在当前分支
git branch [branch-name]
git checkout zhangjun/newFeature


# 新建一个分支，并切换到该分支
git checkout -b [branch-name]

# 新建一个分支，指向指定commit
git branch [branch-name] [commit]

# 创建一个完全独立没有log的分支
git checkout --orphan  [branch-name]

# 新建一个分支，与指定的远程分支建立追踪关系
git branch --track [branch-name] [remote-branch]
```

### 切换分支
```shell 
# 切换到指定分支，并更新工作区
git checkout [branch-name]

# 切换到上一个分支
git checkout -
```
### 合并分支
<img src="/attach/images/git/git_rebase.png">

小结
1. rebase 操作可以把本地未push的分叉提交历史整理成直线；
2. rebase的目的是使得我们在查看历史提交的变化时更容易，因为分叉的提交需要三方对比。

有几点需要注意： 不要在master合并代码，保证master的可用性很重要。 确保在正确的分支执行正确的操作。 无论是处理冲突还是更新远端代码，请保有敬畏之心。

到此，一个正常的基于功能分支的开发流程就完成了。接下来看看另外一个开发流程。
#### git merge 合并 

```shell 
# 建立追踪关系，在现有分支与指定的远程分支之间
git branch --set-upstream [branch-name] [remote-branch]

# 选择一个commit，合并进当前分支
git cherry-pick [commit]

# 合并指定分支到当前分支
git merge [branch-name]

git merge [-n] [--stat] [--no-commit] [--squash] [--[no-]edit]
    [-s <strategy>] [-X <strategy-option>] [-S[<keyid>]]
    [--[no-]allow-unrelated-histories]
    [--[no-]rerere-autoupdate] [-m <msg>] [<commit>…?]
git merge --abort
git merge --continue

```
##### 合并中的冲突管理

###### 1. 冲突的产生
很多命令都可能出现冲突，但从根本上来讲，都是merge 和 patch（应用补丁）时产生冲突。
而rebase就是重新设置基准，然后应用补丁的过程，所以也会冲突。
git pull会自动merge，repo sync会自动rebase，所以git pull和repo sync也会产生冲突。当然git rebase就更不用说了。
###### 2. 冲突的类型
1. 逻辑冲突
git自动处理（合并/应用补丁）成功，但是逻辑上是有问题的。
比如另外一个人修改了文件名，但我还使用老的文件名，这种情况下自动处理是能成功的，但实际上是有问题的。
又比如，函数返回值含义变化，但我还使用老的含义，这种情况自动处理成功，但可能隐藏着重大BUG。这种问题，主要通过自动化测试来保障。所以最好是能够写出比较完备的自动化测试用例。
这种冲突的解决，就是做一次BUG修正。不是真正解决git报告的冲突。
2. 内容冲突
两个用户修改了同一个文件的同一块区域，git会报告内容冲突。我们常见的都是这种，后面的解决办法也主要针对这种冲突。
```shell
git pull
>>>
Auto-merging test.txt
CONFLICT (content): Merge conflict in test.txt
Automatic merge failed; fix conflicts and then commit the result.
>>>
error: project mini/sample
#一般来讲，出现冲突时都会有“CONFLICT”字样：
```
3. 树冲突
文件名修改造成的冲突，称为树冲突。
比如，A用户把文件改名为a.txt，B用户把同一个文件改名为b.txt，那么B将这两个commit合并时，会产生冲突。
```shell
git status
>>>
    added by us:    b.txt
    both deleted:   origin-name.txt
    added by them:  a.txt
```
###### 3. 冲突的解决

1. 手动解决冲突，直到把冲突标识符删掉，再执行`git commit -am -"xxx"`
2. 在git merge 中设置策略
3. 利用图形界面工具解决冲突
****
1.  内容冲突 
   直接编辑文件
2. 树冲突
如果最终确定用b.txt，那么解决办法如下：
```shell 
git rm a.txt
git rm origin-name.txt
git add b.txt
git commit
#执行前面两个git rm时，会告警“file-name : needs merge”，可以不必理会。
```

##### 4. 没有差异的文件执行合并--fast forward
如果当前的分支和另一个分支没有内容上的差异，就是说当前分支的每一个提交(commit)都已经存在另一个分支里了，git 就会执行一个“快速向前"(fast forward)操作；git 不创建任何新的提交(commit),只是将当前分支指向合并进来的分支。


#### git rebase 变基
```shell

git checkout mywork
git rebase origin


git rebase 
git rebase [-i | --interactive] [<options>] [--exec <cmd>] [--onto <newbase>]
	[<upstream> [<branch>]]
git rebase [-i | --interactive] [<options>] [--exec <cmd>] [--onto <newbase>]
	--root [<branch>]
git rebase --continue | --skip | --abort | --quit | --edit-todo | --show-current-patch

```



### 文件覆盖

```shell
git checkout (-p|--patch) [<tree-ish>] [--] [<paths>…​]

git checkout branch_2
git checkout branch_1 file_1

将工作区的 <paths> 覆盖成索引指向的内容。
当可选项[<tree ish>]给出的时候，符合 <paths>的路径将在索引上和工作区更新

由于上次合并失败，索引可能包含未合并的条目。默认情况下，如果尝试从索引中签出这样的条目，签出操作将失败，并且不会签出任何内容。使用-f将忽略这些未合并的条目。合并的特定方面的内容可以通过使用--ours或--their从索引中签出。使用-m，可以放弃对工作树文件所做的更改，以重新创建原始的冲突合并结果。
```

###  删除
```shell
# 删除分支
git branch -d [branch-name]
git branch -D [branch-name] # 强制删除

# 删除远程分支
git push origin --delete [branch-name]
git branch -dr [remote/branch]

#不同分支中的 部分文件的合并
# 1. 切换到需要合并的分支
git checkout [branch-name-2]
# 2. checkout修改的文件
git checkout [branch-name-1]  <dir_paths>

# <paths>: config/,xxx.php
```

## 4. 信息查看
``` shell 
# 显示有变更的文件
git status

# 显示当前分支的版本历史
git log

# 显示commit历史，以及每次commit发生变更的文件
git log --stat

# 搜索提交历史，根据关键词
git log -S [keyword]

# 显示某个commit之后的所有变动，每个commit占据一行
git log [tag] HEAD --pretty=format:%s

# 显示某个commit之后的所有变动，其"提交说明"必须符合搜索条件
git log [tag] HEAD --grep feature

# 显示某个文件的版本历史，包括文件改名
git log --follow [file]
git whatchanged [file]

# 显示指定文件相关的每一次diff
git log -p [file]

# 显示过去5次提交
git log -5 --pretty --oneline


###  优雅的查看log
#参考：https://stackoverflow.com/questions/1057564/pretty-git-branch-graphs

git log --all --decorate --oneline --graph

#可以在git config里面设置 别名 alias
git config --global alias.adog "log --all --decorate --oneline --graph"
git adog 

# 显示所有提交过的用户，按提交次数排序
git shortlog -sn

# 显示指定文件是什么人在什么时间修改过
git blame [file]

# 显示暂存区和工作区的差异
git diff

# 显示暂存区和上一个commit的差异
git diff --cached [file]

# 显示工作区与当前分支最新commit之间的差异
git diff HEAD

# 显示两次提交之间的差异
git diff [first-branch]...[second-branch]

# 显示今天你写了多少行代码
git diff --shortstat "@{0 day ago}"

# 显示某次提交的元数据和内容变化
git show [commit]

# 显示某次提交发生变化的文件
git show --name-only [commit]

# 显示某次提交时，某个文件的内容
git show [commit]:[filename]

# 显示操作记录
git reflog

#执行了gitk后会有一个很漂亮的图形的显示项目的历史。
gitk
```




## 5. 远程仓库管理

### 设置/查看远程仓库 
```shell

# 显示所有远程仓库
git remote -v

# 显示某个远程仓库的信息
git remote show [remote shortname]

# 增加一个新的远程仓库，并命名
git remote add [remote shortname] [url]

# [url] 格式
# https://github.com/[user_name]/[Project_name].git
```

### 删除
```shell
git remote rm [remote shortname]
```
### 同步

``` shell 
# 下载远程仓库的所有变动
git fetch [remote shortname]

# 下载远程仓库[branch_name] 分支到本地[local branch_name]分支
git fetch [remote shortname] [remote branch_name]:[local branch_name]
git fetch origin master:master

# 取回远程仓库的变化，并与本地分支合并
# pull=fetch+merge 
git pull [remote shortname] [branch-name]

# 上传本地指定分支到远程仓库
git push [remote shortname] [branch-name]

# 强行推送当前分支到远程仓库，即使有冲突
git push [remote shortname] --force

# 推送所有分支到远程仓库
git push [remote shortname] --all

```

## 6. 版本退回

```shell
#HEAD指向的版本就是当前版本，因此，Git允许我们在版本的历史之间穿梭，使用命令
git reset --hard commit_id
#穿梭前，用git log可以查看提交历史，以便确定要回退到哪个版本。
git log

# 要重返未来，用git reflog查看命令历史，以便确定要回到未来的哪个版本。
git reflog

# 恢复暂存区的指定文件到工作区
git checkout [file]

# 恢复某个commit的指定文件到暂存区和工作区
git checkout [commit] [file]

# 恢复暂存区的所有文件到工作区
git checkout .

# 重置暂存区的指定文件，与上一次commit保持一致，但工作区不变
git reset [file]

# 重置暂存区与工作区，与上一次commit保持一致
git reset --hard

# 重置当前分支的指针为指定commit，同时重置暂存区，但工作区不变
git reset [commit]

# 重置当前分支的HEAD为指定commit，同时重置暂存区和工作区，与指定commit一致
git reset --hard [commit]

# 重置当前HEAD为指定commit，但保持暂存区和工作区不变
git reset --keep [commit]

# 新建一个commit，用来撤销指定commit
# 后者的所有变化都将被前者抵消，并且应用到当前分支
git revert [commit]

# 暂时将未提交的变化移除，稍后再移入
git stash
git stash pop
```
## 7. 第三方模块管理
git submodule,git subtree这两个命令通常用来管理公用的第三方模块。比如一些通用的底层逻辑、中间件、还有一些可能会频繁变化的通用业务组件。 当然，两者还是有区别的。 

### git submodule
git submodule 主要用来管理一些单向更新的公共模块或底层逻辑。 
###　git subtree
git subtree 对于部分需要双向更新的可复用逻辑来说，特别适合管理。比如一些需要复用的业务组件代码。在我之前的实践中，我也曾用subtree来管理构建系统逻辑。

## 8.储藏
当你正在做一项复杂的工作时, 发现了一个和当前工作不相关但是又很讨厌的bug. 你这时想先修复bug再做手头的工作, 那么就可以用 git stash 来保存当前的工作状态, 等你修复完bug后,执行'反储藏'(unstash)操作就可以回到之前的工作里.
```shell
git stash "work in progress for foo feature"
```
上面这条命令会保存你的本地修改到储藏(stash)中, 然后将你的工作目录和索引里的内容全部重置, 回到你当前所在分支的上次提交时的状态.

好了, 你现在就可以开始你的修复工作了.
```shell
·······
git commit -a -m "blorpl: typofix"
```
当你修复完bug后, 你可以用git stash apply来回复到以前的工作状态.
```shell
git stash apply <stash-name>
```

储藏队列
你也可多次使用'git stash'命令,　每执行一次就会把针对当前修改的‘储藏’(stash)添加到储藏队列中. 用'git stash list'命令可以查看你保存的'储藏'(stashes):
```shell
git stash list
>>>
stash@{0}: WIP on book: 51bea1d... fixed images
stash@{1}: WIP on master: 9705ae6... changed the browse code to the official repo
# 可以用类似'git stash apply stash@{1}'的命令来使用在队列中的任意一个'储藏'(stashes)
git stash apply stash@{1}
#则是用来清空这个队列
git stash clear
```

## 9. Git 维护

### 1. 压缩仓库中的历史信息
在大的仓库中, git靠压缩历史信息来节约磁盘和内存空间。压缩操作并不是自动进行的, 你需要手动执行 `git gc`，压缩操作比较耗时, 你运行git gc命令最好是在你没有其它工作的时候.
```shell
git gc
```


### 2. 压缩提交记录

我们在开发中的时候尽量保持一个较高频率的代码提交，这样可以避免不小心代码丢失。但是真正合并代码的时候，我们并不希望有太多冗余的提交记录，而且 rebase 合并代码的时候，会把每个 commit 都处理一下，有时候会造成冗余的工作。 所以，压缩日志之后不经能让 commit 记录非常整洁，同时也便于使用 rebase 合并代码。

那么，如何压缩commit记录呢？
#### 1. git reset 
1. 使用 `git log` 找到起始 commitID  <init_commitID>
2. `git reset <init_commitID>`，切记不要用 --hard 参数 
3. 重新 `git add . --all`+`git commit -m "newlog2"`,此时本地仓库的该分支就两条log：[initlog,newlog2]
4. ` git push -f origin branchName`，因为会有冲突，所以需要强制覆盖远端分支，请务必谨慎。 合并到 master 中，然后更新远端 master。

#### 2. git commit --amend
[不推荐]
git commit --amend：追加 commit 到上一个 commit 上。
#### 3. git rebase
[不推荐]

git rebase -i：通过交互式的 rebase，提供对分支 commit 的控制，从而可以清理混乱的历史。

### 3. 清空分支的commit log记录
```shell
# 创建新的分支
git checkout --orphan  new_branch

#添加所有文件变化至暂存空间
git add -A

#提交并添加提交记录
git commit -am "commit message"
#删除master分支
git branch -D <master-name>

#重新命名当前独立分支为 master
git branch -m <master>

#推送到远端分支
git push -f origin <master>
```

### 4. 保持可靠性
git fsck 运行一些仓库的一致性检查, 如果有任何问题就会报告. 这项操作也有点耗时, 通常报的警告就是“悬空对象"(dangling objects).
```shell
git fsck
dangling commit 7281251ddd2a61e38657c827739c57015671a6b3
dangling commit 2706a059f258c6b245f298dc4ff2ccd30ec21a63
dangling commit 13472b7c4b80851a1bc551779171dcb03655e9b5
dangling blob 218761f9d90712d37a9c5e36f406f92202db07eb
dangling commit bf093535a34a4d35731aa2bd90fe6b176302f14f
dangling commit 8e4bec7f2ddaa268bef999853c25755452100f8e
dangling tree d50bb86186bf27b681d25af89d3b5b68382e4085
dangling tree b24c2473f1fd3d91352a624795be026d64c8841f
```
“悬空对象"(dangling objects)并不是问题, 最坏的情况只是它们多占了一些磁盘空间. 有时候它们是找回丢失的工作的最后一丝希望.

# git 开发模式


## GitHub Flow——以部署为中心的开发模式

❶ 令 master 分支时常保持可以部署的状态
❷  进行新的作业时要从master分支创建新分支，新分支名称要具有 描述性
❸ 在❷新建的本地仓库分支中进行提交
❹ 在 GitHub 端仓库创建同名分支，定期 push
❺ 需要帮助或反馈时创建 Pull Request，以Pull Request进行交流 
❻ 让其他开发者进行审查，确认作业完成后与 master 分支合并 
❼ 与 master 分支合并后立刻部署

## Git Flow——以开发为中心的开发模式

<img src="https://jeffkreeftmeijer.com/git-flow/git-flow.png" width="50%">

❶  从开发版的分支（develop）创建工作分支（feature branches），进 行功能的实现或修正
❷  工作分支（feature branches）的修改结束后，与开发版的分支 （develop）进行合并
❸ 重复上述❶和❷，不断实现功能直至可以发布 
❹ 创建用于发布的分支（release branches），处理发布的各项工作
❺ 发布工作完成后与 master 分支合并，打上版本标签（Tag）进行发布 
❻  如果发布的软件出现BUG，以打了标签的版本为基础进行修正 （hotfixes）

###  专栏：版本号的分配规则
版本控制策略规定了软件版本号的分配规则，因此制定该策 略时应当尽量简单易懂。 比如在用 x.y.z 格式进行版本管理时的规则如下所示。

1. x 在重大功能变更或新版本不向下兼容时加 1，此时 y 与 z 的数字归 0 
2. y在添加新功能或者删除已有功能时加1，此时z的数字归0 
3. z 只在进行内部修改后加 1
下面举个具体例子：

1.0.0：最初发布的版本 …
1.0.1：修正了轻微 BUG …
1.0.2：修复漏洞 …● 
1.1.0：添加新功能 …
2.0.0：更新整体 UI 并添加新功能

这便是版本号的大致分配规则。 如果团队采用了 Git…Flow，那么成员在交流的时候会经常用 到版本号，因此版本控制策略越早制定越好

# 
> * 原文地址：[Commit messages guide](https://github.com/RomuloOliveira/commit-messages-guide/blob/master/README.md)
> * 原文作者：[RomuloOliveira](https://github.com/RomuloOliveira)

# commit 提交指南


一份理解 commit 信息重要性以及如何写好它们的指导手册。

它可以帮你了解什么是 commit，为什么填写好的信息说明比较重要，以及提供最佳实践、计划和（重新）书写良好的 commit 历史的一些建议。



## 什么是 “commit”？

简而言之，commit 就是你本地仓库中文件的一个快照。
和一些人的想法相反，[git 不仅存储文件之间的差异，还存储所有文件的完整版本](https://git-scm.com/book/eo/v1/Ekkomenci-Git-Basics#Snapshots,-Not-Differences)。
对于从一次提交到另一次提交之间未发生改变的文件，git 仅存储之前已存的同一份文件的链接。

下面的图片显示了 git 随着时间变化如何存储数据，其中每个『版本』都是一个 commit：

![](https://i.stack.imgur.com/AQ5TG.png)

## 为什么 commit 信息很重要？

- 加快和简化代码审查
- 帮助理解代码变更
- 协助解释仅靠代码无法完全描述的『为什么』
- 帮助未来的维护者明白变更的原因以及如何变更，使故障排查和调试更容易

为了最大化这些好处，我们可以使用下一节描述的一些好的实践和标准。

## 好的实践

这些是从我的经验、网络文章和其他指南中收集的一些实践案例。如果您有其他实践(或有不同意见)，请尽管随时打开 Pull Request 并贡献您的意见。

### 使用祈使形式

```
# 好示例
Use InventoryBackendPool to retrieve inventory backend
```

```
# 坏示例
Used InventoryBackendPool to retrieve inventory backend
```

**但为什么要使用祈使形式？**

一个 Commit 信息描述了提到的变化实际**做了**什么，它的影响，而非做的内容。

[这篇来自 Chris Beams 的优秀文章](https://chris.beams.io/posts/git-commit/) 给我们一个简单的句子，可以帮助我们以祈使形式来书写更好的 commit 信息：

```
If applied, this commit will <commit message>
```

示例：

```
# 好示例
If applied, this commit will use InventoryBackendPool to retrieve inventory backend
```

```
# 坏示例
If applied, this commit will used InventoryBackendPool to retrieve inventory backend
```

### 首字母大写

```
# 好示例
Add `use` method to Credit model
```

```
# 坏示例
add `use` method to Credit model
```

首字母需要大写的原因是遵守句子开头使用大写字母的语法规则。

这个实践的使用可能因人而异，团队间亦可能不同，甚至不同语言的人群间也会不同。
大写与否，一个重要的点是要保持标准一致并且遵守它。

### 尝试在不必查看源代码的情况下沟通变化内容

```
# 好示例
Add `use` method to Credit model

```

```
# 坏示例
Add `use` method
```

```
# 好示例
Increase left padding between textbox and layout frame
```

```
# 坏示例
Adjust css
```

很多场景中(例子：多次提交、多次变更和重构)这都有助于帮助代码审查者理解代码提交者当时的想法。

### 使用消息体来解释『为什么』、『是什么』、『怎么做』以及附加细节信息

```
# 好示例
修复了 InventoryBackend 子类的方法名

InventoryBackend 派生出的类没有
遵循基类接口

它之所以运行，是因为 cart 以错误的方式
调用了后端实现。
```

```
# 好示例
Cart 中对 credit 与 json 对象间做序列化和反序列化

基于两个主要原因将 Credit 实例转化成 dict：

  - Pickle 依赖于类的文件路径
  如果需要重构的话我们不想破坏任何东西
  - Dict 和内建类型在默认情况下是可以通过 pickle 来序列化的
```

```
# 好示例
Add `use` method to Credit

从 namedtuple 变成 class
是因为我们需要使用新的值来设置属性（in_use_amount）
```

提交信息的主题和正文被一个空白行分割
附加的空白行被认为是提交信息正文的一部分。

类似 `-`，`*` 和 `\` 的字符是用来提高可读性的元素。

### 避免通用消息或者没有任何上下文的消息

```
# 坏示例
Fix this

Fix stuff

It should work now

Change stuff

Adjust css
```

### 限制字符数量

[推荐](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#_commit_guidelines)主题最多使用 50 个字符，消息体最多使用 72 个字符。

### 保持语言的一致性

对于项目所有者：选择一个语言并使用该语言书写所有的 commit 信息。理想情况下，它应该匹配代码注释、默认翻译区域（对于做了本地化的应用）等等。

对于项目贡献者：基于已有 commit 历史书写同样语言的 commit 信息。

```
# 好示例
ababab Add `use` method to Credit model
efefef Use InventoryBackendPool to retrieve inventory backend
bebebe Fix method name of InventoryBackend child classes
```

```
# 好示例（葡萄牙语示例）
ababab Adiciona o método `use` ao model Credit
efefef Usa o InventoryBackendPool para recuperar o backend de estoque
bebebe Corrige nome de método na classe InventoryBackend
```

```
# 坏示例（混合了英语和葡萄牙语）
ababab Usa o InventoryBackendPool para recuperar o backend de estoque
efefef Add `use` method to Credit model
cdcdcd Agora vai
```

### 模板

这是一个样板，[由 Tim Pope 编写](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)，出现在文章[**高级 Git 手册**](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)。

```
简化变更内容到 50 字符左右或者更少

如有必要，可提供更详细的说明文字。
将它包装成大约 72 个字符左右。
在某些情况下，第一行被视为 commit 的信息主题，余下文字被认为信息正文。
将摘要和正文分离开的空白行很有必要（除非你忽略了整个正文）；
不同的工具像 `log`、`shortlog`、`rebase`，
可能会变得混乱，如果你同时运行两个。

解释本次 commit 正在解决的问题。
专注于此次变更的原因，而非如何变更（代码会解释这点）。
此次变更是否有副作用或其他隐性后果？
这里就是解释它们的地方。

空白行之后有更进一步的段落。

 - 也可以用要点符号。

 - 通常使用连字符或者星号作为要点符号，
 前面有一个空格，中间有空白行，
 但是约定惯例各不相同。

如果你使用问题跟踪，在底部放置它们的引用，
像下面这样：

Resolves: #123
See also: #456, #789
```

## Rebase 与 Merge

这节是 Atlassian 优秀教程中的一个 **TL;DR**，[“Merge 与 Rebase”](https://www.atlassian.com/git/tutorials/merging-vs-rebasing)。

![](https://wac-cdn.atlassian.com/dam/jcr:01b0b04e-64f3-4659-af21-c4d86bc7cb0b/01.svg?cdnVersion=hq)

### Rebase

**TL;DR:** 把你的分支中的 commit 一个接一个地应用到 base 分支，生成一个新树。

![](https://wac-cdn.atlassian.com/dam/jcr:5b153a22-38be-40d0-aec8-5f2fffc771e5/03.svg?cdnVersion=hq)

### Merge

**TL;DR:** 使用两个分支间的差异，创建新的 commit，称作（适当地）**merge 提交**。

![](https://wac-cdn.atlassian.com/dam/jcr:e229fef6-2c2f-4a4f-b270-e1e1baa94055/02.svg?cdnVersion=hq)

### 为什么有些人更倾向于 merge 而不是 rebase？

我尤其更倾向于 rebase 而不是 merge，理由包含：

* 它生成了一个『整洁的』提交历史，没有不必要的 merge commit。
* **所见即所得**，举例，在一次代码审查中，所有的变更来自对应某种特殊化的标注的 commit，避免了来隐藏在 merge commit 中的变更。
* 更多的 merge 被提交者解决，并且每个 merge 变化对应着具备合适信息的 commit。
    * 对 merge 类 commit 做挖掘和审核并不常见，因此避免这类操作可以确保所有的变更都归属于某个 commit。

### 何时做 squash？

“Squashing” 是处理一系列 commit 并将它们压缩为一个 commit 的过程。

它在多种情况下都有用，例子：

- 减少包含少量或者没有上下文的 commit（错误修正、格式化、遗忘的内容）
- 将某些合并应用时更合理的独立变更结合起来
- 重写**正在进行中**这类 commit

### 何时避免 rebase 和 squash？

避免在多人协作的公共 commit 或者共享分支中执行 rebase 和 squash。
rebase、squash 重写历史记录、覆盖已有 commit，在共享分支的 commit 中执行以上操作（例子，推送到远程仓库的 commit 或者来自其他分支的 commit）可能造成混淆，并且由于分歧的树干和冲突大家可能会丢失他们的变更（本地和远程的）。

## 有用的 git 命令

### rebase -i

使用它来压制 commit，编辑信息，重写/删除/重新排序 commit，等等。

```
pick 002a7cc Improve description and update document title
pick 897f66d Add contributing section
pick e9549cf Add a section of Available languages
pick ec003aa Add "What is a commit" section"
pick bbe5361 Add source referencing as a point of help wanted
pick b71115e Add a section explaining the importance of commit messages
pick 669bf2b Add "Good practices" section
pick d8340d7 Add capitalization of first letter practice
pick 925f42b Add a practice to encourage good descriptions
pick be05171 Add a section showing good uses of message body
pick d115bb8 Add generic messages and column limit sections
pick 1693840 Add a section about language consistency
pick 80c5f47 Add commit message template
pick 8827962 Fix triple "m" typo
pick 9b81c72 Add "Rebase vs Merge" section

# Rebase 9e6dc75..9b81c72 onto 9e6dc75 (15 commands)
#
# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into the previous commit
# f, fixup = like "squash", but discard this commit's log message
# x, exec = run command (the rest of the line) using shell
# d, drop = remove commit
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out
```

#### fixup

使用它轻松地清理 commit 并且无须一个更复杂的 rebase 操作。
[这篇文章](http://fle.github.io/git-tip-keep-your-branch-clean-with-fixup-and-autosquash.html)提供了如何以及何时这么做的很好的示例。

### cherry-pick

它非常适用于在发布到错误分支上的 commit，无须再次编码。

示例：

```
$ git cherry-pick 790ab21
[master 094d820] Fix English grammar in Contributing
 Date: Sun Feb 25 23:14:23 2018 -0300
 1 file changed, 1 insertion(+), 1 deletion(-)
```

### add/checkout/reset [--patch | -p]

假设我们有以下差异：

```diff
diff --git a/README.md b/README.md
index 7b45277..6b1993c 100644
--- a/README.md
+++ b/README.md
@@ -186,10 +186,13 @@ bebebe Corrige nome de método na classe InventoryBackend
 ``
 # 坏示例（混合英语和葡萄牙语）
 ababab Usa o InventoryBackendPool para recuperar o backend de estoque
-efefef Add `use` method to Credit model
 cdcdcd Agora vai
 ``

+### 样板
+
+这是一个样板，[由 Tim Pope 编写](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)，出现在文章 [**高级 Git 手册**](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)。
+
 ## 贡献

 感谢任何形式的帮助，可以帮到我的主题示例：
@@ -202,3 +205,4 @@ 感谢任何形式的帮助，可以帮到我的主题示例：

 - [如何书写 Git 的 Commit 信息](https://chris.beams.io/posts/git-commit/)
 - [高级 Git 手册 —— Commit 指导](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#_commit_guidelines)
+- [A Note About Git Commit Messages](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
```

我们可以使用 `git add -p` 来只添加我们需要的补丁，无须修改已经编写的代码。
将较大的变更拆分成小的 commit 或者重置/检出特殊的变更。

```
暂存这个区块 [y,n,q,a,d,/,j,J,g,s,e,?]? s
拆分成 2 个区块
```

#### 区块 1

```diff
@@ -186,7 +186,6 @@
 ``
 # 坏示例 (mixes English and Portuguese)
 ababab Usa o InventoryBackendPool para recuperar o backend de estoque
-efefef Add `use` method to Credit model
 cdcdcd Agora vai
 ``

暂存这个区块 [y,n,q,a,d,/,j,J,g,e,?]？
```

#### 区块 2

```diff
@@ -190,6 +189,10 @@
 ``
 cdcdcd Agora vai
 ``

+### 样板
+
+这是一个样板，[由 Tim Pope 编写](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)，出现在文章 [**高级 Git 手册**](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)。
+
 ## 贡献

感谢任何形式的帮助，可以帮到我的主题示例：
暂存这个区块 [y,n,q,a,d,/,K,j,J,g,e,?]？
```

#### 区块 3

```diff
@@ -202,3 +205,4 @@ 感谢任何形式的帮助，可以帮到我的主题示例：

 - [如何书写 Git 的 Commit 信息](https://chris.beams.io/posts/git-commit/)
 - [高级 Git 手册 —— Commit 指导](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#_commit_guidelines)
+- [关于 Git 的 Commit 信息的注意事项](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
```




## 灵感、来源和进一步阅读材料

- [如何书写 Git 的 Commit 信息](https://chris.beams.io/posts/git-commit/)
- [高级 Git 手册 —— Commit 指导](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#_commit_guidelines)
- [关于 Git 的 Commit 信息的注意事项](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
- [Merge 与 Rebase](https://www.atlassian.com/git/tutorials/merging-vs-rebasing)
- [高级 Git 手册 —— 重写历史](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)
