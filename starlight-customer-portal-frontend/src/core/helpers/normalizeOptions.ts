import { startCase } from 'lodash-es';

import { ISelectOption, SelectValue } from '@root/core/common/Select/types';

type OptionsInput = SelectValue | ISelectOption;

export const normalizeOptions = (options: OptionsInput[]): ISelectOption[] => {
  return options.map((x) => {
    if (typeof x === 'object') {
      return x;
    }

    return {
      value: x,
      label: startCase(x.toString()),
    };
  });
};
