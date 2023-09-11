import React, { useCallback, useRef } from 'react';
import { type FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { FieldArray, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FilePreviewGallery, Typography } from '@root/common';
import { acceptableMimeTypes, NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useUserContext } from '@root/hooks';

import { INewOrders } from '../../../../types';

const MediaFiles: React.FC<{ author?: string; timestamp?: Date }> = ({ author, timestamp }) => {
  const { values, setFieldValue } = useFormikContext<INewOrders>();
  const { currentUser } = useUserContext();

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
      setFieldValue(
        'mediaUrls',
        values.mediaUrls?.filter((_, index) => index !== mediaFileIndex),
      );
    },
    [setFieldValue, values.mediaUrls],
  );

  return (
    <>
      <Layouts.Margin top="0.5">
        <Typography color="secondary" shade="desaturated" variant="bodyMedium">
          {t('Text.MediaFiles')}
        </Typography>
      </Layouts.Margin>
      <FieldArray name="mediaUrls">
        {({ insert }) => (
          // TODO: Insert is used instead of push because push is broken for File
          <FilePreviewGallery
            modifiable
            data={
              values.mediaUrls?.map((mediaFile, index) => {
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
                      src: mediaFile,
                      timestamp,
                      author,
                      fileName: `Media #${index + 1} from Order #${values.orderRequestId ?? ''}`,
                      category: 'Media file',
                      isPdf: mediaFile.endsWith('.pdf'),
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

export default observer(MediaFiles);
