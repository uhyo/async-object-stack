# async-object-stack

A wrapper of [AsyncLocalStorage](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage) that keeps a stack of objects. Supports the `using` syntax to automatically pop objects from the stack when the current scope ends.

Primary use case is creating a nice API for structural logging. See [Structural Logging Example](./examples/logger).

**[Reference](./docs/reference.md)**

## Installation

```sh
npm install async-object-stack
```

## Example

See also: [Structural Logging Example](./examples/logger).

```js
import { createAsyncObjectStack } from 'async-object-stack';

const stack = createAsyncObjectStack();

console.log(stack.render()); // {}
using guard = stack.push({ pika: "chu" });
console.log(stack.render()); // { pika: "chu" }
{
  using guard2 = stack.push({ bulba: "saur" });
  console.log(stack.render()); // { pika: "chu", bulba: "saur" }
}
console.log(stack.render()); // { pika: "chu" }
```

## License

MIT