---
title: "Dockerfile的最佳实践"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 1. Dockerfile 编写

如何写好Dockerfile，


准则和建议
Dockerfile 指令
FROM
LABEL
RUN
APT-GET
USING PIPES
CMD
EXPOSE
ENV
ADD or COPY
ENTRYPOINT
VOLUME
USER
WORKDIR
ONBUILD

## 1.1. 准则和建议
Docker 官方提供了一些建议和准则，在大多数情况下建议遵守。
1. 容器是短暂的，也就是说，你需要可以容易的创建、销毁、配置你的容器。
2. 多数情况，构建镜像的时候是将 Dockerfile 和所需文件放在同一文件夹下。但为了构建性能，我们可以采用 `.dockerignore` 文件来排除文件和目录。
3. 避免安装不必要的包，构建镜像应该尽可能减少复杂性、依赖关系、构建时间及镜像大小。
4. 最小化层数。
5. 排序多行参数，通过字母将参数排序来缓解以后的变化，这将帮你避免重复的包、使列表更容易更新，如：
```DOCKERFILE
# DOCKERFILE
RUN apt-get update && apt-get install -y \
  bzr \
  cvs \
  git \
  mercurial \
  subversion
```
6. 构建缓存，大家知道 Docker 构建镜像的过程是顺序执行 Dockerfile 每个指令的过程。执行过程中，Docker 将在缓存中查找可重用的镜像，如果不想使用缓存，你也可以使用 `docker build --no-cache=true ...` 命令。

如果使用缓存，docker 将使用一下基本规则：

从第一条指令开始，它将比较从基础镜像导出的所有子镜像，查看是否有相同的的构建指令，以此来获取缓存。
在大多数情况下，简单地比较 Dockerfile 与其中一个子镜像的指令是足够的。但是，某些说明需要更多的检查和解释。
对于 ADD 和 COPY 指令，会去比较文件的校验和，但不考虑文件的修改时间和访问时间。如果有任何变化，缓存无效。
除了 ADD 和 COPY 指令，缓存检查不会查看容器中的文件来确定缓存匹配。例如，当处理 RUN apt-get -y update 命令时，将不会检查在容器中更新的文件以确定是否存在高速缓存命中。在这种情况下，只需使用命令字符串本身来查找匹配。
一旦缓存无效，所有后续 Dockerfile 命令将生成新的映像，并且高速缓存将不被使用。

## 1.2. Dockerfile 指令
那么如何最好的编写 Dockerfile 呢，下面有一些建议。

### 1.2.1. FROM
尽可能的使用官方仓库存储的镜像作为基础镜像。官方建议使用 Debian，大小在 150mb 左右。不过在实际开发中，应该用到 alpine 的次数比较多，因为它仅 5mb 左右。

### 1.2.2. LABEL
了解对象标签。你可以给镜像添加标签（LABEL），如记录许可信息，帮助自动化或其他信息。对象标签以键值对的形式出现，如果包含空格请用 " 扩起来。标签对象必须唯一，否则后者会覆盖前者。键可以包含 .、-、a-zA-Z、0-9。更多信息参考 Docker object labels。下面是一些例子：
```DOCKERFILE
# Set one or more individual labels
LABEL com.example.version="0.0.1-beta"
LABEL vendor="ACME Incorporated"
LABEL com.example.release-date="2015-02-12"
LABEL com.example.version.is-production=""

# Set multiple labels on one line
LABEL com.example.version="0.0.1-beta" com.example.release-date="2015-02-12"

# Set multiple labels at once, using line-continuation characters to break long lines
LABEL vendor=ACME\ Incorporated \
      com.example.is-beta= \
      com.example.is-production="" \
      com.example.version="0.0.1-beta" \
      com.example.release-date="2015-02-12"
RUN
```
最常见的应该是安装软件包，如 RUN apt-get install -y foo...，你可以通过 \ 分隔成多行。

### 1.2.3. APT-GET
使用 apt-get 你可以安装软件包，但这里有一些需要注意的地方。

您应该避免 RUN apt-get upgrade 或者 dist-upgrade，如果你需要更新软件包，使用 apt-get install -y foo 命令将会自动更新。

你应该将 RUN apt-get update 和 apt-get install 结合使用：

```DOCKERFILE
RUN apt-get update && apt-get install -y \
    package-bar \
    package-baz \
    package-foo
```
如果单独使用，会导致缓存失效或后续 apt-get install 指令失败，如：

