import { INCLUDE_ALL } from '../../../../consts/batchRates.js';
import { getFilters } from './getFilters.js';

describe('getFilters', () => {
  test('should return get All', () => {
    const input = [INCLUDE_ALL];
    expect(getFilters(input, true)).toEqual({ getAll: true, ids: [] });
  });

  test('should return getAll false and no ids', () => {
    const input = [];
    expect(getFilters(input, false)).toEqual({ getAll: false, ids: [] });
  });

  test('should return getAll if INCLUDE_ALL', () => {
    const input = [1, 2, 3, INCLUDE_ALL];
    expect(getFilters(input, true)).toEqual({ getAll: true, ids: [] });
  });

  test('should return ids', () => {
    const input = [1, 2, 3];
    expect(getFilters(input, true)).toEqual({ getAll: false, ids: [1, 2, 3] });
  });
});
