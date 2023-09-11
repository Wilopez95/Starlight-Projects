import { TFunction } from 'i18next';
import * as Yup from 'yup';

const I18N_PATH = 'modules.billing.Settlements.components.RequestSettlement.ValidationErrors.';

export const generateValidationSchema = (t: TFunction) => {
  return Yup.object().shape({
    date: Yup.date().required(t(`${I18N_PATH}DateRequired`)),
    merchantId: Yup.number()
      .required(t(`${I18N_PATH}MerchantRequired`))
      .positive(t(`${I18N_PATH}MerchantRequired`)),
  });
};
