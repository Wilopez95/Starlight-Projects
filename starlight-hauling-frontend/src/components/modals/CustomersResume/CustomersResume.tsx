import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Modal } from '@root/common';
import { CustomersResumeForm } from '@root/components/forms';
import { type ICustomersResume } from '@root/types';

import { type IFormModal } from '../types';

import styles from './css/styles.scss';

const CustomersResume: React.FC<IFormModal<ICustomersResume>> = ({
  isOpen,
  onClose,
  onFormSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Box width="460px" height="auto">
        <CustomersResumeForm onSubmit={onFormSubmit} onClose={onClose} />
      </Layouts.Box>
    </Modal>
  );
};

export default CustomersResume;
