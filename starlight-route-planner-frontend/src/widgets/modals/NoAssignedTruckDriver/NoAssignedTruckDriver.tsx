import React from 'react';
import { IModal, Modal } from '@starlightpro/shared-components';

import { INoAssignedDriverTruckNotice } from '@root/types';
import { NoAssignedTruckDriverForm } from '@root/widgets/forms';

import styles from './css/styles.scss';

interface INoAssignedTruckDriverModal extends IModal, INoAssignedDriverTruckNotice {}

export const NoAssignedTruckDriverModal: React.FC<INoAssignedTruckDriverModal> = ({
  isOpen,
  onClose,
  type,
}) => (
  <Modal className={styles.modal} isOpen={isOpen} overlayClassName={styles.overlay}>
    <NoAssignedTruckDriverForm onClose={onClose} type={type} />
  </Modal>
);
