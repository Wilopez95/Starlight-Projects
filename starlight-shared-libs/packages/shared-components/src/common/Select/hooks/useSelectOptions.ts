import { useMemo } from 'react';

import { ISelectOption, ISelectOptionGroup, SelectOptionsData, SelectValue } from '../types';

export const useSelectOptionGroups = (
  inputOptions: SelectOptionsData,
  value: SelectValue | SelectValue[] | undefined = [],
): UseSelectOptionGroupsResponse => {
  const serializedGroups: ISelectOptionGroup[] = useMemo(() => {
    //? If first element is group , it means all elements are OptionGroup, else all elements are Options
    const groupOrOption = inputOptions[0];

    if (typeof groupOrOption === 'object' && 'options' in groupOrOption) {
      const groups = inputOptions as ISelectOptionGroup[];

      return groups;
    } else {
      return [
        {
          options: inputOptions as ISelectOption[],
        },
      ];
    }
  }, [inputOptions]);

  const selectedOptions: ISelectOption[] = useMemo(() => {
    const values = Array.isArray(value) ? value : [value];

    return serializedGroups.flatMap(x => x.options).filter(x => values.includes(x.value));
  }, [serializedGroups, value]);

  return [serializedGroups, selectedOptions];
};

type UseSelectOptionGroupsResponse = [ISelectOptionGroup[], ISelectOption[]];
