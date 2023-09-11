import React from 'react';
import { DeleteIcon, PdfPlaceholderIcon } from '@starlightpro/shared-components';

import { hasPdfExtension } from '@root/helpers';

import { IFilePreviewIcon } from './types';

import styles from './css/styles.scss';

export const FilePreviewIcon: React.FC<IFilePreviewIcon> = ({
  src,
  category,
  fileName,
  onClick,
  onRemoveClick,
  isPdf = false,
  size = 'large',
}) => {
  const deleteIcon = onRemoveClick ? (
    <DeleteIcon className={styles.deleteIcon} onClick={onRemoveClick} />
  ) : null;

  if (isPdf || hasPdfExtension(src)) {
    return (
      <div tabIndex={-1} className={`${styles.container} ${styles.preview} ${styles[size]}`}>
        {deleteIcon}
        <PdfPlaceholderIcon className={styles.pdfPlaceholder} onClick={onClick} />
      </div>
    );
  } else {
    return (
      <div className={`${styles.container} ${styles[size]}`}>
        {deleteIcon}
        <img
          alt={`${category} ${fileName} preview`}
          src={src}
          className={styles.preview}
          onClick={onClick}
        />
      </div>
    );
  }
};
