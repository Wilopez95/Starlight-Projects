import { useCallback, useMemo, useRef } from 'react';
import { DropEvent, FileRejection } from 'react-dropzone';
import { useToggle } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { ErrorCodes, MessageKeys } from '@root/consts';
import { NotificationHelper } from '@root/helpers';
import { FileWithPreview, IMedia } from '@root/types';

import { useUserContext } from './useUserContext';

export type FormMediaDataType = {
  media?: (IMedia | FileWithPreview)[];
};

export const useMedia = () => {
  const { currentUser } = useUserContext();
  const currentDate = useRef<Date>(new Date());
  const [isConfirmDeleteOpen, toggleConfirmDeleteModal] = useToggle(false);
  const mediaFileId = useRef<number>();
  const { values, setFieldValue } = useFormikContext<FormMediaDataType>();
  const { media = [] } = values;

  const filesPreviewMediaData = useMemo(
    () =>
      media.map(mediaFile =>
        mediaFile instanceof File
          ? {
              src: mediaFile.imagePreview,
              author: currentUser?.name,
              timestamp: currentDate.current,
              isPdf: mediaFile.isPdf,
              fileName: mediaFile.name,
              category: 'Media file',
            }
          : {
              src: mediaFile.url,
              author: mediaFile.author,
              timestamp: mediaFile.timestamp ? new Date(+mediaFile.timestamp) : undefined,
              fileName: mediaFile.fileName ?? 'unknown',
              category: 'Media file',
            },
      ),
    [media, currentDate, currentUser],
  );

  const handleFileError = useCallback((rejection: FileRejection, _: DropEvent) => {
    if (rejection.errors.some(error => error.code === ErrorCodes.ToLarge)) {
      NotificationHelper.error('images', MessageKeys.ToLarge);
    } else if (rejection.errors.some(error => error.code === ErrorCodes.InvalidType)) {
      NotificationHelper.error('images', MessageKeys.InvalidType);
    } else {
      NotificationHelper.error('images', MessageKeys.Unknown);
    }
  }, []);

  const handleConfirmDeleteCancel = useCallback(() => {
    mediaFileId.current = undefined;
    toggleConfirmDeleteModal();
  }, [toggleConfirmDeleteModal]);

  const handleRemoveMedia = useCallback(
    (mediaFileIndex: number) => {
      const mediaFile = media[mediaFileIndex];

      if (mediaFile instanceof File) {
        setFieldValue(
          'media',
          media.filter((_, index) => index !== mediaFileIndex),
        );
      } else {
        mediaFileId.current = mediaFile.id;
        toggleConfirmDeleteModal();
      }
    },
    [media, setFieldValue, toggleConfirmDeleteModal],
  );

  const handleDeleteMediaFile = useCallback(() => {
    setFieldValue(
      'media',
      media.filter(mediaFile => mediaFile instanceof File || mediaFile.id !== mediaFileId.current),
    );

    mediaFileId.current = undefined;
  }, [media, setFieldValue]);

  const handleConfirmDeleteSubmit = useCallback(() => {
    toggleConfirmDeleteModal();

    handleDeleteMediaFile();
  }, [toggleConfirmDeleteModal, handleDeleteMediaFile]);

  const handleFileRejection = useCallback(
    (rejection: FileRejection | FileRejection[], event: DropEvent) => {
      if (Array.isArray(rejection)) {
        handleFileError(rejection[0], event);
      } else {
        handleFileError(rejection, event);
      }
    },
    [handleFileError],
  );

  return {
    filesPreviewMediaData,
    isConfirmDeleteOpen,
    handleFileRejection,
    handleConfirmDeleteCancel,
    handleRemoveMedia,
    handleConfirmDeleteSubmit,
  };
};
