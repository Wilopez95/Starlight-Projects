import React from 'react';

import { IModal } from '@root/common/Modal/types';

export interface IConfirmModal extends IModal {
  title: string;
  subTitle: string;
  cancelButton: string;
  submitButton?: string;
  nonDestructive?: boolean;
  content?: React.ReactElement;
  onCancel(): void;
  onSubmit?(): void;
}
