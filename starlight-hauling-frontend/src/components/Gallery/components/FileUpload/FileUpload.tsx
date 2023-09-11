import React from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import { PlusIcon } from '@root/assets';
import { Typography } from '@root/common';

import { IFileUpload } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'components.Gallery.components.FileUpload.FileUpload.Text.';

const FileUpload: React.FC<IFileUpload> = ({
  acceptMimeTypes: accept,
  validator,
  onDropAccepted,
  onDropRejected,
}) => {
  const { t } = useTranslation();
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept,
    validator,
  });

  return (
    <div
      {...getRootProps({
        className: styles.fileUpload,
      })}
    >
      <input {...getInputProps()} />
      <PlusIcon className={styles.icon} />
      <Typography color="primary" className={styles.addFiles}>
        {t(`${I18N_PATH}AddFiles`)}
      </Typography>
    </div>
  );
};

export default FileUpload;
