import React from 'react';

import { Modal } from '@root/common';
import { CustomerCommentRequest } from '@root/types';

import { CustomerCommentForm } from '../../forms';
import { IFormModal } from '../types';

import styles from './css/styles.scss';

const CommentModal: React.FC<IFormModal<CustomerCommentRequest>> = ({
  isOpen,
  onClose,
  onFormSubmit,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
    <CustomerCommentForm onSubmit={onFormSubmit} onClose={onClose} />
  </Modal>
);

export default CommentModal;
