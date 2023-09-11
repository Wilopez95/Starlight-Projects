import { ISubscriptionServiceItem } from '../Interfaces/SubscriptionServiceItem';

export const subscriptionServiceName = (services: ISubscriptionServiceItem[]): string =>
  services.length > 1 ? 'Multiple' : services[0]?.billableService?.description ?? '-';
