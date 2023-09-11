import { OptionalProperty } from '@root/types';

import { IConfirmModal } from '../Confirm/types';

export type IOverrideSubscriptionLimit = OptionalProperty<
  Pick<IConfirmModal, 'isOpen' | 'onCancel' | 'onSubmit' | 'subTitle'>,
  'subTitle'
>;
