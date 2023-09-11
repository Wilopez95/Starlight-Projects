import { SubscriptionTabRoutes } from '@root/consts';

export type CustomerSubscriptionParams = {
  customerId: string;
  subscriptionId: string;
  tab: SubscriptionTabRoutes;
  subscriptionOrderId: string;
};

export interface ICustomerSubscriptionLayout {
  children: React.ReactNode;
  isOnHoldModalOpen?: boolean;
  updateOnly?: boolean;
  refreshSubscriptionOrders?: boolean;
  setOnHoldModal?({
    updateOnly,
    isOnHoldModalOpen,
  }: {
    updateOnly: boolean;
    isOnHoldModalOpen: boolean;
  }): void;
  setReminderConfigModalOpen?(): void;
}
