import React, { useCallback } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';

import { NotificationHelper } from '@root/helpers';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { InvoiceService } from '../../api/invoice';

export const InvoiceQuickViewActions: React.FC<{ id: number; pdfUrl: string | null }> = ({
  id,
  pdfUrl,
}) => {
  const handleDownloadMediaFiles = useCallback(async () => {
    if (id) {
      try {
        await InvoiceService.downloadInvoiceMediaFiles(id);
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('default', typedError.response.code as ActionCode);
      }
    }
  }, [id]);

  return (
    <Layouts.Flex justifyContent="flex-end">
      <Layouts.Margin left="2">
        <Button onClick={handleDownloadMediaFiles}>Download Media Files</Button>
      </Layouts.Margin>
      {pdfUrl ? (
        <>
          <Layouts.Margin left="2">
            <a download href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <Button>Download</Button>
            </a>
          </Layouts.Margin>
          <Layouts.Margin left="2">
            <a href={`mailto:%20?body=${pdfUrl}`}>
              <Button variant="primary">Send to Email</Button>
            </a>
          </Layouts.Margin>
        </>
      ) : null}
    </Layouts.Flex>
  );
};
