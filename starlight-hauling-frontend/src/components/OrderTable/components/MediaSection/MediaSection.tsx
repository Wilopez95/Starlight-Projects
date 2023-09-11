import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { type SeverityLevel } from '@sentry/react';
import { observer } from 'mobx-react-lite';

import { FilesGallery, Typography } from '@root/common';
import { IFilesGalleryHandle } from '@root/common/FilePreview/FilesGallery/types';
import { MediaSectionTicketIcon } from '@root/components/OrderTable/components/MediaSection/MediaSectionTicketIcon';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useStores } from '@root/hooks';

import { ApiError } from '@root/api/base/ApiError';
import { IMediaSection, MediaType } from './types';

const MediaSection: React.FC<IMediaSection> = ({ order, mediaType = MediaType.All }) => {
  const { orderStore } = useStores();
  const galleryRef = useRef<IFilesGalleryHandle>(null);
  const { t } = useTranslation();
  const isTicketType = mediaType === MediaType.Ticket;

  const handleOpen = useCallback(async () => {
    if (order.workOrderMediaFiles.length || isTicketType) {
      galleryRef.current?.handleOpen();

      return;
    }
    try {
      if (order.mediaFilesCount) {
        await orderStore.requestMediaFiles(order);
        galleryRef.current?.handleOpen();
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'Component',
        data: { mediaFiles: order.workOrderMediaFiles },
        message: `Order mediaFiles request ${JSON.stringify(typedError?.message)}`,
        level: 'warning' as SeverityLevel,
      });
      Sentry.captureEvent(typedError);
    }
  }, [isTicketType, order, orderStore]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        handleOpen();
      }
    },
    [handleOpen],
  );

  const mediaFiles = isTicketType ? order.workOrderTicket : order.mediaFiles;

  return (
    <>
      <MediaSectionTicketIcon
        role="button"
        aria-label={t('Text.MediaFiles')}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={handleOpen}
        data-skip-event
      />
      {isTicketType ? (
        <Typography
          role="button"
          aria-label={t('Text.WeightTicketNumber')}
          color="success"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={handleOpen}
          data-skip-event
        >
          {order?.ticketNumber}
        </Typography>
      ) : null}
      <FilesGallery media={mediaFiles} ref={galleryRef} />
    </>
  );
};

export default observer(MediaSection);
