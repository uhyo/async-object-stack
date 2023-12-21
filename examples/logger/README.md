## Structural Logging Example

This example shows how to use `async-object-stack` to implement an easy to use structural logging system.

### How to run

Build TypeScript by `npx tsc` and run `node index.js` to invoke an HTTP server on port 8080.

Then access to http://localhost:8080/abc (for example) and see the console. A typical output is like this:

```json
{"message":"app started","app":"example-logger"}
{"message":"processing request","app":"example-logger","url":"/abc","ipAddress":"::1"}
{"message":"request processed","app":"example-logger","url":"/abc","ipAddress":"::1","userId":"639"}
{"message":"processing request","app":"example-logger","url":"/favicon.ico","ipAddress":"::1"}
{"message":"request processed","app":"example-logger","url":"/favicon.ico","ipAddress":"::1","userId":"755"}
```

### What is structural logging?

**Structural logging** is a logging system where each log entry can contain arbitrary metadata in addition to log message. The benefit of structural logging is that you can easily filter and aggregate logs by metadata.

You often want to share the same metadata across multiple log entries. For example, once you know the ID of the user who sent a request, you want to add it to all log entries related to the request. This is where the idea of “context” (in other words, current shared metadata) comes in.

Accurate propagation of the context is a hard problem. In server-side JavaScript, [AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) is known as a good solution. With `AsyncLocalStorage`, the context is automatically propagated to all asynchronous callbacks, so you don’t need to pass it around manually.

### Using `async-object-stack`

`async-object-stack` utilizes `AsyncLocalStorage` to provide a simple interface to manage the context. Its API is specialized for managing the context as a stack of objects which can be rendered into one object at any time. Since log metadata is usually represented as an object, this API is a good fit for structural logging.

This example implements a [`Logger` class](./logger.ts) that uses `async-object-stack` to manage the context. This is a thin wrapper of `AsyncObjectStack` from `async-object-stack`. This class exposes `AsyncObjectStack`'s `push` and `region` methods for managing the context, and provides a `log` method that automatically renders the context into a log entry.

While this implementation emits log entries as JSON strings to the console, you can easily replace it with your favorite logging library.

Usage of `Logger` is shown in [`index.ts`](./index.ts). This example shows a typical usage pattern of `Logger` for a web server.

Of note is that you can use a singleton `Logger` instance throughout your application.

Whenever you want to add metadata to the context, you use the `Logger#metadata` method. Then, those metadata will be shared across all log entries emitted in the current function (including ones called from the current function).

```ts
using guard = logger.metadata({
  url: req.url,
  ipAddress: req.socket.remoteAddress,
});
```

By utilizing the `using` syntax, you can ensure that the metadata is automatically removed from the context when the current function ends. In a rare case where you want the metadata to be persisted even after the current function ends, you can just avoid using `using`.

### Using `region`

When you use `async-object-stack`, it is important to understand the concept of `region`. Failing to use `region` correctly can lead to unwanted and weird behavior where the context is shared across unrelated tasks.

Fortunately, the rule of `region` is simple. You should use `region` whenever you want to dispatch a task that works concurrently with the current task. In other words, you should use `region` whenever you create a `Promise` instance that you don't `await` immediately. This includes e.g. `Promise.all` and `Promise.race` (where you pass `Promise` instances to such function before you `await` them).

In the example, the `region` method is used as follows:

```ts
logger.region(() =>
  processRequest(req, res).catch((error) => {
    using guard = logger.metadata({ error });
    logger.log("error processing request");
  }),
);
```

The server may process multiple requests concurrently. Therefore, we use `region` to ensure that the context is not shared across requests.