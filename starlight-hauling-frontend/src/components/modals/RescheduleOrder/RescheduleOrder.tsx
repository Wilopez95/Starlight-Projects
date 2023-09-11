import React from 'react';

import { Modal } from '@root/common';
import { RescheduleOrderForm } from '@root/components/forms';
import { IRescheduleOrderData } from '@root/components/forms/RescheduleOrder/types';

import { IFormModal } from '../types';

import styles from './css/styles.scss';

const RescheduleOrder: React.FC<IFormModal<IRescheduleOrderData>> = ({
  isOpen,
  onClose,
  onFormSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <RescheduleOrderForm onSubmit={onFormSubmit} onClose={onClose} />
    </Modal>
  );
};

export default RescheduleOrder;
