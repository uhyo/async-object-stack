import { AsyncLocalStorage } from "node:async_hooks";
import { AsyncObjectStack } from "./core/StackRuntime.js";
import type { AsyncLocalStorage as WinterCGAsyncLocalStorage } from "./AsyncLocalStorage.js";
import type { ObjectStack } from "./core/objectStack.js";

export function createAsyncObjectStack(): AsyncObjectStack {
  return new AsyncObjectStack(
    new AsyncLocalStorage() as WinterCGAsyncLocalStorage<ObjectStack>,
  );
}
