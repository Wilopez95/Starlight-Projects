import React from 'react';
import cx from 'classnames';

import { Modal } from '@root/common';
import { NewContactForm } from '@root/components/forms';
import { IContactFormData } from '@root/components/forms/NewContact/types';

import { IFormModal } from '../types';

import styles from './css/styles.scss';

const NewContactModal: React.FC<IFormModal<IContactFormData>> = ({
  isOpen,
  half,
  onClose,
  onFormSubmit,
  fullSize,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      overlayClassName={cx(styles.overlay, { [styles.half]: half, [styles.fullSize]: fullSize })}
    >
      <NewContactForm onSubmit={onFormSubmit} onClose={onClose} />
    </Modal>
  );
};

export default NewContactModal;
