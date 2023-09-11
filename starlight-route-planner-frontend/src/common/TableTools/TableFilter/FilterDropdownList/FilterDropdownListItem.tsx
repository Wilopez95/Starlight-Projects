import React from 'react';
import { Checkbox, Layouts, OptionItem } from '@starlightpro/shared-components';

import { IFilterDropdownListItem } from './types';

export const FilterDropdownListItem: React.FC<IFilterDropdownListItem> = ({
  item,
  selected,
  onClick,
}) => (
  <OptionItem>
    <Layouts.Padding padding="1">
      <Checkbox name={item.label} value={selected} onChange={onClick}>
        {item.label}
      </Checkbox>
    </Layouts.Padding>
  </OptionItem>
);
