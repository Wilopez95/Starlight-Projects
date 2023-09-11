import * as Sentry from '@sentry/react';
import { format } from 'date-fns';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import type GlobalStore from '@root/stores/GlobalStore';

import { NotificationHelper } from '../../../../helpers';
import { BaseStore } from '../../../../stores/base/BaseStore';
import { JsonConversions } from '../../../../types';
import { CreditCardService } from '../api/creditCard';
import { CreditCardSortType, ICreditCard } from '../types';

import { CreditCard } from './CreditCard';

const prepareToSerialize = (cc: ICreditCard): JsonConversions<ICreditCard> => {
  const item = {
    ...cc,
    expDate: format(cc.expDate as Date, dateFormatsEnUS.ISO),
  };

  return item as unknown as JsonConversions<ICreditCard>;
};

export class CreditCardStore extends BaseStore<CreditCard, CreditCardSortType> {
  private service: CreditCardService = new CreditCardService();
  @observable shouldShowInactive = true;

  constructor(global: GlobalStore) {
    super(global, 'CARD_NICKNAME', 'asc');
  }

  @action
  changeShowInactive(value: boolean) {
    this.shouldShowInactive = value;
  }

  // TODO: re-impl to get from be via query params
  @computed
  get filteredValues() {
    return this.shouldShowInactive ? this.values : this.values.filter(card => card.active);
  }

  @actionAsync
  async request({
    customerId,
    jobSiteId,
    activeOnly,
    isAutopay,
  }: RequestQueryParams & { customerId: number; jobSiteId?: number; isAutopay?: boolean }) {
    this.cleanup();
    this.loading = true;

    try {
      const cardsResponse = await task(
        this.service.get(customerId, {
          jobSiteId,
          activeOnly,
          isAutopay,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
        }),
      );
      this.setItems(cardsResponse.map(card => new CreditCard(this, prepareToSerialize(card))));
    } catch (error) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);

      Sentry.addBreadcrumb({
        category: 'CreditCard',
        data: {
          customerId,
          jobSiteId,
        },
        message: `CreditCard Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async requestById(id: string) {
    try {
      const creditCardResponse = await task(this.service.getById(id));
      const creditCard = new CreditCard(this, prepareToSerialize(creditCardResponse));

      this.setItem(creditCard);
    } catch (error) {
      const typedError = error as ApiError;

      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'CreditCard',
        data: {
          id,
        },
        message: `CreditCard Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestRelevant({ customerId, jobSiteId }: { customerId: number; jobSiteId?: number }) {
    this.cleanup();

    try {
      const cardsResponse = await task(
        this.service.get(customerId, { jobSiteId, relevantOnly: true }),
      );

      this.setItems(cardsResponse.map(card => new CreditCard(this, prepareToSerialize(card))));
    } catch (error) {
      const typedError = error as ApiError;

      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'CreditCard',
        data: {
          customerId,
          jobSiteId,
        },
        message: `CreditCard Request Relevant Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: ICreditCard) {
    const customer = this.globalStore.customerStore.selectedEntity;

    if (!customer) {
      return;
    }

    this.loading = true;

    try {
      const newCreditCard = await task(this.service.create(customer.id, data));

      await task(this.requestById(newCreditCard.id));

      NotificationHelper.success('create', 'Credit Card');
    } catch (error) {
      const castedError = error as ApiError;

      if ((castedError?.response?.code as ActionCode) === ActionCode.PRECONDITION_FAILED) {
        NotificationHelper.error('createCreditCard', ActionCode.PRECONDITION_FAILED);
        Sentry.addBreadcrumb({
          category: 'CreditCard',
          data: {
            ...data,
          },
          message: ActionCode.PRECONDITION_FAILED,
          level: 'warning',
        });
        Sentry.captureException(castedError);
      } else {
        NotificationHelper.error(
          'create',
          castedError?.response?.code as ActionCode,
          'Credit Card',
        );
        Sentry.addBreadcrumb({
          category: 'CreditCard',
          data: {
            ...data,
          },
          message: `Create Credit Card Error ${JSON.stringify(castedError?.message)}`,
        });
        Sentry.captureException(castedError);
      }
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async update(data: ICreditCard) {
    const customer = this.globalStore.customerStore.selectedEntity;

    if (!customer) {
      return;
    }

    this.loading = true;

    try {
      const creditCard = await task(this.service.patch(data.id, data));

      await task(this.requestById(creditCard.id));
      NotificationHelper.success('update', 'Credit Card');
    } catch (error) {
      const typedError = error as ApiError;

      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Credit Card');
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Credit Card');
      Sentry.addBreadcrumb({
        category: 'CreditCard',
        data: {
          ...data,
        },
        message: `Update Credit Card Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }
}
