import { ISubscriptionHistoryRecord } from '@root/types';

const I18N_PATH = 'pages.CustomerSubscriptionHistory.Text.DescriptionOrReasonByEntity.';

export const getDescriptionOrReasonKey = (
  subscriptionHistoryRecord: ISubscriptionHistoryRecord,
) => {
  const entityPath = `${I18N_PATH}${subscriptionHistoryRecord.entity}.`;

  if (subscriptionHistoryRecord.attribute) {
    return `${entityPath}AttributeActions.${subscriptionHistoryRecord.attribute}.${subscriptionHistoryRecord.action}`;
  }

  return `${entityPath}EntityActions.${
    subscriptionHistoryRecord.entityAction ?? subscriptionHistoryRecord.action
  }`;
};
