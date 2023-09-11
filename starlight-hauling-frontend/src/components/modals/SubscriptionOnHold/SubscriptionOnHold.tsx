import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Modal } from '@root/common';
import { SubscriptionOnHoldForm } from '@root/components/forms';
import { type ISubscriptionOnHoldDetails } from '@root/types';

import { type IFormModal } from '../types';

import styles from './css/styles.scss';

const SubscriptionOnHoldModal: React.FC<
  IFormModal<ISubscriptionOnHoldDetails> & { updateOnly?: boolean }
> = ({ isOpen, onClose, onFormSubmit, updateOnly }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Box width="511px" height="460px">
        <SubscriptionOnHoldForm
          onSubmit={onFormSubmit}
          onClose={onClose}
          updateOnly={!!updateOnly}
        />
      </Layouts.Box>
    </Modal>
  );
};

export default SubscriptionOnHoldModal;
