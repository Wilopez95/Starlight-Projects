import React from 'react';
import cx from 'classnames';

import { Modal } from '@root/common';
import NewPurchaseOrderForm from '@root/components/forms/NewPurchaseOrder/NewPurchaseOrder';
import { IPurchaseOrder } from '@root/types';

import { IFormModal } from '../types';

import styles from './css/styles.scss';

const NewPurchaseOrderModal: React.FC<IFormModal<IPurchaseOrder>> = ({
  isOpen,
  onClose,
  onFormSubmit,
  fullSize,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      overlayClassName={cx(styles.overlay, { [styles.fullSize]: fullSize })}
    >
      <NewPurchaseOrderForm onSubmit={onFormSubmit} onClose={onClose} />
    </Modal>
  );
};

export default NewPurchaseOrderModal;
