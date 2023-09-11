export function getArrayFromOverloadedRest(overloadedArray) {
  let items;

  if (Array.isArray(overloadedArray[0])) {
    // eslint-disable-next-line prefer-destructuring
    items = overloadedArray[0];
  } else {
    items = overloadedArray;
  }

  return items;
}
