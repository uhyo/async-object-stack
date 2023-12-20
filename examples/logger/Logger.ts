import {
  type AsyncObjectStack,
  type StackGuard,
  createAsyncObjectStack,
} from "../../src/index.js";

export class Logger {
  #stack: AsyncObjectStack;

  constructor() {
    this.#stack = createAsyncObjectStack();
  }

  /**
   * Runs the given function in a separate region.
   */
  region<R>(fn: () => R): R {
    return this.#stack.region(fn);
  }

  /**
   * Add metadata to the current execution.
   */
  metadata(metadata: object): StackGuard {
    return this.#stack.push(metadata);
  }

  /**
   * Emit a log message.
   */
  log(message: string): void {
    const metadata = this.#stack.render();
    console.log(JSON.stringify({ message, ...metadata }));
  }
}
