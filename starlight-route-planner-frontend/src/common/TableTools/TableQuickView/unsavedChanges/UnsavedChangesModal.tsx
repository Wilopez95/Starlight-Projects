import React from 'react';
import { Button, Modal, Typography } from '@starlightpro/shared-components';
import cx from 'classnames';

import { Divider } from '../../TableDivider/index';

import { IUnsavedChangesModal } from './type';

import styles from './css/styles.scss';

export const UnsavedChangesModal: React.FC<IUnsavedChangesModal> = ({
  text,
  isOpen,
  onCancel,
  onSubmit,
  overlayClassName,
  className,
}) => (
  <Modal
    isOpen={isOpen}
    className={cx(className, styles.modal)}
    overlayClassName={cx(overlayClassName, styles.overlay)}
  >
    <Typography className={styles.title}>{text ?? 'You have unsaved changes'}</Typography>
    <Divider />
    <div className={styles.buttonContainer}>
      <Button onClick={onCancel}>Don&apos;t Save</Button>
      <Button onClick={onSubmit} variant="primary">
        Save Changes
      </Button>
    </div>
  </Modal>
);
