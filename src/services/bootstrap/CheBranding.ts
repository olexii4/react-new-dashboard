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
import axios from 'axios';
import { injectable } from 'inversify';
import * as $ from 'jquery';

import {
  BRANDING_DEFAULT, IBrandingDocs
} from './branding.constant'

type IResolveFn<T> = {
  (value?: T | PromiseLike<T>): void;
}

type IRejectFn<T> = {
  (reason?: any): void;
}

export type IBranding = { [key: string]: string | Record<string, any> };

const ASSET_PREFIX = './assets/branding/';

/**
 * This class is handling the branding data.
 * @author Oleksii Orel
 */
@injectable()
export class CheBranding {
  private branding = BRANDING_DEFAULT;
  private readonly readyPromise: Promise<void>;

  constructor() {
    this.readyPromise = this.updateData();
  }

  get ready(): Promise<void> {
    return this.readyPromise;
  }

  /**
   * Update branding data.
   */
  private updateData(): Promise<void> {
    return new Promise<void>((resolve: IResolveFn<void>, reject: IRejectFn<void>) => {
      // TODO remove '?id=' after the testing period
      // and exclude the 304 error (need for testing)
      axios.get(`${ASSET_PREFIX}product.json?id=${Math.floor((Math.random() * 100) + 1)}`)
        .then(resp => {
          this.branding = $.extend(true, BRANDING_DEFAULT, resp.data);
          resolve();
        }).catch(error => {
          if (error.status === 304) {
            resolve();
          } else {
            console.error(`Can't GET "${ASSET_PREFIX}product.json". Error: `, error);
            reject(error);
          }
        });
    });
  }

  get all(): IBranding {
    const branding: IBranding = Object.assign({}, this.branding);
    const logoURL = ASSET_PREFIX + branding.logoFile;
    branding.logoURL = logoURL;
    const logoText = ASSET_PREFIX + branding.logoTextFile;
    branding.logoText = logoText;
    const favicont = ASSET_PREFIX + branding.favicon;
    branding.favicon = favicont;
    const loaderURL = ASSET_PREFIX + branding.loader;
    branding.loaderURL = loaderURL;

    return branding;
  }

  /**
   * Returns object with docs URLs.
   */
  getDocs(): IBrandingDocs {
    return this.branding.docs;
  }
}
