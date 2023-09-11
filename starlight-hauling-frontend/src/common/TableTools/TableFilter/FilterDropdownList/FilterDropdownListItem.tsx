import React from 'react';
import { Checkbox, Layouts } from '@starlightpro/shared-components';

import { OptionItem } from '@root/common';

import { IFilterDropdownListItem } from './types';

export const FilterDropdownListItem: React.FC<IFilterDropdownListItem> = ({
  item,
  selected,
  onClick,
}) => (
  <OptionItem>
    <Layouts.Padding padding="1">
      <Checkbox name={(item.label ?? item.value).toString()} value={selected} onChange={onClick}>
        {item.label}
      </Checkbox>
    </Layouts.Padding>
  </OptionItem>
);
