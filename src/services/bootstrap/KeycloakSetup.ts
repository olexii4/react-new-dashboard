import 'reflect-metadata';
import axios from 'axios';
import { injectable } from 'inversify';

type IResolveFn<T> = {
  (value?: T | PromiseLike<T>): void;
}

type IRejectFn<T> = {
  (reason?: any): void;
}

type ICallbacks = {
  onLoad: Function;
  onError: Function;
}

type IDocumentReadyState = 'loading' | 'interactive' | 'complete';

declare const Keycloak: Function;

/**
 * This class is handling the keycloak settings data.
 * @author Oleksii Orel
 */
@injectable()
export class KeycloakSetup {
  static keycloakAuth = {
    isPresent: false,
    keycloak: null,
    config: null
  };
  private static isDocumentReady = new Promise<void>(resolve => {
    const state: IDocumentReadyState = document.readyState;
    if (state === 'interactive' || state === 'complete') {
      resolve();
    } else {
      document.onreadystatechange = (): void => resolve();
    }
  });

  private user: che.User | {} = {};


  resolve(): Promise<void> {
    if (KeycloakSetup.keycloakAuth.isPresent) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve: IResolveFn<void>, reject: IRejectFn<void>) => {
      axios.get('/api/keycloak/settings')
        .then(resp => {
          const keycloakSettings = resp.data;
          KeycloakSetup.keycloakAuth.config = this.buildKeycloakConfig(keycloakSettings);
          return new Promise((resolve: IResolveFn<any>, reject: IRejectFn<any>) => {
            const src = keycloakSettings['che.keycloak.js_adapter_url'];
            const onLoad = (): void => {
              let theUseNonce = false;
              if (typeof keycloakSettings['che.keycloak.use_nonce'] === 'string') {
                theUseNonce = keycloakSettings['che.keycloak.use_nonce'].toLowerCase() === 'true';
              }
              const initOptions = {
                useNonce: theUseNonce,
                redirectUrl: keycloakSettings['che.keycloak.redirect_url.dashboard']
              };
              this.keycloakInit(KeycloakSetup.keycloakAuth.config, initOptions).then(keycloak => {
                resolve(keycloak);
              }).catch(error => {
                reject(error);
              });
            };
            const onError = reject;
            this.addScript(src, { onLoad, onError });
          }).then((keycloak: any) => {
            KeycloakSetup.keycloakAuth.isPresent = true;
            KeycloakSetup.keycloakAuth.keycloak = keycloak;
            (window as any)['_keycloak'] = keycloak;
          });
        }).catch(error => {
          console.log(error);
        }).then(() => {
          const keycloak = (window as any)._keycloak;
          return this.getApis(keycloak);
        }).then(() => {
          resolve();
        }).catch(error => {
          console.error(`Can't GET '/api'. ${error ? 'Error: ' : ''}`, error);
          reject();
        });
    });
  };

  getUser(): che.User | {} {
    return this.user;
  }

  private buildKeycloakConfig(keycloakSettings: any): any {
    const theOidcProvider = keycloakSettings['che.keycloak.oidc_provider'];
    if (!theOidcProvider) {
      return {
        url: keycloakSettings['che.keycloak.auth_server_url'],
        realm: keycloakSettings['che.keycloak.realm'],
        clientId: keycloakSettings['che.keycloak.client_id']
      };
    } else {
      return {
        oidcProvider: theOidcProvider,
        clientId: keycloakSettings['che.keycloak.client_id']
      };
    }
  }

  private keycloakInit(keycloakConfig: any, initOptions: any): Promise<any> {
    return new Promise((resolve: IResolveFn<any>, reject: IRejectFn<any>) => {
      if (!Keycloak) {
        reject('No Keycloak');
      }
      const keycloak = Keycloak(keycloakConfig);
      window.sessionStorage.setItem('oidcDashboardRedirectUrl', location.href);
      keycloak.init({
        onLoad: 'login-required',
        checkLoginIframe: false,
        useNonce: initOptions['useNonce'],
        scope: 'email profile',
        redirectUri: initOptions['redirectUrl']
      }).success(() => {
        resolve(keycloak);
      }).error((error: any) => {
        reject(error);
      });
    });
  }

  private getApis(keycloak: any): Promise<void> {
    return this.setAuthorizationHeader(keycloak).then(() => {
      return new Promise<void>((resolve: IResolveFn<void>, reject: IRejectFn<void>) => {
        // '/api/user' - a fast temporary solution to get a user data(t should be just '/api/')
        axios.get('/api/user')
          .then(resp => {
            if (resp.data) {
              this.user = resp.data;
              resolve();
            } else {
              reject('Unknown error');
            }
          }).catch(error => {
            console.log(error);
          });
      });
    });
  }

  private setAuthorizationHeader(keycloak: any): Promise<void> {
    return new Promise((resolve: IResolveFn<any>, reject: IRejectFn<any>) => {
      if (keycloak && keycloak.token) {
        keycloak.updateToken(5).success(() => {
          axios.interceptors.request.use(config => {
            config.headers['Authorization'] = `Bearer ${keycloak.token}`;
            return config;
          });
          resolve();
        }).error(() => {
          console.log('Failed to refresh token');
          window.sessionStorage.setItem('oidcDashboardRedirectUrl', location.href);
          keycloak.login();
          reject('Authorization is needed.');
        });
      }
      resolve();
    });
  }

  private addScript(src: string, callbacks: ICallbacks): void {
    KeycloakSetup.isDocumentReady.then(() => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = src;
      script.addEventListener('load', () => callbacks.onLoad());
      script.addEventListener('error', error => {
        console.log('error: ', error);
        callbacks.onError(error);
      });
      script.addEventListener('abort', () => {
        const error = 'Loader loading aborted.';
        console.log('error: ', error);
        callbacks.onError(error);
      });
      document.head.appendChild(script);
    })
  }
}
