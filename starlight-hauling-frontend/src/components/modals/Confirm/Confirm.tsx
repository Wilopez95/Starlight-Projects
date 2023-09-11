import React from 'react';
import { Button } from '@starlightpro/shared-components';
import cx from 'classnames';

import { Modal } from '@root/common/Modal/Modal';
import { Divider } from '@root/common/TableTools/TableDivider';
import { Typography } from '@root/common/Typography/Typography';

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
  onClose,
  onSubmit,
  content,
}) => (
  <Modal
    isOpen={isOpen}
    className={cx(className, styles.modal)}
    overlayClassName={cx(overlayClassName, styles.overlay)}
    onClose={onClose ? onClose : onCancel}
  >
    <div className={styles.information}>
      <Typography
        color={nonDestructive ? 'default' : 'alert'}
        variant="headerTwo"
        className={styles.title}
      >
        {title}
      </Typography>
      <Typography variant="bodyMedium">{subTitle}</Typography>
      {content ? <div>{content}</div> : null}
    </div>
    <Divider />
    <div className={styles.buttonContainer}>
      <Button onClick={onCancel}>{cancelButton}</Button>
      {submitButton ? (
        <Button onClick={onSubmit} variant={nonDestructive ? 'primary' : 'alert'}>
          {submitButton}
        </Button>
      ) : null}
    </div>
  </Modal>
);

export default ConfirmModal;
