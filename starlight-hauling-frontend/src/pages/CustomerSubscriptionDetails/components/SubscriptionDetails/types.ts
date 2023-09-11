import { Dispatch, SetStateAction } from 'react';

export interface ISubscriptionDetails {
  setReminderConfigModalOpen(): void;
  setOnHoldModal: Dispatch<SetStateAction<{ updateOnly: boolean; isOnHoldModalOpen: boolean }>>;
}
