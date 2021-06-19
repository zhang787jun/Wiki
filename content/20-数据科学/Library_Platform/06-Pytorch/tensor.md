---
title: "Pytorch--Tensor基本操作"
date: 2019-06-12 00:00
render: True 
tag: Pytorch,框架,AI,
---
[TOC]
Tensor基本操作#
创建tensor：#
​ 1.numpy向量转tensor：

Copy
a=np.array([2,2,2])
b=torch.from_numpy(a)
​ 2.列表转tensor：

Copy
a=torch.tensor([2,2])
b=torch.FloatTensor([2,2.])#不常用
c=torch.tensor([[1,2],[3,4]])#2*2矩阵
​ 3.利用大写接受shape创建:

Copy
torch.empty(2,3)#生成一个2*3的0矩阵
torch.Tensor(2,3)#生成一个2*3的随机矩阵
torch.IntTensor(2,3)
torch.FloatTensor(2,3).type()
默认下，Tensor为‘torch.FloatTensor’类型，若要改为double类型的，则需要执行

torch.set_default_tensor_type(torch.DoubleTensor)来修改。

​ 4.随机创建Tensor：

Copy
a=torch.rand(3,3)#创建3*3的0到1均匀分布的矩阵
a=torch.randn(3,3)#均值为0方差为1正态分布矩阵

torch.rand_like(a)#等价于下一条
torch.rand(a.shape)

torch.randint(1,10,[3,3])#创建3*3的1到10随机分布的整数矩阵
​ 5.创建相同数的矩阵：

Copy
torch.full([3,3],1)#生成3*3的全为1的矩阵
torch.full([],1)#生成标量1
torch.full([2],1)#生成一个长度为2的值全为1的向量
torch.ones(3,3)
torch.zeros(3,3)
torch.eye(3,4)#生成对角为1矩阵，若不是对角矩阵，则多余出用0填充
torch.eye(3)#3*3对角矩阵
​ 6.创建规律数列矩阵：

Copy
torch.arange(0,10)#生成[0,1,2,3,4,5,6,7,8,9]
torch.arange(0,10,2)#生成增量为2的数列
torch.arange(10)#效果同于（0，10）

torch.linspace(0,10,4)#生成[0.0000,3.3333,6,6667,10,0000]包括10的4等分向量
torch.logspace(0,-1,steps=10,base=10)#生成10个0到-1等分的数，再以其为指数，如第一个数#为1.000,最后一个数为0.100
​ 7.创建随机打散数组：

Copy
torch.randperm(10)#生成0~9这10个数乱序的数组（常用作索引）

tensor的比较：#
Copy
torch.eq(a,b)#返回对比后的矩阵，若矩阵形状相同，那么会对没一个位置进行比较，返回一个同样形状的矩阵，相应位置若相同则返回1，不相等则为0
torch.all(torch.eq(a,b))#a,b相同时返回1，否则为1。即all内的张量为全1矩阵会返回1
tensor的切片(start : end : step)：#
如果要存放一张rgb的minist（28*28）图片：

Copy
img=torch.rand(4,3,28,28)#4张图片

img[1]#获取第二张图片
img[0,0].shape#获取第一张图片的第一个通道的图片形状
img[0,0,2,4]#返回像素灰度值标量

img[:2]#获得img[0]和img[1]
#img[:2,:1]==img[:2,:1,:,:]
img[2:]#获得img[2],img[3],img[4]三张图片
img[-1:]#获得img[4]
img[:,:,::2,::2]#对图片进行隔行（列）采样

#还有一种索引中的...操作，有自动填充的功能,一般用于维数很多时使用。
img[0,...]#img.shape的结果是torch.Size([4,28,28]),这是和img[0,:]或者img[0]是一样的。
img[0,...,0:28:2]#此时由于写了最右边的索引，中间的...等价于:,:，即img[0,:,:,0:28:2]

tensor的索引查找（index_select/masked_select/take）：#
Copy
#同样是上面的img
#比如要取前三张图片，那么就是针对第一个维度（图片数目）进行挑选

img.index_select(0,torch.tensor([0,1,2]))#第一个参数为轴，第二个参数为tensor类型的索引
img.index_select(0,torch.arange(3))#效果同上句

