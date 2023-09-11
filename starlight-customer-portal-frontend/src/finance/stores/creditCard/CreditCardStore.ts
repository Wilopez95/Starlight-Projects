import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { NotificationHelper, sortEntities } from '@root/core/helpers';
import { BaseStore } from '@root/core/stores/base/BaseStore';
import { ICreditCard, JsonConversions } from '@root/core/types';
import { CreditCardService } from '@root/finance/api/creditCard/creditCard';

import { CreditCard } from './CreditCard';

const prepareToSerialize = (cc: any): JsonConversions<ICreditCard> => {
  const item = {
    ...cc,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expDate: cc.expDate.toUTCString(),
  };

  return item as JsonConversions<ICreditCard>;
};

export class CreditCardStore extends BaseStore<CreditCard> {
  private service: CreditCardService = new CreditCardService();
  @observable shouldShowInactive = true;

  @action
  changeShowInactive(value: boolean) {
    this.shouldShowInactive = value;
  }

  // TODO: re-impl to get from be via query params
  @computed
  get filteredValues() {
    const data = this.shouldShowInactive ? this.values : this.values.filter((card) => card.active);

    return sortEntities(data, ['cardNickname'], this.shouldShowInactive);
  }

  @actionAsync
  async request({ customerId, jobSiteId }: { customerId: number; jobSiteId?: number }) {
    this.cleanup();
    this.loading = true;

    try {
      const cardsResponse = await task(this.service.get(customerId, { jobSiteId }));

      this.setItems(cardsResponse.map((card) => new CreditCard(this, prepareToSerialize(card))));
    } catch (error) {
      console.error('CreditCard Request Error:', error);
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
      console.error('CreditCard Request By Id Error:', error);
    }
  }

  @actionAsync
  async requestRelevant({ customerId, jobSiteId }: { customerId: number; jobSiteId?: number }) {
    this.cleanup();

    try {
      const cardsResponse = await task(
        this.service.get(customerId, { jobSiteId, relevantOnly: true }),
      );

      this.setItems(cardsResponse.map((card) => new CreditCard(this, prepareToSerialize(card))));
    } catch (error) {
      console.error('CreditCard Request Error:', error);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: ICreditCard) {
    const customer = this.globalStore.customerStore.selectedEntity;

    if (!customer) {
      return;
    }

    try {
      const newCreditCard = await task(this.service.create(customer.id, data));

      await task(this.requestById(newCreditCard.id));

      NotificationHelper.success('creditCard');
    } catch (error) {
      NotificationHelper.error('creditCard', error?.response?.code);
    }
  }

  @actionAsync
  async update(data: ICreditCard) {
    const stores = this.globalStore.customerStore.selectedEntity;

    if (!stores) {
      return;
    }

    try {
      const creditCard = await task(this.service.patch(data.id, data));

      await task(this.requestById(creditCard.id));

      NotificationHelper.success('editCreditCard');
    } catch (error) {
      console.error('CreditCard Update Error:', error);
    }
  }
}
