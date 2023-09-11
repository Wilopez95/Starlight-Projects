import { parseSearchInput } from '../../../utils/search.js';

describe('searchInput', () => {
  it('should return null if searchInput is not provided', () => {
    const dummySearchInput = '';

    const result = parseSearchInput(dummySearchInput);

    expect(result).toBe(null);
  });

  it('should return obj with searchId and searchQuery properties when search input is dot separated numbers', () => {
    const dummySearchInput = '123.12.1';
    const expectedResult = {
      searchId: dummySearchInput,
      searchQuery: dummySearchInput.toLowerCase(),
    };

    const result = parseSearchInput(dummySearchInput);

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return obj with searchId and searchQuery properties when search input is stringified number', () => {
    const dummySearchInput = '12345';
    const expectedResult = {
      searchId: dummySearchInput,
      searchQuery: dummySearchInput.toLowerCase(),
    };

    const result = parseSearchInput(dummySearchInput);

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return obj with searchQuery property when search input is dot separated words', () => {
    const dummySearchInput = 'some . word.for.search';
    const expectedResult = {
      searchQuery: dummySearchInput.toLowerCase(),
    };

    const result = parseSearchInput(dummySearchInput);

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return obj with searchQuery property when search input looks like address', () => {
    const dummySearchInput = 'Colorado Boulevard, Denver, CO 80206';
    const expectedResult = {
      searchQuery: dummySearchInput.toLowerCase(),
    };

    const result = parseSearchInput(dummySearchInput);

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return obj with searchQuery property when search input is one world', () => {
    const dummySearchInput = 'Colorado';
    const expectedResult = {
      searchQuery: dummySearchInput.toLowerCase(),
    };

    const result = parseSearchInput(dummySearchInput);

    expect(result).toStrictEqual(expectedResult);
  });
});
