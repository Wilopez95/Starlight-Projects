import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { type FileRejection } from 'react-dropzone';
import { FileUpload, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { FilePreviewWithModal, Typography } from '@root/common';
import { acceptableMimeTypes, isImageFile, isPdfFile, NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useUserContext } from '@root/hooks';
import { IConfigurableOrder } from '@root/types';

const TicketPreview = () => {
  const { values, setFieldValue, setFieldError } = useFormikContext<IConfigurableOrder>();
  const objectUrl = useRef<string | null>(null);
  const currentDate = useRef<Date>(new Date());
  const [isFileInvalid, setIsFileInvalid] = useState(false);
  const { currentUser } = useUserContext();

  const handleFileInput = useCallback(
    ([file]: File[]) => {
      if (objectUrl.current) {
        URL.revokeObjectURL(objectUrl.current);
        objectUrl.current = null;
      }

      if (isPdfFile(file)) {
        Object.assign(file, { isPdf: true });
      } else if (isImageFile(file)) {
        const imagePreview = URL.createObjectURL(file);

        objectUrl.current = imagePreview;
        Object.assign(file, { imagePreview });
      }

      setFieldValue('ticketFile', file);
      setFieldError('ticketFile', undefined);
      setIsFileInvalid(false);
    },
    [setFieldValue, setFieldError],
  );

  const handleFileError = useCallback((rejections: FileRejection[]) => {
    setIsFileInvalid(true);
    if (
      rejections.some(rejection => rejection.errors.some(error => error.code === 'file-too-large'))
    ) {
      NotificationHelper.error('images', ActionCode.FILE_TOO_LARGE);
    } else if (
      rejections.some(rejection =>
        rejection.errors.some(error => error.code === 'file-invalid-type'),
      )
    ) {
      NotificationHelper.error('images', ActionCode.INVALID_MIME_TYPE);
    }
  }, []);

  useEffect(() => {
    const imageUrl = objectUrl;

    return () => {
      if (imageUrl.current) {
        URL.revokeObjectURL(imageUrl.current);
      }
    };
  }, []);

  const handleRemoveUploadedFile = useCallback(() => {
    setFieldValue('ticketFile', undefined);
    setFieldError('ticketFile', undefined);
    setFieldValue('workOrder.ticketUrl', undefined);
    setFieldError('workOrder.ticketUrl', undefined);
  }, [setFieldValue, setFieldError]);

  let previewOrUploadWidget: ReactElement;

  if (values.workOrder?.ticketUrl) {
    previewOrUploadWidget = (
      <FilePreviewWithModal
        src={values.workOrder.ticketUrl}
        fileName={`Ticket from Order# ${values.id}`}
        category="Ticket"
        author={values.workOrder.ticketAuthor}
        timestamp={values.workOrder.ticketDate ?? undefined}
        size="small"
        onRemoveClick={handleRemoveUploadedFile}
      />
    );
  } else if (values.ticketFile) {
    previewOrUploadWidget = (
      <FilePreviewWithModal
        src={values.ticketFile.imagePreview}
        isPdf={isPdfFile(values.ticketFile)}
        fileName={`Ticket from Order# ${values.id}`}
        category="Ticket"
        author={currentUser?.name}
        timestamp={currentDate.current}
        size="small"
        onRemoveClick={handleRemoveUploadedFile}
      />
    );
  } else {
    previewOrUploadWidget = (
      <FileUpload
        size="small"
        acceptMimeTypes={acceptableMimeTypes}
        onDropAccepted={handleFileInput}
        onDropRejected={handleFileError}
        error={isFileInvalid}
      />
    );
  }

  return (
    <div>
      <Layouts.Margin top="0.5" bottom="0.5">
        <Typography color="secondary" as="label" shade="desaturated">
          Ticket
        </Typography>
      </Layouts.Margin>
      <Layouts.Margin top="1">{previewOrUploadWidget}</Layouts.Margin>
    </div>
  );
};

export default TicketPreview;
