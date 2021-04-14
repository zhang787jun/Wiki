---
title: "Pytorch--数据集"
date: 2019-06-12 00:00
render: True 
tag: Pytorch,框架,AI,
---
[TOC]

# 自定义数据集

Pytorch用torch.utils.data.Dataset构建数据集，想要构建自己的数据集，则需继承Dataset类，并重写两个方法：

`__len__` :定义整个数据集的长度。使用len(dataset)时会被调用。
`__getitem__` ：用于索引数据集中的数据，比如dataset[i]。

下面来实际操作一下。假设我们有2个文件夹。第一个文件夹img下的图片像这样。每个图像包含许多个几何体。




第二个文件夹img_mask内对应的是第一个文件夹内每个物体的掩膜。像这样：


我们要构建的数据集是：输入是每个物体的mask对应的外边框对应的原图裁剪，label是每个物体的mask。

像这样：



首先定义一下文件夹位置:

```python
img_path = 'F:/PycharmProjects/MakeCOCO/output/images'
mask_img_path = 'F:/PycharmProjects/MakeCOCO/train/annotations'
```
接着创建Dataset子类:
```python

class MaskDataset(Dataset):
    def __init__(self, img_path, mask_img_path, transform=None):
        self.img_path = img_path
        self.mask_img_path = mask_img_path
        self.transform = transform
        self.mask_img = os.listdir(mask_img_path)

    def __len__(self):
        return len(self.mask_img)

    def __getitem__(self, idx):
        pass
```
重写__len__方法：

```python
def __len__(self):
    return len(self.mask_img)
```
测试一下，得到6524：

test=MaskDataset(img_path,mask_img_path)
print(len(test))
>>>6524
重写__getitem__方法：

```python
def __getitem__(self, idx):
    label_img_name = self.mask_img[idx]
    origin_img_name = label_img_name[:16] + '.png'
    mask_img = io.imread(osp.join(mask_img_path, label_img_name))
    regions = regionprops(label(mask_img))
    minr, minc, maxr, maxc = regions[0].bbox
    mask_img=color.gray2rgb(mask_img)
    input_img = mask_img[minr:maxr, minc:maxc]
    origin_image = color.rgba2rgb(io.imread(osp.join(img_path, origin_img_name)))
    label_img = origin_image[minr:maxr, minc:maxc]
    if self.transform:
        input_img = self.transform(input_img)
        label_img = self.transform(label_img)
    return input_img.float(), label_img.float()
```
到这就全部写完了，我们来测试一下：

```python
def imshow(inp, title=None):
    """Imshow for Tensor."""
    inp = inp.numpy().transpose((1, 2, 0))
    plt.imshow(inp)
    if title is not None:
        plt.title(title)
    plt.pause(0.001)  # pause a bit so that plots are updated

```

```python
img_path = 'F:/PycharmProjects/MakeCOCO/output/images'
mask_img_path = 'F:/PycharmProjects/MakeCOCO/train/annotations'
trans = transforms.Compose([transforms.ToTensor()])
test = MaskDataset(img_path, mask_img_path, trans)
x, y = test[1000]
pair = utils.make_grid([x, y])
imshow(pair)
plt.show()
```
得到一个测试对：