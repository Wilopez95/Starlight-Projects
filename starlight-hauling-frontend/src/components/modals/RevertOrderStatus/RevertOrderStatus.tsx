import React from 'react';

import { Modal } from '@root/common';
import RevertOrderStatusForm from '@root/components/forms/RevertOrderStatus/RevertOrderStatus';
import { type IRevertOrderStatusData } from '@root/components/forms/RevertOrderStatus/types';

import { type IRevertOrderStatusModal } from './types';

import styles from './css/styles.scss';

const RevertOrderStatusModal: React.FC<IRevertOrderStatusModal<IRevertOrderStatusData>> = ({
  isOpen,
  onClose,
  onFormSubmit,
  status,
  toStatus,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <RevertOrderStatusForm
        status={status}
        onSubmit={onFormSubmit}
        onClose={onClose}
        toStatus={toStatus}
      />
    </Modal>
  );
};

export default RevertOrderStatusModal;
