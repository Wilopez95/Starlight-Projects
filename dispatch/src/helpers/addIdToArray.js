/* eslint-disable no-param-reassign */
export function addIdToArray(arr, idToAdd) {
  if (arr.indexOf(idToAdd) === -1) {
    arr = [...arr, idToAdd];
  }

  return arr;
}
