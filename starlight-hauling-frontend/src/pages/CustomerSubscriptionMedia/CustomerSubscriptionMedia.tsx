import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { IUploadFilesRequest } from '@root/api';
import { Typography } from '@root/common';
import { FilesLoader, Gallery } from '@root/components/Gallery';
import {
  CustomerSubscriptionLayout,
  CustomerSubscriptionNavigation,
} from '@root/components/PageLayouts';
import { CustomerSubscriptionParams } from '@root/components/PageLayouts/CustomerSubscriptionLayout/types';
import { SubscriptionTabRoutes } from '@root/consts';
import { useStores, useSubscriptionSelectedTab } from '@root/hooks';

const I18N_PATH = 'pages.CustomerSubscriptionMedia.CustomerSubscriptionMedia.Text.';

const CustomerSubscriptionMedia = () => {
  const { t } = useTranslation();
  const subscriptionNavigationRef = useRef<HTMLDivElement>(null);
  const [{ updateOnly, isOnHoldModalOpen }, setOnHoldModal] = useState<{
    updateOnly: boolean;
    isOnHoldModalOpen: boolean;
  }>({
    updateOnly: false,
    isOnHoldModalOpen: false,
  });
  const selectedTab = useSubscriptionSelectedTab();
  const isDraftTab = selectedTab === SubscriptionTabRoutes.Draft;

  const { subscriptionAttachmentStore } = useStores();
  const { subscriptionId } = useParams<CustomerSubscriptionParams>();

  const files = subscriptionAttachmentStore.values;
  const { uploadingFilesCount, loaded, loading } = subscriptionAttachmentStore;

  useEffect(() => {
    return () => subscriptionAttachmentStore.cleanup();
  }, [subscriptionAttachmentStore]);

  const loadMore = useCallback(() => {
    subscriptionAttachmentStore.request(subscriptionId);
  }, [subscriptionAttachmentStore, subscriptionId]);

  const onAddFiles = useCallback(
    (filesData: File[]): void => {
      const options: IUploadFilesRequest = {
        data: filesData,
        id: subscriptionId,
        ...(isDraftTab && {
          queryParams: { draftId: subscriptionId },
        }),
      };

      subscriptionAttachmentStore.uploadFiles(options);
    },
    [subscriptionAttachmentStore, subscriptionId, isDraftTab],
  );

  const onDelete = useCallback(
    (id: string): void => {
      subscriptionAttachmentStore.deleteFile(id);
    },
    [subscriptionAttachmentStore],
  );

  return (
    <CustomerSubscriptionLayout
      updateOnly={updateOnly}
      isOnHoldModalOpen={isOnHoldModalOpen}
      setOnHoldModal={setOnHoldModal}
    >
      <CustomerSubscriptionNavigation ref={subscriptionNavigationRef} />
      <Layouts.Scroll>
        <Layouts.Padding padding="3">
          <Layouts.Flex justifyContent="space-between" alignItems="center">
            <Typography variant="headerThree">{t(`${I18N_PATH}AttachedMedia`)}</Typography>
            <FilesLoader uploadingFilesCount={uploadingFilesCount} />
          </Layouts.Flex>
        </Layouts.Padding>
        <Gallery
          files={files}
          loaded={loaded}
          loading={loading}
          loadMore={loadMore}
          onAddFiles={onAddFiles}
          onDelete={onDelete}
        />
      </Layouts.Scroll>
    </CustomerSubscriptionLayout>
  );
};

export default observer(CustomerSubscriptionMedia);
