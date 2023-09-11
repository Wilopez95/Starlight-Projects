import { ISelectOption, SelectValue } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';

type OptionsInput = SelectValue | ISelectOption;

export const normalizeOptions = (options: OptionsInput[]): ISelectOption[] =>
  options.map(x => {
    if (typeof x === 'object') {
      return x;
    }

    return {
      value: x,
      label: startCase(x?.toString()),
    };
  });
