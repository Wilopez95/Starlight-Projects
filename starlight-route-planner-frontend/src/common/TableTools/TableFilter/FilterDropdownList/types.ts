import { IOptionGroup, ISelectOption } from '@starlightpro/shared-components';

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
