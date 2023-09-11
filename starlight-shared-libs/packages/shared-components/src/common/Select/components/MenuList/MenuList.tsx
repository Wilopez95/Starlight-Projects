import React from 'react';
import { SelectComponentsConfig } from 'react-select';

import { Layouts } from '../../../../layouts';
import { containerSizeToMenuHeight } from '../../Autocomplete/helpers';
import { ISelectOption } from '../../types';

export const MenuList: SelectComponentsConfig<ISelectOption, boolean>['MenuList'] = ({
  children,
  selectProps,
}) => {
  return (
    <Layouts.Scroll
      maxHeight={selectProps.maxMenuHeight || containerSizeToMenuHeight(selectProps.size)}
      rounded
    >
      {children}
    </Layouts.Scroll>
  );
};
