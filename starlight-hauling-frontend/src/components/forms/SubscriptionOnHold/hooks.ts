import { useTranslation } from 'react-i18next';
import { ISelectOption } from '@starlightpro/shared-components';

const I18N_PATH = `components.forms.SubscriptionOnHold.Form.`;

export const useReasonOptions = (): ISelectOption[] => {
  const { t } = useTranslation();

  return [
    { label: t(`${I18N_PATH}TheAccountOverCreditLimit`), value: 'The Account Over Credit Limit' },
    { label: t(`${I18N_PATH}TheCustomerDoesNotPay`), value: 'The customer does not pay' },
    { label: t(`${I18N_PATH}TheCustomerIsOnVacation`), value: 'The customer is on vacation' },
    { label: t(`${I18N_PATH}Other`), value: 'Other' },
  ];
};
