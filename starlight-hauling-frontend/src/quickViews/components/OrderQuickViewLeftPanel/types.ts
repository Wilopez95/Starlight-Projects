import { ISelectOption } from '@starlightpro/shared-components';

export interface ILeftPanel {
  isEdit?: boolean;
  setBillableServiceOptions: (a?: ISelectOption[] | undefined) => void;
}
