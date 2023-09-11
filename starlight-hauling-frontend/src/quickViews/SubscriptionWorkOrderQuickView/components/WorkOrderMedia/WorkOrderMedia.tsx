import React, { useCallback, useEffect } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { FilesLoader, Gallery } from '@root/components/Gallery';
import { useStores } from '@root/hooks';

const WorkOrderMedia = () => {
  const { subscriptionWorkOrderAttachmentStore, subscriptionWorkOrderStore } = useStores();

  const workOrderId = subscriptionWorkOrderStore.selectedEntity?.id.toString();
  const files = subscriptionWorkOrderAttachmentStore.values;
  const { uploadingFilesCount, loaded, loading } = subscriptionWorkOrderAttachmentStore;

  useEffect(() => {
    return () => subscriptionWorkOrderAttachmentStore.cleanup();
  }, [subscriptionWorkOrderAttachmentStore]);

  const loadMore = useCallback(() => {
    if (workOrderId) {
      subscriptionWorkOrderAttachmentStore.request(workOrderId);
    }
  }, [subscriptionWorkOrderAttachmentStore, workOrderId]);

  const onAddFiles = useCallback(
    (filesToUpload: File[]): void => {
      if (workOrderId) {
        subscriptionWorkOrderAttachmentStore.uploadFiles({
          data: filesToUpload,
          id: workOrderId,
        });
      }
    },
    [subscriptionWorkOrderAttachmentStore, workOrderId],
  );

  const onDelete = useCallback(
    (id: string): void => {
      subscriptionWorkOrderAttachmentStore.deleteFile(id);
    },
    [subscriptionWorkOrderAttachmentStore],
  );

  return (
    <Layouts.Padding>
      <FilesLoader uploadingFilesCount={uploadingFilesCount} />
      <Gallery
        files={files}
        loaded={loaded}
        loading={loading}
        loadMore={loadMore}
        onAddFiles={onAddFiles}
        onDelete={onDelete}
      />
    </Layouts.Padding>
  );
};

export default observer(WorkOrderMedia);
