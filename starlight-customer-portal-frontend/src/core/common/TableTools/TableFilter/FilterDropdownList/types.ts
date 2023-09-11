import { IOptionGroup } from '@root/core/common/Dropdown/components/OptionGroup/types';
import { ISelectOption } from '@root/core/common/Select/types';

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
