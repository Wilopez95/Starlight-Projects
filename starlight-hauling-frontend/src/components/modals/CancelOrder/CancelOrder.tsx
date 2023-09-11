import React from 'react';

import { Modal } from '@root/common';
import CancelOrderForm from '@root/components/forms/CancelOrder/CancelOrder';
import { ICancelOrderData, ICancelOrderProps } from '@root/components/forms/CancelOrder/types';

import { IFormModal } from '../types';

import styles from './css/styles.scss';

const CancelOrderModal: React.FC<IFormModal<ICancelOrderData> & ICancelOrderProps> = ({
  isOpen,
  onClose,
  onFormSubmit,
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <CancelOrderForm onSubmit={onFormSubmit} onClose={onClose} {...props} />
    </Modal>
  );
};

export default CancelOrderModal;