#利用掩码mask
x=torch.rand(3,4)
mask=x.ge(0.5)#会把x中大于0.5的置为一，其他置为0，类似于阈值化操作。
y=torch.masked_select(x,mask)#将mask中值为1的元素取出来，比如mask有3个位置值为1
y.shape#结果为tensor.Size([3])

#利用take取元素
x=torch.tensor([[1,2,3],[4,5,6]])
torch.take(x,torch.tensor([0,2,6]))
#则最后结果为tensor([1,3,6]),也就是说会先将tensor压缩成一维向量，再按照索引取元素。
tensor的维度变换（view/reshape/squeeze/transpose/expand/permute）：#
Copy
img=torch.rand(4,1,28,28)

##view(reshape)##

#view==reshape,可以任意替换
x=img.view(4,28*28)
img.view(4,28,28)

x.view(4,28,28,1)#此操作可行但不合理，逻辑上的问题会造成信息污染
Copy
##squeeze减少维度数和unsqueeze扩展维度数##

#squeeze只关心有值的，可以挤压该值只有1个的维度，则最后会保留值总数目
x=torch.rand(1,32,1,1)#1张图，有32个通道，每个通道一个像素
x.squeeze()#形状变为[32]
x.squeeze(0)#[32,1,1]
x.squeeze(1)#[1,32,1,1]并没有发生压缩，因为该维度上有值，不能减少这一维度，不会报错


#unsqueeze会在参数维度上进行，若有此维度则会先将当前维度后移再拓展
img.unsqueeze(0).shape#结果为torch.Size([1,4,1,28,28]),物理意义为batch
img.unsqueeze(-1).shape#结果为torch.Size([4,1,28,28,1]),等价于unsqueeze(4)

#例如图片要在某个维度上面做加减，那么仅仅有一维数据是不够的，此时就需要将一维数据扩展维度
b=torch.rand(32)#torch.Size([32])
f=torch.rand(4,32,14,14)#要做到在每个channel上增加某一bias
b=b.unsqueeze(1).unsqueeze(2).unsqueeze(0)#形状为[1,32,1,1]
#但仅仅如此是不够的，我们知道矩阵进行加减操作是需要形状完全一致的，所以形状必须为[4,32,14,14],这就需要在某一维度上进行拓展的操作，需要了解后面的api(expand)才可以解决。


Copy
##expend仅在有需要时增加数据的扩展(starstarstar)/repeat主动增加数据的扩展##
#为了将[1,32,1,1]扩展为[4,32,14,14]:

#expend
b.expend(4,32,14,14)#直接输入想要的形状，但是只有原维度上的数值为1时才可以进行扩展
b.expend(4,33,14,14)#报错
b.expend(4,-1,-1,-1)#表示其他维度不变，仅怎加第0维的内容

#repeat，注意参数输入的是在该维度上拷贝的次数而不是形状！
b.repeat(4,32,1,1)#[4,1024,1,1] 1024=32*32
#正确操作
b.repeat(4,1,14,14)#[4,32,14,14]
Copy
#张量的转置（维度交换）操作

#对于二维向量来说：
a=torch.rand(3,4)
a.t()#即完成了转置

#对于任意维度张量的转置操作：transpose

a=torch.rand(4,3,32,32)
a.transpose(1,3)#接收参数为要进行交换那两个维度，[4,32,32,3]

#接收index来进行转置：permute
a.permute(0,2,3,1)#形状为[4,32,32,3]
tensor的Broadcasting:#
在矩阵相加时，如果两矩阵的形状不一致，则会自动运行broadcast

Copy
#有点类似于先unsqueeze再expand
#自动会在第0维处插入一个维度,并且同时将形状为1的部分自动转换成想要运算的对象的形状，这表示着在broadcast前先要将后面的维度数调至想要的样子再使用。
#例如，将形状为(32)的向量转化为(4,32,14,14),则先要unsueeze到(32,1,1),才会自动broadcast为(4,32,14,14).
#转换成物理意义容易理解,比如矩阵加上一个数就是broadcast.比如上面为图片数据时,(32)就是对32个通道想要加的不同bias，会自动广播为对每个灰度值上的bias。（真正运算的是该数据的最基本单位）。加上（14，14）就是对每一张图的每个通道的图上加上一个(14,14)的bias。

