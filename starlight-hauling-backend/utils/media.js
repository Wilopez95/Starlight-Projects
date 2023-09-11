export const aggregateForInvoicing = (subscriptionsMedia = []) =>
  subscriptionsMedia?.map(obj => {
    const {
      subscriptionId,
      mediaFiles = [],
      subOrderMediaFiles = [],
      subWorkOrderMediaFiles = [],
    } = obj;

    return {
      subscriptionId,
      mediaFiles: [...mediaFiles, ...subOrderMediaFiles, ...subWorkOrderMediaFiles],
    };
  });
