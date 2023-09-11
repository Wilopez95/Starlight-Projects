import { IInvoicesUnion } from '@root/api';
import { Regions } from '@root/i18n/config/region';

import { type ICompany } from '../../../../../../../types';
import { type FormikCustomerWithInvoiceDrafts } from '../../types';
import { type ExpandedOption } from '../types';

export interface IBasePanel {
  expanded: boolean;
  currentCustomer: FormikCustomerWithInvoiceDrafts;
  onToggle(
    event: React.MouseEvent<HTMLElement>,
    expanded: boolean,
    identifier: ExpandedOption,
  ): void;
}

export interface IInvoiceDraftPanel<T> extends IBasePanel {
  draft: T;
  path: string;
  index: number;
  currentCompany?: ICompany;
  onDraftRemove(draft: T, index: number, entityKey: keyof IInvoicesUnion<unknown, unknown>): void;
}

export interface IOverlimitPanel extends IBasePanel {
  onCreatePayment(): void;
  onPutOnAccount(overrideCreditLimit: boolean): void;
}

export interface IOverpaidPanel extends IBasePanel {
  onCreateRefund(): void;
}

export interface IUnFinalizedOrdersPanel extends IBasePanel {
  onIgnore?(): void;
}

export interface ISubscriptionAddress {
  state: string;
  city: string;
  zip: string;
  region: Regions;
  addressLine1?: string;
  addressLine2?: string | null;
}
