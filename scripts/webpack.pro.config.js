const config = require('./webpack.config');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

let proConfig = Object.assign(config, {
    mode: 'production',
    entry: {
        main: path.join(__dirname, '../src/assets/main')
    }
});

proConfig.plugins.push(
    new MiniCssExtractPlugin({
        filename: '[name].[hash].css',
        chunkFilename: '[id].[hash].css'
    })
);

proConfig.module.rules.push({
    test: /\.less$/i,
    use: [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: false,
            },
        },
        'css-loader',
        'less-loader',
    ],
});

module.exports = proConfig;