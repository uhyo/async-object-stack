/**
 * WinterCG's AsyncLocalStorage interface
 * @see {@link https://github.com/wintercg/proposal-common-minimum-api/blob/main/asynclocalstorage.md}
 */
export interface AsyncLocalStorage<T> {
  run<Fn extends (...args: readonly any[]) => unknown>(value: T | undefined, fn: Fn, ...args: Parameters<Fn>): ReturnType<Fn>;
  exit<Fn extends (...args: readonly any[]) => unknown>(fn: Fn, ...args: Parameters<Fn>): ReturnType<Fn>;
  getStore(): T | undefined;
}

export type AsyncLocalStorageConstructor = new <T>() => AsyncLocalStorage<T>;
