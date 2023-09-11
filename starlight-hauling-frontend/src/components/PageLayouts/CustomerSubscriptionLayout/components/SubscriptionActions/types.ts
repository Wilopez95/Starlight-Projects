import { ISubscription, ISubscriptionDraft } from '@root/types';

export interface ISubscriptionActions {
  subscription: ISubscription | ISubscriptionDraft | null;
  handleOpenOnHold(): void;
  handleResume(): void;
  handleReminderConfigModalOpen?(): void;
}
