import { injectable } from 'inversify';

/**
 * This class is handling the debounce delay service.
 * @author Oleksii Orel
 */
@injectable()
export class Debounce {
  private debounceTimer: any;
  private isDebounceDelay = false;
  private debounceDelayHandlers: Array<Function> = [];

  setDelay(timeDelay: number = 5000) {
    this.setDebounceDelay(true);
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.setDebounceDelay(false);
    }, timeDelay);
  }

  private setDebounceDelay(isDebounceDelay: boolean) {
    this.isDebounceDelay = isDebounceDelay;
    this.debounceDelayHandlers.forEach(handler => {
      if (typeof handler === 'function') {
        handler(isDebounceDelay);
      }
    });
  }

  /**
   * Subscribe on the debounce delay event.
   * @param handler
   */
  subscribe(handler: (isDebounceDelay: boolean) => void): void {
    this.debounceDelayHandlers.push(handler);
  }

  unsubscribeAll() {
    this.debounceDelayHandlers = [];
  }

  hasDelay() {
    return this.isDebounceDelay;
  }
}
