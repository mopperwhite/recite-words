# recite-words

使用Vue.js编写的背单词网站，网页托管在GitHub Pages，用户数据存储在Firebase(需要翻墙，视情况可能需要迁移到野狗云之类的)。为了便于使用，master分支里包含了打包之后的文件。

[现在可以直接访问](http://mopperwhite.github.io/recite-words)

页面是为移动设备设计的，用了Superhero主题方便晚上使用，自动读出题目和答案，选项为英语时会优先选取与正确答案词性相同的词作为备选。支持JSON和CSV格式的导入。


#### 放飞自我模式

启动后，如果三秒内未回答，会直接跳过。

## TODOS

* 完善README.md
* 把打包文件放到gh-pages分支，并编写相应的自动化脚本
* 起一个好听的名字
* 使用不需要翻墙的类Firebase服务？

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).
