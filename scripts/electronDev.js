const { spawn } = require('child_process');
const path = require('path');
const webpack = require('webpack');
const electron = require('electron');
const devConfig = require('./webpack.dev.config');

devConfig.target = 'electron-renderer';

const compiler = webpack(devConfig);

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
});

spawn(electron, [path.join(__dirname, '../src/electron.js')], {env: { mode: 'development' }});