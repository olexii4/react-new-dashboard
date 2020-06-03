const { execSync } = require('child_process');
const { writeFileSync, existsSync, readFileSync } = require('fs');

const PROD_PATH = '.deps/prod.md';
const DEV_PATH = '.deps/dev.md';
const ENCODING = 'utf8';

const depsMap = new Map();

// get resolved prod dependencies
if (existsSync(PROD_PATH)) {
  parseFileData(readFileSync(PROD_PATH, ENCODING));
}

// get resolved dev dependencies
if (existsSync(DEV_PATH)) {
  parseFileData(readFileSync(DEV_PATH, ENCODING));
}

// update depsMap
function parseFileData(fileData) {
  const pattern = /^\| `([^|^ ]+)` \| ([^|]+) \|$/gm;

  let result;
  while ((result = pattern.exec(fileData)) !== null) {
    depsMap.set(result[1], result[2])
  }
}

// prod dependencies
const prodDepsBuffer = execSync('yarn list --json --prod --depth=0');
const prodDeps = bufferToArray(JSON.parse(prodDepsBuffer));

// all dependencies
const allDepsBuffer = execSync('yarn list --json --depth=0');
const allDeps = bufferToArray(JSON.parse(allDepsBuffer))

// dev dependencies
const devDeps = allDeps.filter(entry => prodDeps.includes(entry) === false);

writeFileSync(PROD_PATH, arrayToDocument(prodDeps, false), ENCODING);
writeFileSync(DEV_PATH, arrayToDocument(devDeps, true), ENCODING);

function arrayToDocument(depsArray, isDev) {
  // document title
  let document = isDev ? '### Development dependencies\n\n' : '### Product dependencies\n\n';
  // table header
  document += '| Packages | Resolved CQs |\n| --- | --- |\n';
  // table body
  depsArray.forEach(item => {
    if (isDev) {
      item = item.replace(/@[0-9]+.[0-9]+.[-0-9]+$/, '');
    }
    document += '| `' + item + '` | ';
    if (depsMap.has(item)) {
      // add a CQ
      document += depsMap.get(item);
    }
    document += ' |\n';
  });

  return document;
}

function bufferToArray(buffer) {
  if (!buffer || !buffer.data || !buffer.data.trees) {
    return [];
  }
  return buffer.data.trees.map(entry => entry.name).sort();
}
