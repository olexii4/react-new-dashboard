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

const { execSync } = require('child_process');
const { writeFileSync, existsSync, readFileSync } = require('fs');

// update depsMap
function parseFileData(fileData) {
  const pattern = /^npm\/npmjs\/(-\/)?([^,]+)\/([0-9.]+), ([^,]+)?, approved, (\w+)$/gm;

  const depsMap = new Map();
  let result;
  while ((result = pattern.exec(fileData)) !== null) {
    let cq = result[5]
    const cqNum = parseInt(cq.replace('CQ', ''), 10);
    if (cqNum) {
      cq = `[CQ${cqNum}](https://dev.eclipse.org/ipzilla/show_bug.cgi?id=${cqNum})`;
    }
    const key = `${result[2]}@${result[3]}`;
    depsMap.set(key, cq);
  }
  return depsMap
}

function bufferToArray(buffer) {
  if (!buffer || !buffer.data || !buffer.data.trees) {
    return [];
  }
  return buffer.data.trees.map(entry => entry.name).sort();
}

function arrayToDocument(title, depsArray, depToCQ, allLicenses) {
  // document title
  let document = '### ' + title + '\n\n';
  // table header
  document += '| Packages | License | Resolved CQs |\n| --- | --- | --- |\n';
  console.log('\n### UNRESOLVED ' + title);
  let unresolvedQuantity = 0;
  // table body
  depsArray.forEach(item => {
    const license = allLicenses.has(item) ? allLicenses.get(item).License : '';
    const lib = allLicenses.has(item) ? `[\`${item}\`](${allLicenses.get(item).URL})` : `\`${item}\``;
    let cq = '';
    if (depToCQ.has(item)) {
      cq = depToCQ.get(item);
    } else {
      console.log(`${++unresolvedQuantity}.'${item}'`);
    }
    document += `| ${lib} | ${license} | ${cq} |\n`;
  });

  return document;
}

const ALL_DEPENDENCIES = './DEPENDENCIES';
const PROD_PATH = '.deps/prod.md';
const DEV_PATH = '.deps/dev.md';
const ENCODING = 'utf8';

let depsToCQ;

let allLicenses = new Map();

// licenses buffer
const allLicensesBuffer = execSync('yarn licenses list --json --depth=0 --no-progress').toString();
const index = allLicensesBuffer.indexOf('{"type":"table"');
if (index !== -1) {
  const licenses = JSON.parse(allLicensesBuffer.substring(index));
  const { head, body } = licenses.data;
  body.forEach(libInfo => {
    allLicenses.set(`${libInfo[head.indexOf('Name')]}@${libInfo[head.indexOf('Version')]}`, {
      License: libInfo[head.indexOf('License')],
      URL: libInfo[head.indexOf('URL')]
    });
  })
}

if (existsSync(ALL_DEPENDENCIES)) {
  depsToCQ = parseFileData(readFileSync(ALL_DEPENDENCIES, ENCODING));
}

// prod dependencies
const prodDepsBuffer = execSync('yarn list --json --prod --depth=0 --no-progress');
const prodDeps = bufferToArray(JSON.parse(prodDepsBuffer.toString()));

// all dependencies
const allDepsBuffer = execSync('yarn list --json --depth=0 --no-progress');
const allDeps = bufferToArray(JSON.parse(allDepsBuffer.toString()))

// dev dependencies
const devDeps = allDeps.filter(entry => prodDeps.includes(entry) === false);

writeFileSync(PROD_PATH, arrayToDocument('Production dependencies', prodDeps, depsToCQ, allLicenses), ENCODING);
writeFileSync(DEV_PATH, arrayToDocument('Development dependencies', devDeps, depsToCQ, allLicenses), ENCODING);
