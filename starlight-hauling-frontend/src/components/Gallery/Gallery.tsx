import React, { useCallback, useRef } from 'react';
import { FileError, FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import { FilesGallery } from '@root/common/FilePreview';
import { IFilesGalleryHandle } from '@root/common/FilePreview/FilesGallery/types';
import { TableInfiniteScroll } from '@root/common/TableTools';
import { MAX_DOCUMENT_SIZE, MAX_IMAGE_SIZE, MAX_MEDIA_SIZE } from '@root/consts';
import {
  attachmentMimeTypes,
  isArchiveFile,
  isDocumentFile,
  isImageFile,
  isMediaFile,
  NotificationHelper,
} from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useToggle } from '@hooks';

import DeleteMediaFileModal from './components/DeleteMediaFileModal/DeleteMediaFileModal';
import FilePreviewTile from './components/FilePreviewTile/FilePreviewTile';
import FileUpload from './components/FileUpload/FileUpload';
import { IGallery } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'components.Gallery.Gallery.Text.';

const Gallery: React.FC<IGallery> = ({
  files,
  loaded,
  loading,
  loadMore,
  onAddFiles,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [isConfirmDeleteOpen, toggleConfirmDeleteModal] = useToggle(false);
  const galleryHandleRef = useRef<IFilesGalleryHandle>(null);
  const mediaFileId = useRef<string>();

  const handleFileRejection = useCallback((rejections: FileRejection[]) => {
    rejections.forEach(rejection => {
      const error = rejection.errors[0];

      if (error.code === 'file-too-large') {
        NotificationHelper.error('attachments', ActionCode.FILE_TOO_LARGE, error.message);
      } else if (error.code === 'file-invalid-type') {
        NotificationHelper.error('attachments', ActionCode.INVALID_MIME_TYPE);
      } else {
        NotificationHelper.error('attachments', ActionCode.UNKNOWN);
      }
    });
  }, []);

  const handleValidate = useCallback((file: File): FileError | null => {
    const error = { message: '', code: 'file-too-large' };

    if (file.size > MAX_IMAGE_SIZE && isImageFile(file)) {
      error.message = '20 Mb';
    } else if (file.size > MAX_DOCUMENT_SIZE && isDocumentFile(file)) {
      error.message = '50 Mb';
    } else if (file.size > MAX_MEDIA_SIZE && (isArchiveFile(file) || isMediaFile(file))) {
      error.message = '1 Gb';
    }

    return error.message ? error : null;
  }, []);

  const onOpen = useCallback((index: number): void => {
    galleryHandleRef.current?.handleOpen(index);
  }, []);

  const handleDelete = useCallback(
    (id: string): void => {
      mediaFileId.current = id;
      toggleConfirmDeleteModal();
    },
    [toggleConfirmDeleteModal],
  );

  const handleRemove = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (galleryHandleRef.current && galleryHandleRef.current.activeIndex !== null) {
      const { id } = files[galleryHandleRef.current.activeIndex];

      galleryHandleRef.current.handleClose();
      handleDelete(id);
    }
  }, [files, handleDelete]);

  const handleConfirmDeleteCancel = useCallback(() => {
    mediaFileId.current = undefined;
    toggleConfirmDeleteModal();
  }, [toggleConfirmDeleteModal]);

  const handleConfirmDeleteSubmit = useCallback(() => {
    if (mediaFileId.current !== undefined) {
      onDelete(mediaFileId.current);
      mediaFileId.current = undefined;
      toggleConfirmDeleteModal();
    }
  }, [toggleConfirmDeleteModal, onDelete]);

  return (
    <>
      <div className={styles.container}>
        <DeleteMediaFileModal
          isOpen={isConfirmDeleteOpen}
          onCancel={handleConfirmDeleteCancel}
          onSubmit={handleConfirmDeleteSubmit}
        />
        <FileUpload
          acceptMimeTypes={attachmentMimeTypes}
          onDropAccepted={onAddFiles}
          onDropRejected={handleFileRejection}
          validator={handleValidate}
        />
        {files.map((file, index) => (
          <FilePreviewTile
            key={file.id}
            file={file}
            index={index}
            onDelete={handleDelete}
            onOpen={onOpen}
          />
        ))}
        <FilesGallery media={files} ref={galleryHandleRef} onRemove={handleRemove} />
      </div>
      <TableInfiniteScroll onLoaderReached={loadMore} loaded={loaded} loading={loading}>
        {t(`${I18N_PATH}LoadFiles`)}
      </TableInfiniteScroll>
    </>
  );
};

export default Gallery;
