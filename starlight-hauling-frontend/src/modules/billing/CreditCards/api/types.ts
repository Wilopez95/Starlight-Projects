import { ICreditCard } from '../types';

export interface JobSiteItem {
  id: string;
}

export interface ICreditCardExtended extends Omit<ICreditCard, 'jobSites' | 'id'> {
  jobSites?: JobSiteItem[];
  id: string;
}

export type CreditCardByIdResponse = {
  creditCard: ICreditCardExtended;
};

export type CreditCardsResponse = {
  creditCards: ICreditCardExtended[];
};

export type CreditCardAddedResponse = {
  addCreditCard: ICreditCardExtended;
};

export type CreditCardUpdatedResponse = {
  updateCreditCard: ICreditCardExtended;
};
