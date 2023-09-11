import React from 'react';
import { Button, Modal, Typography } from '@starlightpro/shared-components';
import cx from 'classnames';

import { Divider } from '@root/common/TableTools';

import { IPromptModal } from './type';

import styles from './css/styles.scss';

export const PromptModal: React.FC<IPromptModal> = ({
  isOpen,
  subTitle,
  submitButton,
  title,
  overlayClassName,
  className,
  onSubmit,
}) => (
  <Modal
    isOpen={isOpen}
    className={cx(className, styles.modal)}
    overlayClassName={cx(overlayClassName, styles.overlay)}
    onClose={onSubmit}
  >
    <div className={styles.information}>
      <Typography color="default" variant="headerTwo" className={styles.title}>
        {title}
      </Typography>
      <Typography variant="bodyMedium">{subTitle}</Typography>
    </div>
    <Divider />
    <div className={styles.buttonContainer}>
      <Button onClick={onSubmit} variant="primary">
        {submitButton}
      </Button>
    </div>
  </Modal>
);