```DOCKERFILE
FROM ubuntu:14.04
RUN apt-get update
RUN apt-get install -y curl
```
why？ok，第一执行构建该镜像是没问题的。可是当你第二次构建，Docker 会将 RUN apt-get update 看作是与镜像一是同一指令，会命中缓存。导致结果就是，你可能会安装一些过时的软件包。所以，使用 `RUN apt-get update && apt-get install -y `能够破解缓存机制，实现清除缓存的结果。

下面是一个使用 apt-get 的指导建议：

```DOCKERFILE
RUN apt-get update && apt-get install -y \
    aufs-tools \
    automake \
    build-essential \
    curl \
    dpkg-sig \
    libcap-dev \
    libsqlite3-dev \
    mercurial \
    reprepro \
    ruby1.9.1 \
    ruby1.9.1-dev \
    s3cmd=1.1.* \
 && rm -rf /var/lib/apt/lists/*
```
当然 alpine 的使用也是同样的情况：

```DOCKERFILE
apk add --update --no-cache sudo make
USING PIPES
```
在 RUN 指令中使用 | 会有什么问题，Docker 只关注最后一个命令执行的正确与否，如：

RUN wget -O - https://some.site | wc -l > /number
即使 wget 失败，wc 成功也会成功构建镜像。

所以，如果想要执行过程中产生任何错误都失败，需要使用到 set -o pipefail &&。如：

RUN set -o pipefail && wget -O - https://some.site | wc -l > /number
### 1.2.4. CMD
如果你的镜像用于 Server，CMD 的形式一般都是 CMD [“executable”, “param1”, “param2”…]。如 CMD ["apache2","-DFOREGROUND"]。

CMD 还在大多数情况以交互式的方式出现。如 CMD ["python"]，当你执行 docker run -it python 的时候，将进入 shell 的交互模式。

CMD 很少以 CMD [“param”, “param”] 协同 ENTRYPOINT 工作，除非你很了解它们的运行机制。

### 1.2.5. EXPOSE
指定容器侦听端口，应该尽量使用应用程序通用的传统端口，如 Apache Web 服务器使用 EXPOSE 80 等。

### 1.2.6. ENV
为容器添加环境变量，常用于为应用程序提供必要的环境变量以及版本号的设置，如：

```DOCKERFILE
ENV PG_MAJOR 9.3
ENV PG_VERSION 9.3.4
RUN curl -SL http://example.com/postgres-$PG_VERSION.tar.xz | tar -xJC /usr/src/postgress && …
ENV PATH /usr/local/postgres-$PG_MAJOR/bin:$PATH
```
### 1.2.7. ADD or COPY?

这两者很相似，**推荐有限选择 COPY**，它比 ADD 透明度更高。

COPY，只支持将本地文件复制到容器中
ADD，除了 COPY 的功能外，还支持远程 URL。但最好的用途是将本地 tar 文件提取到镜像中 ADD rootfs.tar.xz /。
如果在 Dockerfile 中使用不用的文件，那么 COPY 它们可以单独使用。这样，特定文件的更改，将确保每一步的构建缓存无效，如：

```DOCKERFILE
COPY requirements.txt /tmp/
RUN pip install --requirement /tmp/requirements.txt
COPY . /tmp/
```
将 COPY . /tmp/ 放在后面，这能够使 RUN 的缓存无效的数量减少。

因为镜像大小很重要，故用 ADD 远程 URL 提取包是不被鼓励的，因该使用 curl 或 wget 替代。这样，能够减小镜像的层数。例如，你应该避免这样做：


```DOCKERFILE
ADD http://example.com/big.tar.xz /usr/src/things/
RUN tar -xJf /usr/src/things/big.tar.xz -C /usr/src/things
RUN make -C /usr/src/things all
```
而是：


```DOCKERFILE
RUN mkdir -p /usr/src/things \
    && curl -SL http://example.com/big.tar.xz \
    | tar -xJC /usr/src/things \
    && make -C /usr/src/things all
```
对于不需要 ADD tar 自动提取功能的其他项目（文件，目录），您应该始终使用 COPY。

### 1.2.8. ENTRYPOINT
ENTRYPOINT 的最好的用途时设置镜像的主命令，用 CMD 作为参数，这样就可以是镜像像命令一样运行。如：

