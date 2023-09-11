import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@starlightpro/shared-components';
import cx from 'classnames';

import { MetaSection } from '../FilePreviewMetaSection/FilePreviewMetaSection';
import { PdfViewer } from '../PdfViewer/PdfViewer';

import { IFilePreviewModal } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'common.FilePreview.FilePreviewModal.Text.Preview';

export const FilePreviewModal: React.FC<IFilePreviewModal> = ({
  src,
  category,
  isPdf,
  isOpen,
  scrollable,
  onClose,
  showSendEmail,
  ...props
}) => {
  const { t } = useTranslation();

  // file added by user cannot be sent via email, until it'll be uploaded
  const pendingFiles = src?.startsWith('blob:');

  return (
    <Modal className={styles.modal} isOpen={isOpen} onClose={onClose}>
      {props.withMeta && (
        <MetaSection
          fileName={props.fileName}
          author={props.author}
          src={src}
          timestamp={props.timestamp}
          downloadSrc={props.downloadSrc}
          hideAuthor={props.hideAuthor}
          disableSendEmail={pendingFiles}
          showSendEmail={showSendEmail}
        />
      )}
      <div className={cx({ [styles.scrollContainer]: scrollable })}>
        {isPdf || src?.endsWith('.pdf') ? (
          <div className={styles.modalPreview} role='img' aria-label={category}>
            <PdfViewer url={src} />
          </div>
        ) : (
          <img
            className={styles.modalPreview}
            alt={
              props.withMeta
                ? t(I18N_PATH, { string: `${category} ${props.fileName}` })
                : t(I18N_PATH, { string: category })
            }
            src={src}
          />
        )}
      </div>
    </Modal>
  );
};
