import React from 'react';

import { Modal } from '@root/common';
import AddPolygon from '@root/components/forms/AddPolygon/AddPolygon';

import { IAddPolygonModal } from './types';

import styles from './css/styles.scss';

const AddPolygonModal: React.FC<IAddPolygonModal> = ({ basePath, isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <AddPolygon onClose={onClose} basePath={basePath} />
    </Modal>
  );
};

export default AddPolygonModal;
