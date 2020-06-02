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
    '\\.tsx$': '<rootDir>/__mocks__/react.js',
  },
  globals: {
    'ts-jest': {
      'tsConfig': 'tsconfig.test.json'
    }
  },
}
