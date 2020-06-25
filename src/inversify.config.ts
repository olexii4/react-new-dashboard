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

import 'reflect-metadata';
import { Container } from 'inversify';
import { KeycloakSetup } from './services/bootstrap/KeycloakSetup';
import { Keycloak } from './services/keycloak/Keycloak';
import { WebsocketClient } from './services/json-rpc/WebsocketClient';
import { Debounce } from './services/debounce/Debounce';
import { CheJsonRpcApi } from './services/json-rpc/JsonRpcApiFactory';

const container = new Container();

container.bind(KeycloakSetup).toSelf().inSingletonScope();
container.bind(Keycloak).toSelf().inSingletonScope();
container.bind(CheJsonRpcApi).toSelf().inSingletonScope();

container.bind(Debounce).toSelf();
container.bind(WebsocketClient).toSelf();

export { container };
