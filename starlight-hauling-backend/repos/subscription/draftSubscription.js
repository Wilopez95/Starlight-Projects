import isEmpty from 'lodash/isEmpty.js';

import SubscriptionServiceItemRepo from '../subscriptionServiceItem/subscriptionServiceItem.js';
import VersionedRepository from '../_versioned.js';

import { subscriptionServiceName } from '../../services/subscriptions/utils/subscriptionServiceName.js';
import { aggregateSubscriptionServiceFrequency } from '../../services/subscriptions/utils/aggregateSubscriptionServiceFrequency.js';

import { billingPeriodHelper } from '../../utils/billingPeriod.js';

import {
  TABLE_NAME,
  draftSubscriptionDetailsFields as detailsFields,
} from '../../consts/subscriptions.js';
import { SUBSCRIPTION_STATUS } from '../../consts/subscriptionStatuses.js';
import { getByIdDraftSubsrciptionPopulateDataQuery } from './queries/getByIdDraftSubsrciptionPopulateDataQuery.js';
import SubscriptionsRepository from './subscription.js';

class DraftSubscriptionsRepository extends SubscriptionsRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.versionedRepo = VersionedRepository.getInstance(ctxState, {
      schemaName,
      tableName: TABLE_NAME,
    });
  }

  getAllByIds(ids, trx = this.knex) {
    return super.getAllByIds(
      {
        ids,
        fields: ['id', 'csrEmail', 'customerId'],
        statuses: [SUBSCRIPTION_STATUS.draft],
      },
      trx,
    );
  }

  getNextBillingPeriod(params) {
    const { billingCycle } = params;

    return billingCycle ? billingPeriodHelper[billingCycle](params) : null;
  }

  async getByIdPopulated(
    { id, fields = detailsFields, populateServiceItems = true } = {},
    trx = this.knex,
  ) {
    const query = getByIdDraftSubsrciptionPopulateDataQuery(
      fields,
      this.tableName,
      this.schemaName,
      trx,
    ).where(`${this.tableName}.id`, id);

    const item = await query.first();

    if (isEmpty(item)) {
      return null;
    }

    const mapFields = this.mapFields.bind(this);
    const subscriptionDraft = mapFields(item);

    if (populateServiceItems) {
      subscriptionDraft.serviceItems = await SubscriptionServiceItemRepo.getInstance(
        this.ctxState,
      ).getBySubscriptionDraftId(id, trx);

      if (!isEmpty(subscriptionDraft.serviceItems)) {
        subscriptionDraft.serviceName = subscriptionServiceName(subscriptionDraft.serviceItems);
        subscriptionDraft.serviceFrequencyAggregated = aggregateSubscriptionServiceFrequency(
          subscriptionDraft.serviceItems,
        );
      }
    }

    return subscriptionDraft;
  }
}

export default DraftSubscriptionsRepository;
