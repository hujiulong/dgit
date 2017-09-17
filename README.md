# dgit
一个用来下载git仓库文件的命令行工具

git会记录一个项目所有的历史修改，所以通常会很大。有时候你只需要下载一个项目的源代码，或者仅仅只需要其中的一个目录或文件，但是github不提供这样的功能，你需要先clone整个项目，非常麻烦。

这个小工具可以帮你解决这些问题，它包含这些功能：
1. 下载一个git仓库的所有文件
2. 下载一个git仓库的某个目录或某个文件
3. 下载时可以指定分支/tag/commit hash

## Install
可以通过npm安装
(如果速度较慢可以使用淘宝提供的镜像)
```
npm install dgit -g
```
如果你使用mac，需要在命令前面加上`sudo`

## Usage
使用方式（用下载`react`作为例子）
#### 1.下载整个项目
```
dgit facebook/react
```
现在在你当前所处的目录下就会多一个`react`目录，里面包含`react`项目的所有文件

#### 2.下载react的src目录
```
dgit facebook/react/src
```
现在在你当前所处的目录下就会多一个`src`目录，里面包含`react/src`的所有文件

#### 3.指定分支
使用参数`-r`或`--ref`可以指定`branch`，`tag`或`commit hash`
```
dgit facebook/react/css -r gh-pages
```

#### 4.指定tag
```
dgit facebook/react/src -r v15.6.1
```

#### 5.指定commit hash
```
dgit facebook/react/src -r b5ac963
```