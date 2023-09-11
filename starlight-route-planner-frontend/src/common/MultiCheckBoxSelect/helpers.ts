import { ISelectOption } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';

export const getOptions = (
  options: ISelectOption[] = [],
  values: (string | number)[] = [],
): ISelectOption[] =>
  options.filter(item => values.find(value => value === item.value) !== undefined);

export const buildOptions = (options: ISelectOption[] = []): ISelectOption[] => {
  return options.map(option => {
    if (typeof option !== 'object') {
      return {
        label: startCase(String(option)),
        value: option,
      };
    }

    return option;
  });
};

export const filterOptions = (
  options: ISelectOption[],
  searchString = '',
  exact?: boolean,
): ISelectOption[] => {
  if (!searchString) {
    return options;
  }

  const normalizedSearch = searchString.toLowerCase();

  return exact
    ? options.filter(option => option.label.toLowerCase().startsWith(normalizedSearch))
    : options.filter(option => option.label.toLowerCase().includes(normalizedSearch));
};
