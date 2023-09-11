import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DeleteIcon, PdfPlaceholderIcon } from '@root/assets';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';

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
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onRemoveClick?.();
      }
    },
    [onRemoveClick],
  );

  const deleteIcon = onRemoveClick ? (
    <DeleteIcon
      role="button"
      aria-label={t('Text.Delete')}
      tabIndex={0}
      className={styles.deleteIcon}
      onClick={onRemoveClick}
      onKeyDown={handleKeyDown}
    />
  ) : null;
  const hasPdfExtension = src?.endsWith('.pdf');

  if (isPdf || hasPdfExtension) {
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
          loading="lazy"
        />
      </div>
    );
  }
};
