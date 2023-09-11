import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { FilesLoader, Gallery } from '@root/components/Gallery';
import { useStores } from '@root/hooks';

import { CustomerNavigation, CustomerStyles } from '../Customer';
import { ICustomerPageParams } from '../Customer/types';

const I18N_PATH = 'pages.CustomerAttachments.CustomerAttachments.Text.';

const CustomerAttachmentsPage: React.FC = () => {
  const { customerAttachmentStore } = useStores();
  const { customerId } = useParams<ICustomerPageParams>();
  const { t } = useTranslation();

  const navigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => customerAttachmentStore.cleanup();
  }, [customerAttachmentStore]);

  const loadMore = useCallback(() => {
    customerAttachmentStore.request(customerId);
  }, [customerAttachmentStore, customerId]);

  const onAddFiles = useCallback(
    (files: File[]): void => {
      customerAttachmentStore.uploadFiles({ data: files, id: customerId });
    },
    [customerAttachmentStore, customerId],
  );

  const onDelete = useCallback(
    (id: string): void => {
      customerAttachmentStore.deleteFile(id);
    },
    [customerAttachmentStore],
  );

  const files = customerAttachmentStore.values;
  const { uploadingFilesCount, loaded, loading } = customerAttachmentStore;

  return (
    <>
      <CustomerNavigation ref={navigationRef} />
      <CustomerStyles.PageContainer>
        <CustomerStyles.TitleContainer>
          <Typography fontWeight="bold" variant="headerTwo">
            {t(`${I18N_PATH}Attachments`)}
          </Typography>
          <FilesLoader uploadingFilesCount={uploadingFilesCount} />
        </CustomerStyles.TitleContainer>
        <CustomerStyles.ScrollContainer>
          <Gallery
            files={files}
            loaded={loaded}
            loading={loading}
            loadMore={loadMore}
            onAddFiles={onAddFiles}
            onDelete={onDelete}
          />
        </CustomerStyles.ScrollContainer>
      </CustomerStyles.PageContainer>
    </>
  );
};

export default observer(CustomerAttachmentsPage);
