import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Modal } from '@root/common';
import { CustomersOnHoldForm } from '@root/components/forms';
import { type ICustomersOnHold } from '@root/types';

import { type IFormModal } from '../types';

import styles from './css/styles.scss';

const CustomersOnHold: React.FC<IFormModal<ICustomersOnHold>> = ({
  isOpen,
  onClose,
  onFormSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Box width="460px" height="auto">
        <CustomersOnHoldForm onSubmit={onFormSubmit} onClose={onClose} />
      </Layouts.Box>
    </Modal>
  );
};

export default CustomersOnHold;
