import { IBillableService, ISubscriptionOrderSummary } from '@root/types';

export interface ISubscriptionOrderComponent extends ISubscriptionOrderSummary {
  showLabels?: boolean;
  billableService?: IBillableService;
}
