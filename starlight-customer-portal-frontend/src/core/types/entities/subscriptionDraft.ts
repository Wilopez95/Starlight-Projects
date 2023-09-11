import { IEntity, ISubscription } from '.';

type RequiredSubscriptionProps =
  | 'createdAt'
  | 'updatedAt'
  | 'businessUnit'
  | 'businessLine'
  | 'customer'
  | 'endDate'
  | 'grandTotal'
  | 'jobSite'
  | 'jobSiteContactTextOnly'
  | 'paymentMethod'
  | 'serviceFrequencyAggregated'
  | 'serviceFrequency'
  | 'serviceName'
  | 'startDate'
  | 'serviceItems'
  | 'route'
  | 'serviceArea'
  | 'customRatesGroup'
  | 'creditCard'
  | 'lineItems'
  | 'driverInstructions'
  | 'highPriority'
  | 'serviceDaysOfWeek'
  | 'permit'
  | 'purchaseOrder'
  | 'bestTimeToComeFrom'
  | 'bestTimeToComeTo'
  | 'thirdPartyHauler';

type PartialSubscriptionProps = 'subscriptionContact' | 'csr';

export interface ISubscriptionDraft
  extends IEntity,
    Pick<ISubscription, RequiredSubscriptionProps>,
    Partial<Pick<ISubscription, PartialSubscriptionProps>> {
  permitRequired: boolean;
  poRequired: boolean;
  signatureRequired: boolean;
  alleyPlacement: boolean;
  someoneOnSite?: boolean;
}
