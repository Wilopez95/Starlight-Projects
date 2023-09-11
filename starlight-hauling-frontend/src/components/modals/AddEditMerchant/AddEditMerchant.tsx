import React from 'react';

import { Modal } from '@root/common';
import AddEditMerchantForm from '@root/components/forms/AddEditMerchant/AddEditMerchant';

import { IAddEditMerchantModal } from './types';

import styles from './css/styles.scss';

const AddEditMerchant: React.FC<IAddEditMerchantModal> = ({
  title,
  hasApprovedMerchant,
  initialValues,
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
      <AddEditMerchantForm
        hasApprovedMerchant={hasApprovedMerchant}
        title={title}
        initialValues={initialValues}
        onSubmit={onFormSubmit}
        onClose={onClose}
      />
    </Modal>
  );
};

export default AddEditMerchant;
