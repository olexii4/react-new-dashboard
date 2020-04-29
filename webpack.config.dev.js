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

const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const common = require('./webpack.config.common');

module.exports = env => {
  const proxyTarget = env && env.server ? env.server : 'https://che.openshift.io/';

  return merge(common, {
    mode: 'development',
    stats: 'verbose',
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.(tsx|ts|jsx|js)$/,
          loader: 'source-map-loader',
          exclude: path.resolve(__dirname, 'node_modules'),
        },
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
    ],
    devtool: 'source-map',
    devServer: {
      clientLogLevel: 'debug',
      contentBase: path.join(__dirname, 'assets'),
      contentBasePublicPath: '/assets/',
      disableHostCheck: true,
      host: 'localhost',
      hot: true,
      open: false,
      port: 3000,
      stats: 'normal',
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
    }
  });
};
