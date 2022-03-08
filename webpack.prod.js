const path = require("path");
const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin')

module.exports = {
    mode: "production",
    entry: "./src/client/index.js",
    output: {
        libraryTarget: "var",
        library: "Client",
		path: path.resolve(__dirname, 'dist'),
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
            test: /\.scss$/,
            use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
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
        }),
        new MiniCssExtractPlugin({ filename: "[name].css" }),
        new WorkboxPlugin.GenerateSW()
    ],
    optimization: {
        minimizer: [
                new TerserPlugin({}), new CssMinimizerWebpackPlugin(), 
                new ImageMinimizerPlugin({
                    minimizer: {
                        implementation: ImageMinimizerPlugin.imageminMinify,
                        options: {
                            // Lossless optimization with custom option
                            plugins: [
                                ['jpegtran', { progressive: true }],
                                ['optipng', { optimizationLevel: 5 }],
                            ],
                        },
                    },
                }),
            ],
        },
}