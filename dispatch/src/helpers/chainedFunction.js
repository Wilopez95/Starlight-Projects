/* eslint-disable no-invalid-this */
export default (...funcs) =>
  funcs
    .filter((func) => typeof func === 'function')
    .reduce((accumulator, func) => {
      if (accumulator === null) {
        return func;
      }

      return function chainedFunction(...args) {
        accumulator.apply(this, args);
        func.apply(this, args);
      };
    }, null);
