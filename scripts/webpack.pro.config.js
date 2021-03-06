const config = require('./webpack.config');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let proConfig = Object.assign(config, {
    mode: 'production',
    resolve: {
        alias: {
            'webglRenderEngine': path.join(__dirname, '../src/webglRenderEngine/build/webglRenderEngine.min.js')
        }
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]|[\\/]src[\\/]webglRenderEngine[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                }
            }
        }
    },
    entry: path.join(__dirname, '../src/index')
});

proConfig.plugins.push(
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(__dirname, '../src/index.html')
    })
);

module.exports = proConfig;