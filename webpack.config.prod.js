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

const CopyPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const common = require('./webpack.config.common.js');

module.exports = merge(common, {
    mode: 'production',
    entry: [
        './src/index.tsx'
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new CopyPlugin([
            { from: path.join(__dirname, 'assets'), to: 'assets' },
        ]),
    ],
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
});
