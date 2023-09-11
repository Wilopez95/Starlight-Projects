import React from 'react';
import { Modal } from '@starlightpro/shared-components';

import { IUnpublishRouteForm, UnpublishRouteForm } from '@root/widgets/forms';

import styles from './css/styles.scss';

export const UnpublishRouteModal: React.FC<IUnpublishRouteForm> = ({
  isOpen,
  unpublishInfo,
  onClose,
  onUnpublish,
}) => (
  <Modal className={styles.modal} isOpen={isOpen} overlayClassName={styles.overlay}>
    <UnpublishRouteForm unpublishInfo={unpublishInfo} onClose={onClose} onUnpublish={onUnpublish} />
  </Modal>
);
