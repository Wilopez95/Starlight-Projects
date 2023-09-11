import React, { useCallback, useRef } from 'react';
import { type FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { FieldArray, useFormikContext } from 'formik';

import { OrderService } from '@root/api';
import { FilePreviewGallery, Typography } from '@root/common';
import { ConfirmModal } from '@root/components/modals';
import { BusinessLineType } from '@root/consts';
import { acceptableMimeTypes, NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useToggle, useUserContext } from '@root/hooks';
import { type IConfigurableOrder } from '@root/types';
import { ApiError } from '@root/api/base/ApiError';

const I18N_PATH = 'Form.WorkOrderData.MediaFilesSection.Text.';

const MediaFilesSection = () => {
  const { values, setFieldValue } = useFormikContext<IConfigurableOrder>();
  const { currentUser } = useUserContext();
  const mediaFileId = useRef<number>();
  const [isConfirmDeleteOpen, toggleConfirmDeleteModal] = useToggle(false);
  const [isDeleteFromDispatchOpen, toggleDeleteFromDispatchModal, setIsDeleteFromDispatchOpen] =
    useToggle(false);
  const currentDate = useRef<Date>(new Date());
  const { t } = useTranslation();

  const handleFileError = useCallback((rejection: FileRejection) => {
    if (rejection.errors.some(error => error.code === 'file-too-large')) {
      NotificationHelper.error('images', ActionCode.FILE_TOO_LARGE);
    } else if (rejection.errors.some(error => error.code === 'file-invalid-type')) {
      NotificationHelper.error('images', ActionCode.INVALID_MIME_TYPE);
    } else {
      NotificationHelper.error('images', ActionCode.UNKNOWN);
    }
  }, []);

  const handleRemoveMedia = useCallback(
    (mediaFileIndex: number) => {
      const mediaFile = values.workOrder?.mediaFiles[mediaFileIndex];

      if (mediaFile instanceof File) {
        setFieldValue(
          'workOrder.mediaFiles',
          values.workOrder?.mediaFiles.filter((_, index) => index !== mediaFileIndex),
        );
      } else {
        mediaFileId.current = mediaFile?.id;
        toggleConfirmDeleteModal();
      }
    },
    [setFieldValue, toggleConfirmDeleteModal, values.workOrder?.mediaFiles],
  );

  const handleConfirmDeleteCancel = useCallback(() => {
    mediaFileId.current = undefined;
    toggleConfirmDeleteModal();
  }, [toggleConfirmDeleteModal]);

  const handleDeleteMediaFile = useCallback(
    async (deleteFromDispatch = false) => {
      if (mediaFileId.current) {
        try {
          await OrderService.deleteMediaFile(Number(values.workOrder?.woNumber), {
            deleteFromDispatch,
            mediaId: mediaFileId.current,
            isRollOff: values.businessLine.type === BusinessLineType.rollOff,
          });

          setFieldValue(
            'workOrder.mediaFiles',
            values.workOrder?.mediaFiles.filter(
              mediaFile => mediaFile instanceof File || mediaFile.id !== mediaFileId.current,
            ),
          );

          NotificationHelper.success('delete', 'Media file');
        } catch (error: unknown) {
          const typedError = error as ApiError;
          NotificationHelper.error('delete', typedError.response.code as ActionCode, 'Media file');
        }
      }
      mediaFileId.current = undefined;
      setIsDeleteFromDispatchOpen(false);
    },
    [
      setFieldValue,
      setIsDeleteFromDispatchOpen,
      values.workOrder?.mediaFiles,
      values.workOrder?.woNumber,
      values.businessLine.type,
    ],
  );

  const handleConfirmDeleteSubmit = useCallback(() => {
    toggleConfirmDeleteModal();
    if (values.businessLine.type === BusinessLineType.rollOff) {
      toggleDeleteFromDispatchModal();
    } else {
      handleDeleteMediaFile();
    }
  }, [
    toggleConfirmDeleteModal,
    toggleDeleteFromDispatchModal,
    handleDeleteMediaFile,
    values.businessLine.type,
  ]);

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        cancelButton={t('Text.Cancel')}
        submitButton={t(`${I18N_PATH}DeleteMediaFile`)}
        title={t(`${I18N_PATH}DeleteMediaFile`)}
        subTitle={t(`${I18N_PATH}AreYouSure`)}
        onCancel={handleConfirmDeleteCancel}
        onSubmit={handleConfirmDeleteSubmit}
      />
      <ConfirmModal
        isOpen={isDeleteFromDispatchOpen}
        cancelButton={t('Text.NoThanks')}
        submitButton={t(`${I18N_PATH}DeleteFromDispatch`)}
        title={t(`${I18N_PATH}DeleteFromDispatch`)}
        subTitle={t(`${I18N_PATH}DoYouWant`)}
        onCancel={() => handleDeleteMediaFile()}
        onSubmit={() => handleDeleteMediaFile(true)}
      />
      <Layouts.Margin top="0.5">
        <Typography color="secondary" as="label" shade="desaturated">
          {t('Text.MediaFiles')}
        </Typography>
      </Layouts.Margin>
      <FieldArray name="workOrder.mediaFiles">
        {({ insert }) => (
          // TODO: Insert is used instead of push because push is broken for File
          <FilePreviewGallery
            modifiable
            data={
              values.workOrder?.mediaFiles.map(mediaFile => {
                return mediaFile instanceof File
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
                      timestamp: mediaFile.timestamp,
                      fileName: mediaFile.fileName ?? 'unknown',
                      category: 'Media file',
                      isPdf: mediaFile.fileName?.endsWith('.pdf'),
                    };
              }) ?? []
            }
            acceptMimeTypes={acceptableMimeTypes}
            onFileRejected={handleFileError}
            onFileAdded={insert}
            onRemove={handleRemoveMedia}
          />
        )}
      </FieldArray>
    </>
  );
};

export default MediaFilesSection;
