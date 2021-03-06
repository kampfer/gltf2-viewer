const { spawn } = require('child_process');
const path = require('path');
const webpack = require('webpack');
const electron = require('electron');
const devConfig = require('./webpack.dev.config');

Object.assign(devConfig, {
    target: 'electron-renderer',
    entry: path.join(__dirname, '../src/electron/renderer/index')
});

const compiler = webpack(devConfig);

let electronSpawned = false;

compiler.watch({
    aggregateTimeout: 300
}, function (err, stats) {
    if (err) {
        console.error(err);
        return;
    }

    console.log(stats.toString({
        chunks: false,  // Makes the build much quieter
        colors: true    // Shows colors in the console
    }));

    // 每次文件改变导致webpack重新编译时，不重新执行electron编译
    if (electronSpawned === false) {
        electronSpawned = true;
        spawn(electron, [path.join(__dirname, '../src/electron/main/index.js')], {env: { mode: 'development' }});
    }
});
