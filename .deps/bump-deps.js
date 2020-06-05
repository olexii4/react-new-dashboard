const { execSync } = require('child_process');
const { writeFileSync, existsSync, readFileSync } = require('fs');

// update depsMap
function parseFileData(fileData) {
  const pattern = /^\| `([^|^ ]+)` \| ([^|]+) \|$/gm;

  const depsMap = new Map();
  let result;
  while ((result = pattern.exec(fileData)) !== null) {
    depsMap.set(result[1], result[2])
  }
  return depsMap
}

function bufferToArray(buffer) {
  if (!buffer || !buffer.data || !buffer.data.trees) {
    return [];
  }
  return buffer.data.trees.map(entry => entry.name).sort();
}

function arrayToDocument(title, depsArray, depToCQ) {
  // document title
  let document = '### '+ title +'\n\n';
  // table header
  document += '| Packages | Resolved CQs |\n| --- | --- |\n';
  // table body
  depsArray.forEach(item => {
    document += `| \`${item}\` | ${depToCQ.get(item)||''} |\n`;
  });

  return document;
}

const PROD_PATH = '.deps/prod.md';
const DEV_PATH = '.deps/dev.md';
const ENCODING = 'utf8';

// get resolved prod dependencies
if (existsSync(PROD_PATH)) {
  prodDepToCQ = parseFileData(readFileSync(PROD_PATH, ENCODING));
}

// get resolved dev dependencies
if (existsSync(DEV_PATH)) {
  devDepToCQ = parseFileData(readFileSync(DEV_PATH, ENCODING));
}

// prod dependencies
const prodDepsBuffer = execSync('yarn list --json --prod --depth=0');
const prodDeps = bufferToArray(JSON.parse(prodDepsBuffer));

// all dependencies
const allDepsBuffer = execSync('yarn list --json --depth=0');
const allDeps = bufferToArray(JSON.parse(allDepsBuffer))

// dev dependencies
const devDeps = allDeps.filter(entry => prodDeps.includes(entry) === false);

writeFileSync(PROD_PATH, arrayToDocument('Production dependencies', prodDeps, prodDepToCQ), ENCODING);
writeFileSync(DEV_PATH, arrayToDocument('Development dependencies', devDeps, devDepToCQ), ENCODING);
