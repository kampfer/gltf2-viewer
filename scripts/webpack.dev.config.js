const config = require('./webpack.config');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let devConfig = Object.assign(config, {
    mode: 'development',
    resolve: {
        alias: {
            'webglRenderEngine': path.join(__dirname, '../src/webglRenderEngine/build/webglRenderEngine.min.js')
        }
    },
    entry: path.join(__dirname, '../src/index')
});

devConfig.plugins.push(
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(__dirname, '../src/index.html')
    })
);

module.exports = devConfig;