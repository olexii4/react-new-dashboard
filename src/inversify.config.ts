import 'reflect-metadata';
import { Container } from 'inversify';
import { CheBranding } from './services/bootstrap/CheBranding';
import { KeycloakSetup } from './services/bootstrap/KeycloakSetup';
import { Keycloak } from './services/keycloak/Keycloak';
import { WebsocketClient } from './services/json-rpc/WebsocketClient';
import { Debounce } from './services/debounce/Debounce';
import { CheJsonRpcApi } from './services/json-rpc/JsonRpcApiFactory';

const container = new Container();

container.bind(CheBranding).toSelf().inSingletonScope();
container.bind(KeycloakSetup).toSelf().inSingletonScope();
container.bind(Keycloak).toSelf().inSingletonScope();
container.bind(CheJsonRpcApi).toSelf().inSingletonScope();

container.bind(Debounce).toSelf();
container.bind(WebsocketClient).toSelf();

export { container }
