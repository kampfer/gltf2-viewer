const config = require('./webpack.config');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let devConfig = Object.assign(config, {
    mode: 'development',
    entry: path.join(__dirname, '../src/indexStatic')
});

devConfig.plugins.push(
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(__dirname, '../src/index.html')
    })
);

module.exports = devConfig;