/**
 * Stack of objects.
 */
export class ObjectStack {
  #parentStack: object[] | undefined;
  #stack: object[] = [];

  static create(): ObjectStack {
    return new ObjectStack();
  }

  private constructor(parent?: ObjectStack) {
    this.#parentStack = parent?.snapshot();
  }

  child(): ObjectStack {
    return new ObjectStack(this);
  }

  push(value: object): () => void {
    const internal = Object.freeze(Object.assign(Object.create(null), value));
    this.#stack.push(internal);

    return () => {
      this.#remove(internal);
    };
  }

  #remove(value: object): void {
    const index = this.#stack.indexOf(value);
    if (index === -1) {
      throw new Error("Given object is not in the stack");
    }
    this.#stack.splice(index, 1);
  }

  render(): object {
    const result = Object.create(null);
    if (this.#parentStack !== undefined) {
      for (const object of this.#parentStack) {
        Object.assign(result, object);
      }
    }
    for (const object of this.#stack) {
      Object.assign(result, object);
    }
    return result;
  }

  snapshot(): object[] {
    const result = this.#parentStack ?? [];
    return result.concat(this.#stack);
  }
}
