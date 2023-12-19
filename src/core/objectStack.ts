/**
 * Stack of objects.
 */
export class ObjectStack {
  #parent: ObjectStack | undefined;
  #stack: object[] = [];

  static create(): ObjectStack {
    return new ObjectStack();
  }

  private constructor(parent?: ObjectStack) {
    this.#parent = parent;
  }

  child(): ObjectStack {
    return new ObjectStack(this);
  }

  push(value: object): () => void {
    const internal = Object.assign(Object.create(null), value);
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
    const result = this.#parent?.render() ?? Object.create(null);
    for (const object of this.#stack) {
      Object.assign(result, object);
    }
    return result;
  }
}
