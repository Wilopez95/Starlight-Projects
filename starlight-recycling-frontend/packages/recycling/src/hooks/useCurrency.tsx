import { gql } from '@apollo/client';
import { Currency, useGetCompanyPaymentSettingsQuery } from '../graphql/api';

gql`
  query getCompanyPaymentSettings {
    company {
      id
      firstInvoice
      currency
      ccGateway
    }
  }
`;

export const useCurrency = () => {
  const { data: paymentSettings } = useGetCompanyPaymentSettingsQuery();

  return paymentSettings?.company.currency || Currency.Usd;
};
