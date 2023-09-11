import React from 'react';

import { Modal } from '@root/common';
import AddManifest from '@root/components/forms/AddManifest/AddManifest';
import { INewManifestWithFile } from '@root/components/forms/AddManifest/types';

import { IFormModal } from '../types';

import styles from './css/styles.scss';

export const AddManifestModal: React.FC<IFormModal<INewManifestWithFile>> = ({
  isOpen,
  onClose,
  onFormSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <AddManifest onSubmit={onFormSubmit} onClose={onClose} />
    </Modal>
  );
};
