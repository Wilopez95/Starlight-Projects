import { ISelectOption } from '@starlightpro/shared-components';
import { isEqual } from 'lodash-es';

export const getPreSelectedHistoricalOption = (
  options: ISelectOption[],
  preSelected: ISelectOption,
) => {
  const hasPreSelectedValue = options.some((frequency: ISelectOption) =>
    isEqual(frequency, preSelected),
  );

  return !hasPreSelectedValue ? preSelected : null;
};
