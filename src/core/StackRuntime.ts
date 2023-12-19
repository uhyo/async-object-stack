import type { AsyncLocalStorage } from "../AsyncLocalStorage.js";
import { ObjectStack } from "./objectStack.js";

export class AsyncObjectStack {
  #store: AsyncLocalStorage<ObjectStack>;

  constructor(store: AsyncLocalStorage<ObjectStack>) {
    this.#store = store;
  }

  /**
   * Creates a region and runs given callback.
   */
  region<R>(callback: () => R): R {
    const current = this.#store.getStore();
    const next = current?.child() ?? ObjectStack.create();
    return this.#store.run(next, callback);
  }

  /**
   * Pushes given object to the object stack.
   */
  push(value: object): StackGuard {
    const stack = this.#store.getStore();
    if (stack === undefined) {
      throw new Error(
        "StackRuntime#push must be called inside a region() callback",
      );
    }
    const remove = stack.push(value);
    return new StackGuard(remove);
  }

  /**
   * Returns the current stack rendered into a single object.
   */
  render(): object {
    const stack = this.#store.getStore();
    if (stack === undefined) {
      throw new Error(
        "StackRuntime#render must be called inside a region() callback",
      );
    }
    return stack.render();
  }
}

class StackGuard implements Disposable {
  #remove: () => void;
  constructor(remove: () => void) {
    this.#remove = remove;
  }
  [Symbol.dispose](): void {
    this.#remove();
  }
}
