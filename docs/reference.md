# `async-object-stack` reference

## Requirements

- This package requires a runtime with support for `AsyncLocalStorage`. This includes Node.js, Deno and Bun.
- This package loses most of its power if the `using` syntax is unavailable. You need to use either a runtime with native support or a transpiler that supports it.
- If you use transpilers, you may also need to polyfill `Symbol.disposable`.

## Supported Runtimes

This package supports Node.js 18 and later.

It is also possible to use this package with other runtimes that support importing `AsyncLocalStorage` from `node:async_hooks` (namely Deno and Bun). However, there is no CI set up to guarantee that it will work correctly.

## `createAsyncObjectStack()`

Creates an `AsyncObjectStack` instance.

```js
import { createAsyncObjectStack } from 'async-object-stack';

const stack = createAsyncObjectStack();
```

## `AsyncObjectStack`

Object that keeps a stack of objects. Usually, you will create one instance of `AsyncObjectStack` and use it throughout your application.

Basic operations are **push** and **render**. **Push** is to push an object to the stack. **Render** is to get the result of merging all objects in the stack into one.

> [!TIP]
> Technically, an `AsyncObjectStack` instance is a wrapper of `AsyncLocalStorage` that keeps a stack of objects in the current async execution context.

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

### `AsyncObjectStack#region()`

Runs given callback in a child _region_ and returns the result. Modifications to the stack will not affect beyond region boundaries.

Objects in the stack are inherited from the parent region. 

```js
using guard = stack.push({ pika: "chu" });
await stack.region(async () => {
  using guard2 = stack.push({ bulba: "saur" });
  const obj = stack.render();
  console.log(obj); // { pika: "chu", bulba: "saur" }
});
```

Regions are useful when you want to dispatch concurrent tasks that push objects to the stack. Without regions, those tasks will interfere with each other.

```js
const userIds = ["John", "Jane", "Jack"];
await Promise.all(userIds.map((userId) => stack.region(async () => {
  using guard = stack.push({ userId });
  // Without regions, all tasks will see the same userId in the stack.
  await doSomething();
})));
```
> [!TIP]
> Technically, `region` is just a wrapper of `AsyncLocalStorage#run`. 


### `AsyncObjectStack#stackSnapshot()`

Returns the list of objects in the stack without merging them.

The result is a snapshot of the stack. It won't be affected by further mutations of the stack.

```js
using guard = stack.push({ pika: "chu" });
using guard2 = stack.push({ bulba: "saur" });

const snapshot = stack.stackSnapshot();
console.log(snapshot); // [{ pika: "chu" }, { bulba: "saur" }]
```
