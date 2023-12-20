import type { AsyncLocalStorage } from "../AsyncLocalStorage.js";
import { ObjectStack } from "./objectStack.js";

export class AsyncObjectStack {
  #store: AsyncLocalStorage<ObjectStack>;
  #defaultRegion: ObjectStack;

  constructor(store: AsyncLocalStorage<ObjectStack>) {
    this.#store = store;
    this.#defaultRegion = ObjectStack.create();
  }

  /**
   * Creates a region and runs given callback.
   */
  region<R>(callback: () => R): R {
    const current = this.#store.getStore() ?? this.#defaultRegion;
    const next = current.child();
    return this.#store.run(next, callback);
  }

  /**
   * Pushes given object to the object stack.
   */
  push(value: object): StackGuard {
    const stack = this.#store.getStore() ?? this.#defaultRegion;
    const remove = stack.push(value);
    return new StackGuard(remove);
  }

  /**
   * Returns the current stack rendered into a single object.
   */
  render(): object {
    const stack = this.#store.getStore() ?? this.#defaultRegion;
    return stack.render();
  }

  /**
   * Returns the snapshot of the current stack.
   */
  stackSnapshot(): object[] {
    const stack = this.#store.getStore() ?? this.#defaultRegion;
    return stack.snapshot();
  }
}

export class StackGuard implements Disposable {
  #remove: () => void;
  constructor(remove: () => void) {
    this.#remove = remove;
  }
  [Symbol.dispose](): void {
    this.#remove();
  }
}
