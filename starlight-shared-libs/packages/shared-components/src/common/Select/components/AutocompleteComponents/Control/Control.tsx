import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';

import { SearchIcon } from '../../../../../assets';
import { Layouts } from '../../../../../layouts';
import { ISelectOption } from '../../../types';

export const Control: SelectComponentsConfig<ISelectOption, boolean>['Control'] = ({
  children,
  ...props
}) => {
  return (
    <components.Control {...props}>
      <Layouts.IconLayout right="0">
        <Layouts.Padding as={Layouts.Flex} left="1" alignItems="center" justifyContent="center">
          <SearchIcon />
        </Layouts.Padding>
      </Layouts.IconLayout>
      {children}
    </components.Control>
  );
};
