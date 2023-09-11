import React from 'react';
import { Checkbox, OptionItem, Layouts } from '@starlightpro/shared-components';

import { IFilterDropdownListItem } from './types';

export const FilterDropdownListItem: React.FC<IFilterDropdownListItem> = ({
  item,
  selected,
  onClick,
}) => (
  <OptionItem>
    <Layouts.Padding padding='1'>
      <Checkbox name={(item.label ?? item.value).toString()} value={selected} onChange={onClick}>
        {item.label}
      </Checkbox>
    </Layouts.Padding>
  </OptionItem>
);
