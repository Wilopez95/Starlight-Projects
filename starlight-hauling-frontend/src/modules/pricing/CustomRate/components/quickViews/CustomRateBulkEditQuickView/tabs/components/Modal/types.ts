import { Dispatch, SetStateAction } from 'react';

export interface IOverrideChangesModal {
  isOpened: boolean;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
  closeBulkUpdate(): void;
  onBulkUpdate(overrideUpdates?: boolean): void;
}
