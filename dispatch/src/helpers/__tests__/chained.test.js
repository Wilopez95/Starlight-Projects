/**
 * @jest-environment jsdom
 */
/* eslint-disable */
import { default as chainedFunction } from '../chainedFunction';

test('chained function', () => {
  const wanted = [3, 4, 5];
  const found = [];
  const fn = chainedFunction(
    function (val) {
      found.push(val + 1);
    },
    function (val) {
      found.push(val + 2);
    },
    function (val) {
      found.push(val + 3);
    },
  );
  fn(2);
  expect(found).toEqual(wanted);
});
