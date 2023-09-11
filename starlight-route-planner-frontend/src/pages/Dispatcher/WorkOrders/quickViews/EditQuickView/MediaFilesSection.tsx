import React from 'react';
import { useTranslation } from 'react-i18next';
import { acceptableMimeTypes, Layouts, Typography } from '@starlightpro/shared-components';
import { FieldArray } from 'formik';

import { FilePreviewGallery } from '@root/common';
import { useMedia } from '@root/hooks/useMedia';
import { ConfirmModal } from '@root/widgets/modals';

const mimeTypes = [...acceptableMimeTypes, 'image/jfif'];

const I18N_PATH_ROOT = 'Text.';
const I18N_PATH = 'quickViews.WorkOrderEdit.Text.';

export const MediaFilesSection: React.FC = () => {
  const { t } = useTranslation();

  const {
    filesPreviewMediaData,
    isConfirmDeleteOpen,
    handleFileRejection,
    handleConfirmDeleteCancel,
    handleRemoveMedia,
    handleConfirmDeleteSubmit,
  } = useMedia();

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        cancelButton={t(`${I18N_PATH_ROOT}Cancel`)}
        submitButton={t(`${I18N_PATH}DeleteMediaFile`)}
        title={t(`${I18N_PATH}DeleteMediaFile`)}
        subTitle={t(`${I18N_PATH}AreYouSure`)}
        onCancel={handleConfirmDeleteCancel}
        onSubmit={handleConfirmDeleteSubmit}
      />
      <Layouts.Margin top="2">
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {t(`${I18N_PATH_ROOT}MediaFiles`)}
        </Typography>
        <FieldArray name="media">
          {({ insert }) => (
            <FilePreviewGallery
              modifiable
              data={filesPreviewMediaData}
              acceptMimeTypes={mimeTypes}
              onFileAdded={insert}
              onFileRejected={handleFileRejection}
              onRemove={handleRemoveMedia}
            />
          )}
        </FieldArray>
      </Layouts.Margin>
    </>
  );
};
