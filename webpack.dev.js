const path = require("path")
const webpack = require("webpack")
const HtmlWebPackPlugin = require("html-webpack-plugin")

module.exports = {
    mode: "development",
    devtool: "source-map",
    entry: "./src/client/index.js",
    output: {
        libraryTarget: "var",
        library: "Client",
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
                {
            test: '/\.js$/',
            exclude: /node_modules/,
            loader: "babel-loader"
                },
                {
            test: /\.scss$/,
            use: ['style-loader', 'css-loader', 'sass-loader']
                },
                {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset/resource',
                },
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/client/views/index.html",
            filename: "./index.html",
        })
    ]
}