---
title: "[应用]基于OpenSSL的CA签发全流程"
layout: page
date: 2099-06-02 00:00
---
[TOC]


# 1. 基础

## 1.1. 基本概念
**CA（Certification Authority）认证中心**：证明A发的公钥P_A 确实是A的

CA也由证书和私钥组成，它的证书和普通的证书长得差不多，只是其中的Basic Constraint字段里面的CA值为True而已，普通的服务器证书这一块为False，但是因为有了这个True，所以CA可以签发别的证书。


### 证书分类
可以从两个维度去看证书的分类，一种是商业角度，为了区分不同的用户级别，服务端证书可以分成DV、OV和EV证书。

#### 1.1.1. DV
DV（Domain Validation）证书只进行域名的验证，一般验证方式是提交申请之后CA会往你在whois信息里面注册的邮箱发送邮件，只需要按照邮件里面的内容进行验证即可。

#### 1.1.2. OV
OV（Organization Validation）证书在DV证书验证的基础上还需要进行公司的验证，一般他们会通过购买邓白氏等这类信息库来查询域名所属的公司以及这个公司的电话信息，通过拨打这个公司的电话来确认公司是否授权申请OV证书。
#### 1.1.3. EV
EV（Extended Validation Certificate）扩展验证证书 一般是在OV的基础上还需要公司的金融机构的开户许可证，不过不同CA的做法不一定一样，例如申请人是地方政府机构的时候是没有金融机构的开户证明的，这时候就会需要通过别的方式去鉴别申请人的实体信息。

![](../../../../../attach/images/2019-12-13-15-43-42.png)



## 1.2. 证书相关文件说明

| 格式     | 描述                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| .key格式 | 私有的密钥                                                                    |
| .csr格式 | 证书签名请求（证书请求文件），含有公钥信息，certificate signing request的缩写 |
| .crt格式 | 证书文件，certificate的缩写                                                   |
| .crl格式 | 证书吊销列表，Certificate Revocation List的缩写                               |
| .pem格式 | 用于导出，导入证书时候的证书的格式，有证书开头，结尾的格式 （crt）+（key）    |

### key 

经过加密的私钥

### CSR

CSR 即证书签名申请（Certificate Signing Request），获取 SSL 证书，需要先生成 CSR 文件并提交给证书颁发机构（CA）。CSR 包含了公钥和标识名称（Distinguished Name），通常从 Web 服务器生成 CSR，同时创建加解密的公钥私钥对。


CSR是以-----BEGIN CERTIFICATE REQUEST-----开头，-----END CERTIFICATE REQUEST-----为结尾的base64格式的编码。将其保存为文本文件，就是所谓的CSR文件。


在创建 CSR 过程中，需要提供相关组织机构信息，web 服务器会根据提供的信息创建证书的标识名称，用来识别证书，内容如下：

国家或地区代码
您的组织机构依法注册所在的国家或地区的代码，以国际标准化组织（ISO）的两字母格式表示。

省或市或自治区
您的组织机构所在的省或市或自治区。

城市或地区
您的组织机构注册或所在的城市或地区。

组织机构
您的企业依法注册所用的名称。

组织机构单位
此字段用于区分组织机构中的各部门，例如 “工程部” 或 “人力资源部”。

通用名称
在 CSR 的通用名称字段中输入的名称必须是您要为其使用证书的网站的完全限定域名（FQDN），例如 “www.domainnamegoeshere”。

但是腾讯云采用了在线生成 CSR 的方式，无需您生成和提交 CSR 文件，域名型证书仅需要提交通用名称即可申请，帮助您简化申请流程。





### pem 
生成pem格式证书
有时需要用到pem格式的证书，可以用以下方式合并证书文件（crt）和私钥文件（key）来生成

```
$ cat client.crt client.key> client.pem 
$ cat server.crt server.key > server.pem
```


## 1.3. openssl 的使用

### 1.3.1. 创建RSA私钥
```
# PEM格式
openssl genrsa -des3 -out ca.key 1024
```

`openssl genrsa` 生成rsa加密私钥[^1]

`-des3` 出书的私钥通过des3算法加密

`1024` 1024 位

该命令会在当前文件夹下生成名为`ca.key`的私钥文件，该文件通过des3密码保护


`ca.key` 如下:
```
-----BEGIN RSA PRIVATE KEY-----
**************%%%%%%
-----END RSA PRIVATE KEY-----
```


