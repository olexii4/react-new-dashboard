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

import { Container } from 'inversify';
import { IDriver } from './driver/IDriver';
import { ChromeDriver } from './driver/ChromeDriver';
import { TYPES, CLASSES } from './inversify.types';
import { DriverHelper } from './utils/DriverHelper';

const testContainer: Container = new Container({ defaultScope: 'Transient' });

testContainer.bind<IDriver>(TYPES.Driver).to(ChromeDriver).inSingletonScope();
testContainer.bind<DriverHelper>(CLASSES.DriverHelper).to(DriverHelper);


export { testContainer };
