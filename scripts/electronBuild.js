const path = require('path');
const fs = require('fs');
const builder = require("electron-builder");

// electron builder的产出目录和app目录必须分开，资源不能混在一起
// 否则打包结果的大小会明显增大
const Platform = builder.Platform,
    outputPath = path.join(__dirname, '../build'),
    webSourcePath = path.join(outputPath, 'web'),
    electronSourcePath = path.join(outputPath, 'electron'),
    devPackagePath = path.join(__dirname, '../package.json'),
    appPackagePath = path.join(webSourcePath, 'package.json');

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
