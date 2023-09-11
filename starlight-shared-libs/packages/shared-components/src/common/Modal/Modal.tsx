import React from 'react';
import ReactModal from 'react-modal';
import cx from 'classnames';

import { CrossIcon } from '../../assets';

import { IModal } from './types';

import styles from './css/styles.scss';

export const Modal: React.FC<IModal> = ({
  isOpen,
  onClose,
  className,
  overlayClassName,
  children,
  onOpened,
}) => (
  <ReactModal
    isOpen={isOpen}
    onRequestClose={onClose}
    overlayClassName={cx(overlayClassName, styles.overlay)}
    className={cx(className, styles.modal)}
    onAfterOpen={onOpened}
  >
    {onClose ? (
      <CrossIcon className={styles.closeIcon} onClick={onClose} role="button" aria-label="close" />
    ) : null}
    {children}
  </ReactModal>
);