tensor的拼接与拆分(cat/stack/spilit/chunk):#
Copy
#cat拼接
a=torch.rand(4,3,18,18)
b=torch.rand(5,3,18,18)
c=torch.rand(4,1,18,18)
d=a.copy()

torch.cat([a,b],dim=0)#拼接得到(9,3,18,18)的数据
#若为2维数据，dim=0则是竖向拼接，dim=0就是横向拼接。dim所指维度可以不同，但其他维度形状必须一致
torch.cat([a,c],dim=1)#就会得到(4,4,18,18)的数据。
Copy
#stack增维度拼接
torch.stack([a,b],dim=0)#得到形状为(2,4,3,18,18)。使用时列表内对象的形状需要一致。
Copy
#split拆分

#根据欲拆分长度：
a1,a2=a.split(2,dim=0)#拆分长度为2.对第0维按照2个一份进行拆分。拆分获得两个形状为(2,3,18,18)的张量。
a1,a2=a.split([3,1],dim=0)#不同长度拆分。获得(3,3,18,18)和(1,3,18,18)两个形状的张量。
Copy
#chunk拆分

#根据欲拆分数量
a1,a2,a3,a4=a.chunk(4,dim=0)#将张量依第0维拆分成4个(1,3,18,18)的张量。等效于a.split(1,dim=0)

tensor的运算:#
Copy
# +等价于torch.add()

#乘法
#tensor直接相*,其结果为element wise,矩阵乘法为torch.matmul或者@
#高维tensor矩阵相乘实际上是对多个二维矩阵进行并行运算
a=torch.rand(4,3,28,64)
b=torch.rand(4,3,64,32)
a@b#结果得到的形状为(4,3,28,32)
#若(4,3,28,64)@(4,1,64,32)则会自动调用广播机制，把(4,1,64,32)转变为(4,3,64,32)再相乘。无法调用广播机制的乘法则会报错。

#平方
a=torch.full([2,2],2)#创建一个(2,2)的全2矩阵
a.pow(2)#a的每个元素都平方
a**2#等价于上一句

#开方
a.sqrt()#平方根
a**0.5#等价于上一句

#exp,log
a.torch.exp(torch.ones(2,2))
torch.log(a)

#近似
#floor()向下取整，ceil()向上取整，round()四舍五入。

#取整取小数
#trunc()取整，frac()取小数

#clamp取范围
a=torch.tensor([[3,5],[6,8]])
a.clamp(6)#得到[[6,6],[6,8]],小于6的都变为6
a.clamp(5,6)#得到[[5,5],[6,6]],小于下限变为下限，大于上限变为上限。
tensor的统计属性:#
Copy
#范数
#求多少p范数只需要在norm(p)的参数中修改p即可
a.norm(1)#求a的一范数，范数也可以加dim=

#求最大值和最小值与其相关的索引
a.min()
a.max()
a.argmax()#会得到索引值，返回的永远是一个标量，多维张量会先拉成向量再求得其索引。拉伸的过程为每一行加起来变成一整行，而不是matlab中的列拉成一整列。
a.argmin()
a.argmax(dim=1)#如果不想获取拉伸后的索引值就需要在指定维度上进行argmax，比如如果a为(2，2)的矩阵，那么这句话的结果就可能是[1,1],表示第一行第一个在此行最大，第二行第一个在此行最大。

#累加总和
a.sum()

#累乘综合
a.prod()

#dim,keepdim
#假设a的形状为(4,10)
a.max(dim=1)#结果会得到一个(4)的张量，表示4个样本中每个样本10个特征的最大值组成的张量。(max换成argmax也是同理)。
a.max(dim=1,keepdim=True)#同时返回a.argmax(dim=1)得到的结果，以保持维度数目和原来一致。

#top-k,k-th
a.topk(5)#返回张量a前5个最大值组成的向量
a.topk(5,dim=1,largest=False)#关闭largest求最小的5个
a.kthvalue(8,dim=1)#返回第八小的值

#比较操作
#都是进行element-wise操作
torch.eq(a,b)#返回的是张量
torch.equal(a,b)#返回的是True或者False
tensor的where和gather:#
Copy
torch.where(condition,x,y)
torch.gather(input,dim,index,out=none)
作者： 科西嘉人

出处：https://www.cnblogs.com/IaCorse/p/11762548.html

版权：本文采用「署名-非商业性使用-相同方式共享 4.0 国际」知识共享许可协议进行许可。