const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const builder = require("electron-builder");

const config = require('./webpack.dev.config');

const Platform = builder.Platform,
    outputPath = path.join(__dirname, '../output'),
    webSourcePath = path.join(outputPath, 'web'),
    electronSourcePath = path.join(outputPath, 'electron'),
    devPackagePath = path.join(__dirname, '../package.json'),
    appPackagePath = path.join(webSourcePath, 'package.json');

webpack(config, function (err, stats) {

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
        path.join(__dirname, '../src/electron.js'),
        path.join(webSourcePath, 'electron.js')
    );

    builder.build({
        targets: Platform.WINDOWS.createTarget(),
        config: {
            directories: {
                app: webSourcePath,
                output: electronSourcePath,
            }
        }
    }).then(function () {
        console.log('build finish successfully!');
    }).catch(function (error) {
        console.log(error.toString());
    });

});
