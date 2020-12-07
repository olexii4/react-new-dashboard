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
import { KeycloakSetupService } from './services/bootstrap/KeycloakSetup';
import { KeycloakService } from './services/keycloak/Keycloak';
import { Debounce } from './services/helpers/debounce';
import { CheWorkspaceClient } from './services/workspace-client/CheWorkspaceClient';
import { AppAlerts } from './services/alerts/appAlerts';
import { IssuesReporter } from './services/bootstrap/issuesReporter';

const container = new Container();

container.bind(IssuesReporter).toSelf().inSingletonScope();
container.bind(KeycloakSetupService).toSelf().inSingletonScope();
container.bind(KeycloakService).toSelf().inSingletonScope();
container.bind(Debounce).toSelf();
container.bind(CheWorkspaceClient).toSelf().inSingletonScope();
container.bind(AppAlerts).toSelf().inSingletonScope();

export { container };
