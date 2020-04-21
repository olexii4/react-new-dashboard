import { getDefer, IDeferred } from '../deferred';

const JSON_RPC_VERSION = '2.0';

export type CommunicationClientEvent = 'open' | 'message' | 'close' | 'error';

/**
 * Interface for communication between two entrypoints
 */
export interface CommunicationClient {
  /**
   * Adds listener callbacks for specified client event.
   * @param {CommunicationClientEvent} eventType an event type
   * @param {Function} handler a callback function
   */
  addListener(eventType: CommunicationClientEvent, handler: Function): void;

  /**
   * Removes listener.
   * @param {CommunicationClientEvent} eventType an event type
   * @param {Function} handler a callback function
   */
  removeListener(eventType: CommunicationClientEvent, handler: Function): void;

  /**
   * Performs connections.
   * @param entrypointProvider
   */
  connect(entrypointProvider: () => Promise<string>): Promise<void>;

  /**
   * Close the connection.
   * @param {number} code close code
   */
  disconnect(code?: number): void;

  /**
   * Send pointed data.
   * @param data data to be sent
   */
  send(data: any): void;
}

type IRequest = {
  jsonrpc: string;
  id: string;
  method: string;
  params: any;
}

type INotification = {
  jsonrpc: string;
  method: string;
  params: any;
}

/**
 * This client is handling the JSON RPC requests
 */
export class JsonRpcClient {
  /**
   * Client for performing communications.
   */
  private client: CommunicationClient;
  /**
   * The list of the pending requests by request id.
   */
  private pendingRequests: Map<string, IDeferred<any>>;
  /**
   * The list of notification handlers by method name.
   */
  private notificationHandlers: Map<string, Array<Function>>;
  private counter = 100;

  constructor(client: CommunicationClient) {
    this.client = client;
    this.pendingRequests = new Map<string, IDeferred<any>>();
    this.notificationHandlers = new Map<string, Array<Function>>();

    this.client.addListener('message', (message: any) => {
      this.processResponse(message);
    });
  }

  /**
   * Performs JSON RPC request.
   * @param method method's name
   * @param params params
   */
  request(method: string, params?: any): Promise<any> {
    const deferred = getDefer();
    const id: string = (this.counter++).toString();
    this.pendingRequests.set(id, deferred);
    const request: IRequest = {
      jsonrpc: JSON_RPC_VERSION,
      id: id,
      method: method,
      params: params
    };
    this.client.send(request);
    return deferred.promise;
  }

  /**
   * Sends JSON RPC notification.
   * @param method method's name
   * @param params params (optional)
   */
  notify(method: string, params?: any): void {
    const request: INotification = { jsonrpc: JSON_RPC_VERSION, method: method, params: params };
    this.client.send(request);
  }

  /**
   * Adds notification handler.
   * @param method method's name
   * @param handler handler to process notification
   */
  public addNotificationHandler(method: string, handler: Function): void {
    let handlers = this.notificationHandlers.get(method);
    if (handlers) {
      handlers.push(handler);
    } else {
      handlers = [handler];
      this.notificationHandlers.set(method, handlers);
    }
  }

  /**
   * Removes notification handler.
   * @param method method's name
   * @param handler handler
   */
  public removeNotificationHandler(method: string, handler: Function): void {
    const handlers = this.notificationHandlers.get(method);
    if (handlers) {
      handlers.splice(handlers.indexOf(handler), 1);
    }
  }

  /**
   * Removes all notification handler.
   * @param method method's name
   */
  public removeAllNotificationHandler(method: string): void {
    const handlers = this.notificationHandlers.get(method);
    if (handlers) {
      handlers.length = 0;
    }
  }

  /**
   * Processes response - detects whether it is JSON RPC response or notification.
   * @param message
   */
  private processResponse(message: any): void {
    if (message.id && this.pendingRequests.has(message.id)) {
      this.processResponseMessage(message);
    } else {
      this.processNotification(message);
    }
  }

  /**
   * Processes JSON RPC notification.
   * @param message message
   */
  private processNotification(message: any): void {
    const method = message.method;
    const handlers = this.notificationHandlers.get(method);
    if (handlers && handlers.length > 0) {
      handlers.forEach((handler: Function) => {
        handler(message.params);
      });
    }
  }

  /**
   * Process JSON RPC response.
   * @param message
   */
  private processResponseMessage(message: any): void {
    const promise = this.pendingRequests.get(message.id);
    if (promise) {
      if (message.result) {
        promise.resolve(message.result);
      } else if (message.error) {
        promise.reject(message.error);
      }
    }
  }
}
