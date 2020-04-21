export type IResolveFn<T> = {
  (value?: T | PromiseLike<T>): void;
}

export type IRejectFn<T> = {
  (reason?: any): void;
}

/**
 * Provides a Defer object.
 */
export type IDeferred<T> = {
  resolve(value?: T | Promise<T>): void;
  reject(reason?: any): void;
  promise: Promise<T>;
}

export const getDefer = <T>(): IDeferred<T> => {
  const defer: { [param: string]: any } = {};
  defer.promise = new Promise((resolve: IResolveFn<T>, reject: IRejectFn<any>) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer as IDeferred<T>;
};
