import React from 'react';
import { Modal } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { NewContactForm } from '@root/customer/forms';
import { IEditProfileModal } from '@root/customer/forms/EditMyContact/types';

import styles from './css/styles.scss';

const EditProfileModal: React.FC<IEditProfileModal> = ({
  isOpen,
  onClose,
  onFormSubmit,
  contact,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <NewContactForm onSubmit={onFormSubmit} onClose={onClose} contact={contact} />
    </Modal>
  );
};

export default observer(EditProfileModal);
