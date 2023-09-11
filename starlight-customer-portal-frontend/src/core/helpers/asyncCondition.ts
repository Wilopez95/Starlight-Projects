interface ControlledPromise<T> extends Promise<T> {
  resolveWith(value: T): void;
}

export const makeControlledPromise = <T>(): ControlledPromise<T> => {
  let resolve: (value: T) => void;
  const p = new Promise<T>((res) => {
    resolve = res;
  });

  return {
    [Symbol.toStringTag]: '[Controlled Promise',
    resolveWith(value: T) {
      resolve(value);
    },
    then: p.then.bind(p),
    catch: p.catch.bind(p),
    finally: p.finally.bind(p),
  };
};