### 1.3.2. 生成 csr

``` shell
openssl req -new -key <file_name>.key -out <file_name>.csr -config csr.conf

# <file_name>.key  私钥文件名
# <file_name>.csr  生成的csr 文件名
```

`openssl req`的基本功能主要有两个[^2]：
1. 生成证书请求
2. 生成自签名证书。

其他还有一些校验、查看请求文件等功能，示例会简单说明下。参数说明如下
-new  要生成证书请求
-x509 要生成自签名证书
-days 有效期

`csr.conf` 配置文件的内容 
```conf
# csr.conf
[ req ]
default_bits = 2048
prompt = no
default_md = sha256
req_extensions = req_ext
distinguished_name = dn

[ dn ]
C = <country> # 必须是2个字符
ST = <state>
L = <city>
O = <organization>
OU = <organization unit>
CN = <MASTER_IP>

[ req_ext ]
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = kubernetes
DNS.2 = kubernetes.default
DNS.3 = kubernetes.default.svc
DNS.4 = kubernetes.default.svc.cluster
DNS.5 = kubernetes.default.svc.cluster.local
IP.1 = <MASTER_IP>
IP.2 = <MASTER_CLUSTER_IP>

[ v3_ext ]
authorityKeyIdentifier=keyid,issuer:always
basicConstraints=CA:FALSE
keyUsage=keyEncipherment,dataEncipherment
extendedKeyUsage=serverAuth,clientAuth
subjectAltName=@alt_names
```

### 1.3.3. 创建CA证书

```shell
# (PEM格式,假如有效期为356天)
openssl req -new -x509 -days 365 -key ca.key -out ca.crt -config openssl.cnf
```




openssl是可以生成`.der`格式的CA证书的，最好用IE将`.pem`格式的CA证书转换成`der`格式的CA证书。




### 从CA 获取证书 

openssh 

```shell
openssl ca  -config文件名
# (CA自签)
```

https://www.openssl.org/docs/man1.0.2/man1/ca.html
它可以用来以各种形式签署证书申请并生成CRL，它还维护已颁发证书及其状态的文本数据库。
将 CSR 发送到证书颁发机构以获取 SSL 证书



# 2. 自建 Root CA 基本流程

关键就是两个文件
1. 密钥 `.key`
2. 证书 `.crt` （`.csr`是中间文件一旦证书生成就不需要了）

**root CA**、**服务器**、**客户端**各有一组而已。

私钥是保密的，所以`.key`,`.pem`文件是不能分发的，可以生成单独的公钥文件发布，但使用证书文件更好，因为证书里不仅包含公钥，还提供了该公钥的身份信息以咨校验


很多网站都希望用户知道他们建立的网络通道是安全的，所以会想 CA 机构购买证书来验证 domain，所以我们也可以在很多 HTTPS 的网页地址栏看到一把小绿锁。

然而在一些情况下，我们没必要去 CA 机构购买证书，比如在内网的测试环境中，为了验证 HTTPS 下的一些问题，我们不需要部署昂贵的证书，这个时候自建 Root CA，给自己颁发证书就显得很有价值了。

## 2.1. Root CA 根证书的生成
生成CA的私钥（.key）-->生成CA证书请求（.csr）-->自签名得到根证书（.crt）（CA给自已颁发的证书）。

`ca.key`->`ca.csr`->`ca.crt`
```shell
# 自建根认证中心 root CA
# Generate CA private key
openssl genrsa -out ca.key 2048
# Generate CSR 
openssl req -new -key ca.key -out ca.csr
# Generate Self Signed certificate（CA 根证书）
openssl x509 -req -days 365 -in ca.csr -signkey ca.key -out ca.crt
```
## 2.2. 服务器证书的生成
生成私钥（.key）-->生成证书请求（.csr）-->用CA根证书签名(ca.crt)得到证书（.crt）

`service.key`->`service.csr`->`service.crt`

```shell
### 服务器端用户证书
# private key
openssl genrsa -des3 -out server.key 1024 
# generate csr
openssl req -new -key server.key -out server.csr -config csr.conf

# generate certificate
openssl ca -in server.csr -out server.crt -cert ca.crt -keyfile ca.key
```

在生成 `server.csr` 时需要配置 `csr.conf`



