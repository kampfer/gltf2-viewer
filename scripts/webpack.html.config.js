const config = require('./webpack.config');
const { findEntries } = require('./utils');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let dir = path.join(__dirname, '../html'),
    entries = findEntries(dir);

if (config.entry === undefined) {
    config.entry = {};
}

for (let name in entries) {
    let entry = entries[name];
    config.entry[name] = entry.js;
    config.plugins.push(
        new HtmlWebpackPlugin({
            filename: path.relative(dir, entry.html),
            template: entry.html,
            chunks: [name]
        })
    );
}

config.mode = 'development';

module.exports = config;