import React, { memo } from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '../../../Typography/Typography';

import styles from '../css/styles.scss';
import { IModalActionButtonProps } from './types';

export const ModalActionButton: React.FC<IModalActionButtonProps> = memo(
  ({ children, disable, url, icon, rel, download, target, onClick }) => (
    <a
      onClick={onClick}
      rel={rel}
      target={target}
      download={download}
      className={disable ? `${styles.modalAction} ${styles.disabled}` : styles.modalAction}
      href={disable ? undefined : url}
    >
      <Layouts.IconLayout remove>{icon}</Layouts.IconLayout>

      <Typography
        variant="bodyMedium"
        cursor={disable ? undefined : 'pointer'}
        color={disable ? 'default' : 'information'}
        as="span"
      >
        {children}
      </Typography>
    </a>
  ),
);
