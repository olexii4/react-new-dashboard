/*
 * Copyright (c) 2018-2020 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin');

const common = require('./webpack.config.common');

module.exports = env => {
  const proxyTarget = env && env.server ? env.server : 'https://che.openshift.io/';

  return merge(common, {
    mode: 'development',
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.(tsx|ts|jsx|js)$/,
          loader: 'source-map-loader',
          include: path.resolve(__dirname, 'src'),
        },
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new CleanTerminalPlugin(),
    ],
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
    devtool: 'source-map',
    devServer: {
      clientLogLevel: 'debug',
      contentBase: path.join(__dirname, 'assets'),
      contentBasePublicPath: '/assets/',
      disableHostCheck: true,
      host: 'localhost',
      hot: true,
      open: true,
      port: 3000,
      stats: 'errors-warnings',
      // writeToDisk: true,
      proxy: {
        '/api/websocket': {
          target: proxyTarget,
          ws: true,
          secure: false,
          changeOrigin: true,
          headers: {
            origin: proxyTarget
          }
        },
        '/api': {
          target: proxyTarget,
          secure: false,
          changeOrigin: true,
          headers: {
            origin: proxyTarget
          },
        },
        '/workspace-loader': {
          target: proxyTarget,
          secure: false,
          changeOrigin: true,
          headers: {
            origin: proxyTarget
          }
        },
      },
    },
    watchOptions: {
      aggregateTimeout: 1000,
      ignored: /node_modules/,
    },
  });
};
