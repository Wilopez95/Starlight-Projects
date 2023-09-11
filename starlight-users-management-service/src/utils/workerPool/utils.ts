const timeoutSymbol = Symbol('timeout');

export const promiseWithTimer = async <T>(promise: Promise<T>, timeout: number): Promise<T> => {
  let timerId;
  const timeoutPromise = new Promise((resolve) => {
    timerId = setTimeout(resolve, timeout, timeoutSymbol);
  });

  const result = await Promise.race([promise, timeoutPromise]);

  if (result === timeoutSymbol) {
    throw new Error('Rejected due to timeout');
  }

  clearTimeout(timerId);

  return result as T;
};
