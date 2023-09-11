import { IModal } from '@root/common/Modal/types';

export interface IPopUpNoteModal extends IModal {
  jobSitePopupNote?: string;
  customerPopupNote?: string;
  billingPopupNote?: string;
}
