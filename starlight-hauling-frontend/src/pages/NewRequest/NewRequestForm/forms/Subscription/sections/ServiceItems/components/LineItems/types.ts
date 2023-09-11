import { INewSubscriptionService } from '../../../../types';

export interface ILineItems {
  serviceItem: INewSubscriptionService;
  serviceIndex: number;
  isSubscriptionDraftEdit: boolean;
  isServiceRemoved: boolean;
  isSubscriptionEdit: boolean;
  isSubscriptionClosed?: boolean;
  initialServiceItem?: INewSubscriptionService;
}