## 2.3. 客户端生成证书
生成私钥（`.key`）-->生成证书请求（`.csr`）-->用CA根证书签名得到证书（`.crt`）

```shell
### 客户端用户证书
# private key
openssl genrsa -des3 -out client.key 1024 
# generate csr
openssl req -new -key client.key -out client.csr
# generate certificate
openssl ca -in client.csr -out client.crt -cert ca.crt -keyfile ca.key
```

# 申请知名CA代理商的证书

第一步：将CSR提交到代理商

CSR(Certificate Signing Request)文件必须由用户自己生成，也可以利用在线CSR生成工具。选择要申请的产品，提交一个新的订单，并将制作好的CSR文件提交。

第二步 资料提交到CA

当收到您的订单和CSR后，如果是域名验证型证书(DV SSL证书)，在域名验证之后10分钟左右就可颁发证书，若是其他类型证书则是需要通过CA机构进行验证之后才可颁发。


第三步 发送验证邮件到管理员邮箱

权威CA机构获得资料后，将发送一封确认信到管理员邮箱，信中将包含一个 对应的链接过去。每一个订单，都有一个唯一的PIN以做验证用。



第四步 邮件验证

点击确认信中的链接，可以访问到CA机构验证网站，在验证网站，可以看到该订单的申请资料，然后点击”I Approve”完成邮件验证。



第五步 颁发证书

在用户完成邮件验证之后，CA机构会将证书通过邮件方式发送到申请人自己的邮箱。



当用户收到ssl证书后就可以配置到服务器上。这样的话我们就可以使用了，当然我们一定要先验证一下是否可以使用，因为这样的话更加放心一点，如果不可以使用的话，可以联系一下ssl证书的客服，看一下是什么原因造成的。


penssl.cnf配置文件由许多节(section)组成， 这些节指定了一系列由openssl命令使用的默认值
```
[req] 变量
req节包含下列设置:

default_bits=1024
default_keyfile=privkey.pem
distinguished_name=req_distingguished_name  # section name
attributes=req_attributes                   # section name

default_bits       : 是你希望使用的RSA key的默认长度,其它的可能值是512,2048和4096
default_keyfile    : 由req建立的私钥文件的默认文件名.
distinguished_name : 也是配置文件中的节,这个节为distinguished name域各组件定义默认值.req_attributes
变量指定配置文件中 定义证书请求属性的默认值的节.

[ca] 变量
你可以配置openssl.cnf来支持许多为签名CSR文件而有着不同策略 (policy)的CA.
-name参数来指定要使用哪个CA节.例如：

 openssl ca -name MyCa ...

这 个命令引用CA的节[MyCa], 如果-name没被提供给ca命令,那就使用default_ca变量指定的节.
可以有多个不同的CA,但只 能有一个是默认的CA。

可能的[ca]变量包含如下内容：
dir: CA数据库的位置.
  数据库是指一个简单的文本数据库，里面包含由tab分隔的字段:
  status        : 'R' - revoked(撤销的), 'E' - expired(过期的), 'V' - 有效
  issued date   : 发证日期
  revoked date  : 撤销日期,如果没被撤销,空
  serial number : 序号
  certificate   : 证书存放位置
  CN            : 证书的文件名

  serial字段应当是唯当像CN/status组合一样是唯一的,ca程序在启动时检测这些值.

certs: 所有以前发布的证书保存的地方.

[policy] 变量
如果ca命令的-policy参数没被提供,policy变量指定默认的 policy节.
CA策略节表示在证书在被CA签发前，证书请求的内容必须被满足的必要条件.
例子定义了两个policy: policy_match和policy_anything.

看一下如下值：
countryName=match
这意味 着country name必须匹配CA证书。

organisationalUnitName=optional
这表示 organistationalUnitName是可选的.

commonName=supplied
这表示commonName 在证书请求中必须提供


例子openssl.cnf文件的policy_match节指定了在生成的证书中属性的顺序，如下：
countryName
stateOrProvinceName
organizationName
organizationalUnitName
commonName
emailAddress

```

# 3. 参考资料

[^1]:https://www.openssl.org/docs/man1.0.2/man1/openssl-genrsa.html
[^2]:https://www.openssl.org/docs/man1.0.2/man1/openssl-req.html
[^3]:Openssl基础 https://www.wanglibing.com/2019/01/24/Openssl%E5%9F%BA%E7%A1%80/
