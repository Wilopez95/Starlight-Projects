import React from 'react';

import { QuickViewConfirmModal } from '../QuickViewConfirmModal/QuickViewConfirmModal';
import { QuickViewLeftPanelSize } from '../types';

export interface IQuickViewContent {
  rightPanelElement: React.ReactElement;
  leftPanelElement?: React.ReactElement;
  actionsElement?: React.ReactElement;
  leftPanelSize?: QuickViewLeftPanelSize;
  confirmModal?: React.ReactElement<typeof QuickViewConfirmModal>;
  dirty?: boolean;
  shouldShowModal?: boolean;
}
