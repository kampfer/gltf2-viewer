const path = require('path');
const fs = require('fs');
const builder = require("electron-builder");
const webpack = require('webpack');
const webpackConfig = require('./webpack.pro.config');

const Platform = builder.Platform,
    rootPath = path.join(__dirname, '../build'),
    // electron builder会将app目录内的所有内容打包进应用
    // 为了尽量减少应用体积，只在app目录存放webpack打包后的结果
    appDirPath = path.join(rootPath, 'electron/app'),
    outputDirPath = path.join(rootPath, 'electron/output'),
    devPackagePath = path.join(__dirname, '../package.json'),
    appPackagePath = path.join(appDirPath, 'package.json');

Object.assign(webpackConfig, {
    target: 'electron-renderer',
    entry: path.join(__dirname, '../src/electron/renderer/index'),
    output: {
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].js',
        path: path.join(__dirname, '../build/electron/app')
    }
});

const compiler = webpack(webpackConfig);

compiler.run((err, stats) => {

    if (err) {
        console.error(err);
        return;
    }

    console.log(stats.toString({
        chunks: false,  // Makes the build much quieter
        colors: true    // Shows colors in the console
    }));

    let packageContent = fs.readFileSync(devPackagePath, 'utf8'),
        devPackage = JSON.parse(packageContent),
        appPackage = {
            name: devPackage.name,
            main: 'electron.js',
            version: "1.0.0"
        };

    // 为electron buidler生成package.json
    fs.writeFileSync(appPackagePath, JSON.stringify(appPackage));

    // 拷贝electron入口文件
    fs.copyFileSync(
        path.join(__dirname, '../src/electron/main/index.js'),
        path.join(appDirPath, 'electron.js')
    );

    builder.build({
        targets: Platform.WINDOWS.createTarget(),
        config: {
            directories: {
                app: appDirPath,
                output: outputDirPath,
            }
        }
    }).then(function () {
        console.log('build finish successfully!');
    }).catch(function (error) {
        console.log(error.toString());
    });

});
