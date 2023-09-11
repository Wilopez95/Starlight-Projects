import React from 'react';
import { Modal, PdfPlaceholderIcon } from '@starlightpro/shared-components';
import cx from 'classnames';

import { hasPdfExtension } from '@root/helpers';

import { MetaSection } from '../FilePreviewMetaSection/FilePreviewMetaSection';

import { IFilePreviewModal } from './types';

import styles from './css/styles.scss';

export const FilePreviewModal: React.FC<IFilePreviewModal> = ({
  src,
  category,
  isPdf,
  isOpen,
  onClose,
  scrollable,
  ...props
}) => (
  <Modal className={styles.modal} isOpen={isOpen} onClose={onClose}>
    {props.withMeta && (
      <MetaSection
        fileName={props.fileName}
        author={props.author}
        src={src}
        timestamp={props.timestamp}
        downloadSrc={props.downloadSrc}
        hideAuthor={props.hideAuthor}
      />
    )}
    <div className={cx({ [styles.scrollContainer]: scrollable })}>
      {isPdf || hasPdfExtension(src) ? (
        <div className={styles.modalPreview} role="img" aria-label={category}>
          <PdfPlaceholderIcon className={styles.pdfPlaceholder} />
        </div>
      ) : (
        <img
          className={styles.modalPreview}
          alt={props.withMeta ? `${category} ${props.fileName} preview` : `${category} preview`}
          src={src}
        />
      )}
    </div>
  </Modal>
);
