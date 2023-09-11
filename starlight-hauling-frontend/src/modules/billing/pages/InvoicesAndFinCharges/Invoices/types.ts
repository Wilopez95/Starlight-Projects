import { Ref } from 'react';

import { type AppliedFilterState } from '../../../../../common/TableTools/TableFilter';

export interface IInvoicesPage {
  filters?: AppliedFilterState;
  query?: string;
  isSpecificDetails?: boolean;
  ref?: Ref<unknown> | undefined;
  children?: React.ReactNode;
}

export interface IInvoicesPageHandle {
  requestData(): void;
}
