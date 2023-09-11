import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Modal } from '@root/common';
import { ReminderConfigurationForm } from '@root/components/forms';
import { type IConfigurableReminderSchedule } from '@root/types';

import { type IFormModal } from '../types';

import styles from './css/styles.scss';

const ReminderConfigurationModal: React.FC<IFormModal<IConfigurableReminderSchedule | null>> = ({
  isOpen,
  onClose,
  onFormSubmit,
}) => {
  return (
    <Modal className={styles.modal} isOpen={isOpen} onClose={onClose}>
      <Layouts.Box width="560px" height="320px">
        <ReminderConfigurationForm onSubmit={onFormSubmit} onClose={onClose} />
      </Layouts.Box>
    </Modal>
  );
};

export default ReminderConfigurationModal;
