/* eslint-disable no-negated-condition */
/* eslint-disable @typescript-eslint/no-invalid-this */
/**
 * It takes a replacer function and returns a function that can be used as a serializer for
 * JSON.stringify
 * @param [replacer] - A function that will be called with the key and value of each property.
 * @returns The serializer function.
 */
const serializer = (
  replacer?: (this: unknown, key: string, value: unknown) => unknown,
): ((this: unknown, key: string, value: unknown) => unknown) => {
  const stack: unknown[] = [];
  const keys: string[] = [];

  const formatCycle = (_: string, value: unknown) => {
    if (stack[0] === value) return '[Circular ~]';

    return `[Circular ~.${keys.slice(0, stack.indexOf(value)).join('.')}]`;
  };

  // eslint-disable-next-line func-names
  return function (key, value) {
    let val = value;

    if (stack.length > 0) {
      const thisPos = stack.indexOf(this);

      if (thisPos !== -1) {
        stack.splice(thisPos + 1);
      } else {
        stack.push(this);
      }

      if (thisPos !== -1) {
        keys.splice(thisPos, Infinity, key);
      } else {
        keys.push(key);
      }

      if (stack.includes(value)) {
        val = formatCycle(key, value);
      }
    } else {
      stack.push(val);
    }
    return replacer ? replacer.call(this, key, val) : val;
  };
};

/**
 * It takes an object and returns a string
 * @param {unknown} obj - The object to be serialized.
 * @param [replacer] - A function that transforms the results of stringifying.
 * @param {string | number} [space] - The number of spaces to indent nested objects. If this is a
 * string, it is used as a single indent.
 * @returns A string.
 */
export const safeStringify = (
  obj: unknown,
  replacer?: (this: unknown, key: string, value: unknown) => unknown,
  space?: string | number,
): string => {
  const result = JSON.stringify(obj, serializer(replacer), space);

  return result;
};
