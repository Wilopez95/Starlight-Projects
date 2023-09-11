import { type IBaseQuickView } from '@root/common/TableTools';

export type ISubscriptionQuickView = Omit<IBaseQuickView, 'newButtonRef'> & { mine: boolean };
