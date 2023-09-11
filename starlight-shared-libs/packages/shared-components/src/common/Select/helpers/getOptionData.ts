import { ISelectOption } from '../types';

export const formatLabel = (option: ISelectOption): string => {
  let baseLabel = option.label;

  if (option.COEHint) {
    baseLabel += ' (COE)';
  }

  return baseLabel;
};
