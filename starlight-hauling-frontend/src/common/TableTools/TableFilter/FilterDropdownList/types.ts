import { ISelectOption } from '@starlightpro/shared-components';

import { IOptionGroup } from '@root/common/Dropdown/components/OptionGroup/types';

export interface IFilterDropdownList {
  children: React.ReactElement<IOptionGroup> | React.ReactElement<IOptionGroup>[];
}

export interface IFilterDropdownListItem {
  item: ISelectOption;
  selected: boolean;
  onClick(): void;
}

export interface IAddFilterIcon {
  onClick(): void;
}
