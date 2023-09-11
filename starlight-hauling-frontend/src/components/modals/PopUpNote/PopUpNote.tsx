import React from 'react';

import { Modal } from '@root/common';
import { PopUpNoteForm } from '@root/components/forms';

import { IPopUpNoteModal } from './types';

import styles from './css/styles.scss';

const PopUpNoteModal: React.FC<IPopUpNoteModal> = ({
  isOpen,
  onClose,
  customerPopupNote,
  jobSitePopupNote,
  billingPopupNote,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    className={styles.modal}
    overlayClassName={styles.overlay}
  >
    <PopUpNoteForm
      customerPopupNote={customerPopupNote}
      billingPopupNote={billingPopupNote}
      jobSitePopupNote={jobSitePopupNote}
    />
  </Modal>
);

export default PopUpNoteModal;
