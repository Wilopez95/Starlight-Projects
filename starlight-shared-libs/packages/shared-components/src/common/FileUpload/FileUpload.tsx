import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import cx from 'classnames';

import { PdfPlaceholderIcon, PlusIcon } from '../../assets';
import { Loader } from '../Loader';

import { IFileUpload, IFileUploadHandle } from './types';

import styles from './css/styles.scss';

// Approximately, about 10 MB.
export const MAX_FILE_SIZE = 10_485_760;

export const FileUploadComponent: React.ForwardRefRenderFunction<IFileUploadHandle, IFileUpload> = (
  {
    acceptMimeTypes: accept,
    loading,
    previewImage,
    isPdf,
    error,
    className,
    placeholder,
    onPreviewOpen,
    onDropAccepted,
    onDropRejected,
    size = 'large',
    allowMultiple: multiple = false,
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
      // Add a timestamp to avoid browser caching images with the same name.
      backgroundImage: previewImage.startsWith('blob:')
        ? `url(${previewImage})`
        : `url(${previewImage}?t=${performance.now()})`,
    };
  }, [previewImage]);

  let defaultPlaceholder: any = null;

  if (loading) {
    defaultPlaceholder = <Loader className={styles.loader} active />;
  } else if (isPdf) {
    defaultPlaceholder = <PdfPlaceholderIcon className={styles.placeholder} />;
  } else if (!previewImage) {
    defaultPlaceholder = <PlusIcon className={styles.placeholder} />;
  }

  return (
    <div
      {...(getRootProps({
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
      }) as any)}
    >
      <input
        {...getInputProps({
          disabled: loading,
        })}
        aria-label="upload file"
      />
      {placeholder || defaultPlaceholder}
    </div>
  );
};

export default forwardRef(FileUploadComponent);
