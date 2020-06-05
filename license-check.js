/*******************************************************************************
 * Copyright (c) 2018-2020 Red Hat, Inc.
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which is available at http://www.eclipse.org/legal/epl-2.0.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 *******************************************************************************/

(function () {
  const fs = require('fs');
  const glob = require('glob-fs')();

  const license = ` * Copyright (c) 2018-2020 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation`;

  const exclude = ['LICENSE'];

  let result = 0;
  glob.readdirSync('**')
    .filter(filePath => filePath.match(/.*\.(tsx|ts|jsx|js)$/))
    .map(file => {
    try {
      if (!fs.lstatSync(file).isDirectory() && file.indexOf('.json') === -1
        && exclude.indexOf(file) === -1) {
        const data = fs.readFileSync(file, 'utf8');

        if (data.toString().indexOf(license) === -1) {
          console.log('Please add License text in the file ' + file);
          result = 1;
        }
      }
    } catch (e) {
      console.log('Error:', e.stack);
    }
  });
  process.exit(result);
})();
