import React from 'react';
import { Button, Modal, Typography } from '@starlightpro/shared-components';
import cx from 'classnames';

import { Divider } from '@root/core/common/TableTools';

import { IConfirmModal } from './types';

import styles from './css/styles.scss';

const ConfirmModal: React.FC<IConfirmModal> = ({
  isOpen,
  cancelButton,
  subTitle,
  submitButton,
  title,
  overlayClassName,
  className,
  nonDestructive,
  onCancel,
  onSubmit,
}) => (
  <Modal
    isOpen={isOpen}
    className={cx(className, styles.modal)}
    overlayClassName={cx(overlayClassName, styles.overlay)}
    onClose={onCancel}
  >
    <div className={styles.information}>
      <Typography
        color={nonDestructive ? 'default' : 'alert'}
        variant='headerTwo'
        className={styles.title}
      >
        {title}
      </Typography>
      <Typography variant='bodyMedium'>{subTitle}</Typography>
    </div>
    <Divider />
    <div className={styles.buttonContainer}>
      <Button onClick={onCancel}>{cancelButton}</Button>
      <Button onClick={onSubmit} variant={nonDestructive ? 'primary' : 'alert'}>
        {submitButton}
      </Button>
    </div>
  </Modal>
);

export default ConfirmModal;
