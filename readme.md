# 基于webpack构建项目的脚手架

## 1. 支持es6

在开发过程中使用最新的js特性，然后通过使用[babel-loader](https://webpack.js.org/loaders/babel-loader/)和[babel](https://babeljs.io/docs/en/)生成向后兼容的代码。

使用[.browserslistrc](https://github.com/browserslist/browserslist)声明需要进行代码转换的环境。我使用的是：市场份额大于0.25%的浏览器。

babel-loader运行较慢，所以通过：
- 排除node_modules，从而尽可能减少编译代码的数量
- 开启cacheDirectory，从而利用缓存机制
来加快编译速度。

另外babel会往代码中插入一些辅助性代码，这可能导致项目总代码量的不断膨胀（特别是当项目越来越大时）。所以需要使用[@babel/plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime/)来禁止babel的这种行为，缓解代码膨胀的问题。

## 2. 支持html模板，实现文件指纹自动更新

[HtmlWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/)

考虑使用官方方案：https://webpack.js.org/loaders/html-loader/#export-into-html-files

## 3. 支持less

[less-loader](https://webpack.js.org/loaders/less-loader/)

## 4. 生成单独的样式文件

[mini-css-extract-plugin](https://webpack.js.org/plugins/mini-css-extract-plugin/)

## 5. 支持引用图片

使用[file-loader](https://webpack.js.org/loaders/file-loader/)和[url-loader](https://webpack.js.org/loaders/url-loader/)来处理图片。
当图片大小小于limit（8192）时，url-loader将它转换成DataURL，否则会使用file-loader处理。

### js中引用图片

```javascript
import img from './image.png';
```

### css中引用图片

```css
background-image: url(./sukanasi.jpg);
```

### html中引用图片

暂时使用HtmlWebpackPlugin自带的方式：
https://stackoverflow.com/questions/47126503/how-to-load-images-through-webpack-when-using-htmlwebpackplugin

之后考虑使用[html-loader](https://webpack.js.org/loaders/html-loader/)替换。

# TODO

3. 支持依赖分析

https://webpack.js.org/guides/code-splitting/#bundle-analysis

4. 支持eslint

5. 资源压缩

    - js
    - css
    - 图片

# 一些约定

1. 文件和目录命名使用驼峰式命名法
2. 每个模块使用的资源文件（js、less、图片等）归档到同一个目录下