import React from 'react';

import { Modal } from '@root/common';
import { LinkJobSiteForm } from '@root/components/forms';

import { ILinkJobSiteModal } from './types';

import styles from './css/styles.scss';

const LinkJobSiteModal: React.FC<ILinkJobSiteModal> = ({
  isOpen,
  onClose,
  onFormSubmit,
  onJobSiteCreate,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <LinkJobSiteForm
        onSubmit={onFormSubmit}
        onClose={onClose}
        onJobSiteCreated={onJobSiteCreate}
      />
    </Modal>
  );
};

export default LinkJobSiteModal;
