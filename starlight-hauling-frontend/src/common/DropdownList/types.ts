import { IOptionGroup } from '../Dropdown/components/OptionGroup/types';

export interface IDropdownList {
  children: React.ReactElement<IOptionGroup> | React.ReactElement<IOptionGroup>[];
  className?: string;
}

export interface IDropdownListHandle {
  open(): void;
}
