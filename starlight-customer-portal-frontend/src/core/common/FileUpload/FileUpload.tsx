import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import cx from 'classnames';

import { PdfPlaceholderIcon, PlusIcon } from '@root/assets';

import { Loader } from '../Loader';

import { IFileUpload, IFileUploadHandle } from './types';

import styles from './css/styles.scss';

// Approximately, about 8 MB.
export const MAX_FILE_SIZE = 8_000_000;

const FileUpload: React.ForwardRefRenderFunction<IFileUploadHandle, IFileUpload> = (
  {
    acceptMimeTypes: accept,
    allowMultiple: multiple = false,
    loading,
    previewImage,
    isPdf,
    error,
    className,
    placeholder,
    size = 'large',
    onPreviewOpen,
    onDropAccepted,
    onDropRejected,
  },
  ref,
) => {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    maxSize: MAX_FILE_SIZE,
    onDropAccepted,
    onDropRejected,
    accept,
    multiple,
    // If there is a preview, we need to expand it on click rather than pick a new file.
    noClick: loading || isPdf || !!previewImage,
  });

  useImperativeHandle(
    ref,
    () => ({
      open,
    }),
    [open],
  );

  const style = useMemo(() => {
    if (!previewImage) {
      return undefined;
    }

    return {
      backgroundImage: `url(${previewImage})`,
    };
  }, [previewImage]);

  let defaultPlaceholder = null;

  if (loading) {
    defaultPlaceholder = <Loader className={styles.loader} active />;
  } else if (isPdf) {
    defaultPlaceholder = <PdfPlaceholderIcon className={styles.placeholder} />;
  } else if (!previewImage) {
    defaultPlaceholder = <PlusIcon className={styles.placeholder} />;
  }

  return (
    <div
      {...getRootProps({
        onClick: isPdf || previewImage ? onPreviewOpen : undefined,
        className: cx(
          styles.fileUpload,
          className,
          isDragActive && styles.dragActive,
          loading && styles.loading,
          error && styles.error,
          styles[size],
        ),
        style: loading ? undefined : style,
      })}
    >
      <input
        {...getInputProps({
          disabled: loading,
        })}
      />
      {placeholder || defaultPlaceholder}
    </div>
  );
};

export default forwardRef(FileUpload);