ENTRYPOINT ["s3cmd"]
CMD ["--help"]
当我们运行该镜像的时候，就会打印出帮助信息：

$ docker run s3cmd
你也可以通过命令行覆盖 CMD 参数：

$ docker run s3cmd ls s3://mybucket
ENTRYPOINT 也可以于脚本组合使用，允许其以类似于上述命令的方式运行。如一个 Postgres Official Image 的例子。：


```shell
#!/bin/bash
set -e

if [ "$1" = 'postgres' ]; then
    chown -R postgres "$PGDATA"

    if [ -z "$(ls -A "$PGDATA")" ]; then
        gosu postgres initdb
    fi

    exec gosu postgres "$@"
fi

exec "$@"
```
注：此脚本使用的 exec bash 命令 ，使最终运行的应用程序成为容器的 PID 1。这允许应用程序接收发送到容器任何 Unix 信号。有关 ENTRYPOINT 详细信息，请参阅帮助。

将脚本复制到容器，并通过 ENTRYPOINT 开始运行：

COPY ./docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
此脚本允许用户以多种方式与 Postgres 进行交。它可以简单地启动Postgres：

$ docker run postgres
或者，它可以用于运行 Postgres 并将参数传递给服务器：

$ docker run postgres postgres --help
它也可以用来启动一个完全不同的工具，比如 Bash：

$ docker run --rm -it postgres bash
VOLUME
VOLUME 指令应该用于如下内容：任何类型的数据库存储区域、配置存储、容器创建的文件或目录。

推荐 VOLUME 用于挂载镜像中那些经常变化（易变化的）或者用户可维护的部分。

USER
如果一个服务不需要超级权限来运行，你可以通过 USER 切换成非 root 用户。在 Dockerfile 中用如下方式创建：

RUN groupadd -r postgres && useradd --no-log-init -r -g postgres postgres
注意，重新构建镜像时，UID／GID 是不确定的，故你应该显示的分配 UID 和 GID。

我们尽量避免安装和使用 sudo，因为它有不可预知的 TTY 和信号转发行为，这会给我们带来更多问题需要解决。如果一定要使用类似 sudo 功能（例如，以 root 用户身份初始化守护程序，但以非 root 身份运行），我们可以使用 gosu 替代它。

最后，为了减少层数和复杂度，避免频繁使用 USER 进行用户切换。

WORKDIR
为了清楚可靠，你应该使用绝对路径作为 WROKDIR。而不是增加的指令，如 RUN cd … && do-something 难以阅读，排除故障和维护。

ONBUILD
ONBUILD 指令在当前 Dockerfile 构建完成后执行，存储到镜像 的manifest 清单中，我们可以通过 docker inspect 查看 OnBuild 的信息。

当我们使用带有 ONBUILD 触发器的镜像作为基础镜像来创建新镜像时，当 Dockerfile 执行到 FROM 时会自动查找 OnBuild 信息并执行这个触发器命令。成功后继续向下执行下一条指令，失败的话就停止向下执行并中止创建过程。如果成功创建了新的镜像后，这个新镜像中不会继承基础镜像中的 ONBUILD 触发器内容。参考 Ruby’s ONBUILD variants。

建立的图像 ONBUILD 应该有一个单独的标签，例如：ruby:1.9-onbuild 或 ruby:2.0-onbuild。

当把 ADD 或 COPY 加入 ONBUILD 中时要小心，如果新创建镜像的上下文缺少这些要添加的资源情况会导致创建的失败。因而添加单独的标签可以帮助我们减小这种情况发生的可能， 让 Dockerfile 作者来做决定。

## 2. Docker修改时区


二. 常见容器
1. Alpine
```dockerfile
FROM alpine:latest
# 安装tzdata
RUN apk add --no-cache tzdata
# 设置时区
ENV TZ="Asia/Shanghai"
```
• 验证
```shell
docker build -t alpine:time .
docker run --rm -it alpine:time date
```
2. Ubuntu
```dockerfile
FROM ubuntu
# 设置localtime
# 此处需要优先设置localtime，否则安装tzdata将会进入时区选择
RUN ln -fs /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# 安装tzdata
RUN apt-get update \
		&& apt-get install tzdata -y \
		&& apt-get clean
```
• 验证
```shell
docker build -t ubuntu:time .
docker run --rm -it ubuntu:time date
```
