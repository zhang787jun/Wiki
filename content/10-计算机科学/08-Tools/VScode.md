---
title: "VScode 的奇技淫巧"
layout: page
date: 2099-06-02 00:00
---

# 1. VScode 配置同步

安装Setting Sync 插件。
Setting Sync 可同步包含的所有扩展和完整的用户文件夹

1) 设置文件

2) 快捷键设置文件

3) Launch File

4) Snippets Folder

5) VSCode 扩展设置

6) 工作空间
 

Setting Sync 快捷键：

1) 上传： Shift + Alt + U (Sync: Update / Upload Settings)

2) 下载： Shift + Alt + D (Sync: Download  Settings)

 如果快捷键有冲突，可Ctrl + K + S快捷键设置配置其它快捷键 或 Ctrl + P / F1 在命令窗口输入 >sync 即会出现相应命令供选择




# 2. VScode 远程开发

# 3. VSCode-Markdown 图片复制插件路径配置
Markdown Paste 插件

'Ctrl+Alt+V' ('Cmd+Alt+V' on Mac)

# 4. VScode-python增强

Working with Jupyter Notebooks in Visual Studio Code

https://s0code0visualstudio0com.icopy.site/docs/python/jupyter-support

# 5. 快捷键



## 5.1. 注释快捷键

注释 CTRL+K+C

```python
# test commit 
```
取消注释 CTRL+K+U

字符串注释alt+shift+A，取消同理
```python
""" test commit 
 """
```





## 5.2. Markdown 代码块

安装 `Markdown ALL in One` 插件
设置->快捷键->查找 block


```json

// 将按键绑定放在此文件中以覆盖默认值auto[]
[
    {
        "key": "ctrl+shift+u",
        "command": "-workbench.action.output.toggleOutput"
    },
    {
        "key": "ctrl+shift+u",
        "command": "-extension.ui"
    },
    {
        "key": "ctrl+shift+u",
        "command": "editor.action.transformToUppercase"
    },
    {
        "key": "ctrl+b",
        "command": "-workbench.action.toggleSidebarVisibility"
    },
    {
        "key": "ctrl+shift+l",
        "command": "-editor.action.selectHighlights",
        "when": "editorFocus"
    },
    {
        "key": "ctrl+shift+l",
        "command": "-extension.launch"
    },
    {
        "key": "ctrl+shift+l",
        "command": "editor.action.transformToLowercase"
    },
    {
        "key": "ctrl+u",
        "command": "markdown.extension.editing.toggleCodeBlock"
    }

```

# 6. debug


按钮1：运行/继续 F5，真正的一步一步运行
按钮2：单步跳过(又叫逐过程) F10，按语句单步执行。当有函数时，不会进入函数。
按钮3：单步调试（又叫逐语句） F11：当有函数时，点击这个按钮，会进入这个函数内。
按钮4：单步跳出 ⇧F11:如果有循环，点击该按钮，会执行到循环外面的语句。
按钮5：重启 ⇧⌘F5：
按钮5：停止 ⇧F5：

# 7. 配置 jupyter notebook

Jupyter code cells
You define Jupyter-like code cells within Python code using a #%% comment:
```python
#%%
msg = "Hello World"
print(msg)

#%%
msg = "Hello again"
print(msg)
```

# 8. python 代码补全方案


VS code有两种补全方案：Jedi和python.language.server。

#  添加header 
