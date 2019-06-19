---
title: "Git 常用指令及开发流程"
layout: page
date: 2099-06-02 00:00
---
[TOC]
# git常用指令


参考资料
https://learngitbranching.js.org/
《GitHub入门与实践》
<img src="./images/Git_V2.16.2.png" >

## 新建，初始化代码库
```shell
# 在当前目录新建一个Git代码库
git init

# 新建一个目录，将其初始化为Git代码库
git init [project-name]

# 下载一个项目和它的整个代码历史
git clone [url]
```

<<<<<<< HEAD
## 增加/删除文件
=======
## 仓库内文件管理
### 增加/删除文件到暂存区
>>>>>>> release
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
<<<<<<< HEAD

## 代码提交
=======
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
>>>>>>> release
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

## 分支管理
<<<<<<< HEAD
=======
### 查看
>>>>>>> release
```shell
# 列出所有本地分支
git branch

# 列出所有远程分支
git branch -r

# 列出所有本地分支和远程分支
git branch -a
<<<<<<< HEAD

=======
```
### 创建
```shell
>>>>>>> release
# 新建一个分支，但依然停留在当前分支
git branch [branch-name]

# 新建一个分支，并切换到该分支
git checkout -b [branch-name]

# 新建一个分支，指向指定commit
git branch [branch-name] [commit]

# 创建一个完全独立没有log的分支
git checkout --orphan  [branch-name]

# 新建一个分支，与指定的远程分支建立追踪关系
git branch --track [branch-name] [remote-branch]
<<<<<<< HEAD

=======
```
### 切换分支
```shell 
>>>>>>> release
# 切换到指定分支，并更新工作区
git checkout [branch-name]

# 切换到上一个分支
git checkout -
<<<<<<< HEAD

=======
```
### 合并分支
```shell 
>>>>>>> release
# 建立追踪关系，在现有分支与指定的远程分支之间
git branch --set-upstream [branch-name] [remote-branch]

# 合并指定分支到当前分支
git merge [branch-name]

# 选择一个commit，合并进当前分支
git cherry-pick [commit]

<<<<<<< HEAD
# 删除分支
git branch -d [branch-name]
=======
git rebase
小结

    rebase 操作可以把本地未push的分叉提交历史整理成直线；

    rebase的目的是使得我们在查看历史提交的变化时更容易，因为分叉的提交需要三方对比。

```
###  删除
```shell
# 删除分支
git branch -d [branch-name]
git branch -D [branch-name] # 强制删除
>>>>>>> release

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

## 信息查看
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

# 显示当前分支的最近几次提交
git reflog
```

<<<<<<< HEAD
## 远程同步
``` shell 
# 下载远程仓库的所有变动
git fetch [remote]
=======
### log管理
#### 1. 清空 log
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
###  优雅的查看log

参考：https://stackoverflow.com/questions/1057564/pretty-git-branch-graphs

```shell
git log --all --decorate --oneline --graph
```
可以在git config里面设置 别名 alias
```shell
git config --global alias.adog "log --all --decorate --oneline --graph"
git adog 
```


## 远程同步
``` shell 
# 下载远程仓库的所有变动
git fetch [remote shortname]
>>>>>>> release

# 显示所有远程仓库
git remote -v

# 显示某个远程仓库的信息
<<<<<<< HEAD
git remote show [remote]

# 增加一个新的远程仓库，并命名
git remote add [shortname] [url]

# 取回远程仓库的变化，并与本地分支合并
git pull [remote] [branch]

# 上传本地指定分支到远程仓库
git push [remote] [branch]

# 强行推送当前分支到远程仓库，即使有冲突
git push [remote] --force

# 推送所有分支到远程仓库
git push [remote] --all
=======
git remote show [remote shortname]

# 增加一个新的远程仓库，并命名
git remote add [remote shortname] [url]

# 取回远程仓库的变化，并与本地分支合并
# pull=fetch+merge 
git pull [remote shortname] [branch-name]

# 上传本地指定分支到远程仓库
git push [remote shortname] [branch-name]

# 强行推送当前分支到远程仓库，即使有冲突
git push [remote shortname] --force

# 推送所有分支到远程仓库
git push [remote shortname] --all

das?
>>>>>>> release
```

## 版本退回

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
<<<<<<< HEAD
## 清除log
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
=======

>>>>>>> release

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

<img src="https://img-blog.csdn.net/20180624174835949?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1NodVNoZW5nMDAwNw==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70" width="50%">

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