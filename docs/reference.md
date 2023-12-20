# `async-object-stack` reference

## Requirements

- This package requires a runtime with support for `AsyncLocalStorage`. This includes Node.js, Deno and Bun.
- This package relies on the `using` syntax. You need to use either a runtime with support for `using` or a transpiler that supports it.
- If you use transpilers, you may also need to polyfill `Symbol.disposable`.

## `createAsyncObjectStack()`

Creates an `AsyncObjectStack` instance.

```js
import { createAsyncObjectStack } from 'async-object-stack';

const stack = createAsyncObjectStack();
```

## `AsyncObjectStack`

Technically, an `AsyncObjectStack` instance is a wrapper of `AsyncLocalStorage` that keeps a stack of objects in the current async execution context.

Basic operations are **push** and **render**. **Push** is to push an object to the stack. **Render** is to get the result of merging all objects in the stack into one.

### `AsyncObjectStack#push(object)`

Pushes an object to the stack. Returns an opaque Disposable object.

You should store the return value of `push` in a `using` variable. By doing so, the object will be automatically popped from the stack when the current scope ends.

```js
// Push an object to the stack.
using guard = stack.push({ pika: "chu" });
// Object can have multiple properties.
using guard2 = stack.push({ bulba: "saur", char: "mander" });
```

### `AsyncObjectStack#render()`

Renders the stack into one object. Returned object is null-prototyped in order to avoid weird security stuff.

Properties are shallowly merged from the bottom to the top of the stack. If there are multiple properties with the same name, the one added later will override the one added earlier.

```js
using guard = stack.push({ pika: "chu" });
using guard2 = stack.push({ bulba: "saur" });

const obj = stack.render();
console.log(obj); // { pika: "chu", bulba: "saur" }
```

### `AsyncObjectStack#stackSnapshot()`

Returns the list of objects in the stack without merging them.

The result is a snapshot of the stack. It won't be affected by further mutations of the stack.

```js
using guard = stack.push({ pika: "chu" });
using guard2 = stack.push({ bulba: "saur" });

const snapshot = stack.stackSnapshot();
console.log(snapshot); // [{ pika: "chu" }, { bulba: "saur" }]
```