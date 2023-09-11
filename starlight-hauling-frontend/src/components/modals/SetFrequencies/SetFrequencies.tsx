import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Modal } from '@root/common';
import { SetFrequenciesForm } from '@root/components/forms';
import { type IFrequency } from '@root/types/';

import { type ISetFrequencyModal } from './types';

import styles from './css/styles.scss';

const SetFrequenciesModal: React.FC<ISetFrequencyModal<IFrequency[]>> = ({
  billingCycles,
  frequencies,
  isOpen,
  onClose,
  onFormSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Box width="350px" height="630px">
        <SetFrequenciesForm
          billingCycles={billingCycles}
          frequencies={frequencies}
          onSubmit={onFormSubmit}
          onClose={onClose}
        />
      </Layouts.Box>
    </Modal>
  );
};

export default SetFrequenciesModal;
