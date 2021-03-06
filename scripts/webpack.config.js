const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components|webglRenderEngine)/,
            loader: 'babel-loader',
            options: {
                presets: [
                    '@babel/preset-env',
                    '@babel/preset-react'
                ],
                plugins: ['@babel/plugin-transform-runtime'],
                cacheDirectory: true
            }
        }, {
            test: /\.less$/i,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        hmr: true,
                    },
                },
                'css-loader',
                'less-loader'
            ],
        }, {
            test: /\.(png|jpg|gif|svg)$/i,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                    },
                },
            ],
        }, {
            test: /\.(ttf|eot|woff|woff2)$/,
            use: ['url-loader'],
        }]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css'
        })
    ],
    output: {
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].js',
        path: path.join(__dirname, '../build/web')
    }
};