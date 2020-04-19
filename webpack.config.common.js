/*******************************************************************************
 * Copyright (c) 2018-2018 Red Hat, Inc.
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which is available at http://www.eclipse.org/legal/epl-2.0.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 *******************************************************************************/

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const stylus_plugin = require('poststylus');
const stylusLoader = require('stylus-loader');
const webpack = require('webpack');

const path = require('path');

module.exports = {
    entry: path.join(__dirname, 'src/index.tsx'),
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                use: [
                    {
                        options: {
                            eslintPath: require.resolve('eslint'),
                        },
                        loader: require.resolve('eslint-loader'),
                    }
                ]
            },
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                use: [
                    {
                        loader: 'ts-loader'
                    },
                ],
                exclude: /node_modules/
            },
            {
                test: /node_modules[\\\\|\/](yaml-language-server)/,
                loader: 'umd-compat-loader'
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader']
            },
            {
                test: /\.styl$/,
                loader: 'style-loader!css-loader!stylus-loader',
            },
            {
                test: /\.(jpg|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'fonts/'
                }
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    node: {
        fs: 'empty',
        net: 'empty',
        module: 'empty'
    },
    plugins: [
        new webpack.IgnorePlugin(/prettier/),
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        new stylusLoader.OptionsPlugin({
            default: {
                use: [stylus_plugin()],
            },
        }),
        new CleanWebpackPlugin(),
    ],
};
