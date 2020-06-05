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

import { CommunicationClientEvent, CommunicationClient } from './JsonRpcClient';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { getDefer } from '../deferred';
import { injectable } from 'inversify';


/**
 * JSON RPC through websocket.
 */
@injectable()
export class WebsocketClient implements CommunicationClient {
  private websocketStream: ReconnectingWebSocket;
  private handlers: { [event: string]: Function[] } = {};


  /**
   * Performs connection to the pointed entrypoint.
   * @param entrypointProvider the entrypoint to connect to
   */
  connect(entrypointProvider: (() => Promise<string>)): Promise<any> {
    const deferred = getDefer();
    this.websocketStream = new ReconnectingWebSocket(entrypointProvider, [], {
      connectionTimeout: 60000
    });
    this.websocketStream.addEventListener('open', event => {
      const eventType: CommunicationClientEvent = 'open';
      this.callHandlers(eventType, event);
      deferred.resolve();
    });
    this.websocketStream.addEventListener('error', event => {
      const eventType: CommunicationClientEvent = 'error';
      this.callHandlers(eventType, event);
      deferred.reject();
    });
    this.websocketStream.addEventListener('message', message => {
      const data = JSON.parse(message.data);
      const eventType: CommunicationClientEvent = 'message';
      this.callHandlers(eventType, data);
    });
    this.websocketStream.addEventListener('close', event => {
      const eventType: CommunicationClientEvent = 'close';
      this.callHandlers(eventType, event);
    });
    return deferred.promise;
  }

  /**
   * Performs closing the connection.
   * @param {number} code close code
   */
  disconnect(code?: number): void {
    if (this.websocketStream) {
      this.websocketStream.close(code ? code : undefined);
    }
  }

  /**
   * Adds a listener on an event.
   * @param {CommunicationClientEvent} event
   * @param {Function} handler
   */
  addListener(event: CommunicationClientEvent, handler: Function): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  /**
   * Removes a listener.
   * @param {CommunicationClientEvent} event
   * @param {Function} handler
   */
  removeListener(event: CommunicationClientEvent, handler: Function): void {
    if (this.handlers[event] && handler) {
      const index = this.handlers[event].indexOf(handler);
      if (index !== -1) {
        this.handlers[event].splice(index, 1);
      }
    }
  }

  private sleep(ms: number): Promise<any> {
    return new Promise<any>(resolve => setTimeout(resolve, ms));
  }

  /**
   * Sends pointed data.
   * @param data to be sent
   */
  async send(data: any): Promise<void> {
    while (this.websocketStream.readyState !== this.websocketStream.OPEN) {
      await this.sleep(1000);
    }
    return this.websocketStream.send(JSON.stringify(data));
  }

  private callHandlers(event: CommunicationClientEvent, data?: any): void {
    if (this.handlers[event] && this.handlers[event].length > 0) {
      this.handlers[event].forEach((handler: Function) => handler(data));
    }
  }
}
