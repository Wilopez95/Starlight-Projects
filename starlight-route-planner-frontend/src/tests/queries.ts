import { buildQueries, Matcher, MatcherOptions, queryHelpers } from '@testing-library/react';

const queryAllByName = (
  container: HTMLElement,
  id: Matcher,
  options?: MatcherOptions | undefined,
) => queryHelpers.queryAllByAttribute('name', container, id, options);

const queryByNameMultipleError = (_: HTMLElement, attrValue: string) =>
  `Found multiple elements with the name of: ${attrValue}`;

const queryByNameMissingError = (_: HTMLElement, attrValue: string) =>
  `Unable to find an element with the name of: ${attrValue}`;

const [queryByName, getAllByName, getByName, findAllByName, findByName] = buildQueries(
  queryAllByName,
  queryByNameMultipleError,
  queryByNameMissingError,
);

export { queryByName, getAllByName, getByName, findAllByName, findByName };
