/**
 * It takes a function and an optional equality function and returns a memoized version of the function
 * @param {TFunc} func - The function to memoize.
 * @param [equalityFn] - A function that returns a key for the cache.
 * @returns A function.
 */
export const memoize = <TArgs extends never[], TFunc extends (...args: TArgs) => unknown>(
  func: TFunc,
  equalityFn?: (...args: TArgs) => unknown,
): TFunc => {
  if (typeof func !== 'function' || (equalityFn && typeof equalityFn !== 'function')) {
    throw new TypeError('Expected a function');
  }

  const cache = new Map<unknown, ReturnType<TFunc>>();

  const memoized = (...args: TArgs) => {
    const key = equalityFn ? equalityFn(...args) : args[0];

    const cached = cache.get(key);

    if (cached) {
      return cached;
    }

    const result = func(...args);
    return result;
  };

  return memoized as TFunc;
};
