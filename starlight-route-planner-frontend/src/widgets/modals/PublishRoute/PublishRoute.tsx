import React from 'react';
import { Modal } from '@starlightpro/shared-components';

import { IPublishRouteForm, PublishRouteForm } from '@root/widgets/forms';

import styles from './css/styles.scss';

export const PublishRouteModal: React.FC<IPublishRouteForm> = ({ isOpen, onClose, onPublish }) => (
  <Modal className={styles.modal} isOpen={isOpen} overlayClassName={styles.overlay}>
    <PublishRouteForm onClose={onClose} onPublish={onPublish} />
  </Modal>
);
