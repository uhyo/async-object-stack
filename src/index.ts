import { AsyncLocalStorage } from "node:async_hooks";
import { AsyncObjectStack, type StackGuard } from "./core/StackRuntime.js";
import type { AsyncLocalStorage as WinterCGAsyncLocalStorage } from "./AsyncLocalStorage.js";
import type { ObjectStack } from "./core/objectStack.js";

export type { AsyncObjectStack, StackGuard };

export function createAsyncObjectStack(): AsyncObjectStack {
  return new AsyncObjectStack(
    new AsyncLocalStorage() as WinterCGAsyncLocalStorage<ObjectStack>,
  );
}
