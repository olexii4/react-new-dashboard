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

module.exports = {
  roots: ['src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/src/.+\\.(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: [
    'node_modules',
  ],
  moduleNameMapper: {
    '\\.(css|less|sass|scss|styl)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  globals: {
    'ts-jest': {
      'tsConfig': 'tsconfig.test.json'
    }
  },
  coverageThreshold: {
    global: {
      branches: 32,
      functions: 40,
      lines: 50,
      statements: 51
    },
    './src/components/Header': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
  },
  collectCoverage: true,
  coverageReporters: ['html'],
  coverageDirectory: './coverage',
  maxWorkers: 4,
  setupFilesAfterEnv: ['./jest.setup.ts'],
}
