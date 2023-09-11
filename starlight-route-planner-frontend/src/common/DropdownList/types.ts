import { IOptionGroup } from '@starlightpro/shared-components';

export interface IDropdownList {
  children: React.ReactElement<IOptionGroup> | React.ReactElement<IOptionGroup>[];
  className?: string;
}

export interface IDropdownListHandle {
  open(): void;
}
