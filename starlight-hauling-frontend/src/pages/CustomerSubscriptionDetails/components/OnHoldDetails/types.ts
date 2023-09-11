import { Dispatch, SetStateAction } from 'react';

export interface IOnHoldDetails {
  setOnHoldModal: Dispatch<SetStateAction<{ updateOnly: boolean; isOnHoldModalOpen: boolean }>>;
  reason?: string | null;
  reasonDescription?: string | null;
  holdSubscriptionUntil?: Date | null;
}
