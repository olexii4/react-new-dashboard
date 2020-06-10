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

import { testContainer } from '../inversify.config';
import { DriverHelper } from '../utils/DriverHelper';
import { CLASSES } from '../inversify.types';
import { error } from 'selenium-webdriver';
import { Dashboard } from '../pageobjects/Dashboard';


const driverHelper: DriverHelper = testContainer.get(CLASSES.DriverHelper);
const dashboard: Dashboard = testContainer.get(CLASSES.Dashboard);

suite('Suite', async () => {
  test('Test', async () => {
    await dashboard.openDashboard();


  });
});
