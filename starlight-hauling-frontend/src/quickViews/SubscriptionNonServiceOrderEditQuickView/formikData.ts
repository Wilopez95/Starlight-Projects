import i18next from 'i18next';
import * as Yup from 'yup';

const I18N_PATH = 'components.forms.SubscriptionNonServiceOrderEditQuickView.ValidationErrors.';

const lineItemShape = {
  billableLineItemId: Yup.number().required(i18next.t(`${I18N_PATH}LineItemIsRequired`)),
  price: Yup.number().required(i18next.t(`${I18N_PATH}PriceIsRequired`)),
  quantity: Yup.number()
    .typeError(i18next.t(`${I18N_PATH}MustBeAnInteger`))
    .positive(i18next.t(`${I18N_PATH}MustBeGreaterThanZero`))
    .required(i18next.t(`${I18N_PATH}QuantityIsRequired`)),
};

export const validationSchema = Yup.object().shape({
  thirdPartyHaulerId: Yup.number().nullable(),
  route: Yup.string()
    .max(120, i18next.t(`${I18N_PATH}PleaseEnterUpTo120Characters`))
    .nullable(),
  poRequired: Yup.boolean(),
  purchaseOrderId: Yup.number().when(['poRequired', 'isOneTimePO'], {
    is: (poRequired, isOneTimePO) => poRequired && !isOneTimePO,
    then: Yup.number().required(i18next.t('ValidationErrors.PurchaseOrderNumberIsRequired')),
  }),
  oneTimePurchaseOrderNumber: Yup.string().when(['poRequired', 'isOneTimePO'], {
    is: (poRequired, isOneTimePO) => poRequired && !!isOneTimePO,
    then: Yup.string().required(i18next.t('ValidationErrors.PurchaseOrderNumberIsRequired')),
    otherwise: Yup.string(),
  }),
  lineItems: Yup.array()
    .of(Yup.object().shape(lineItemShape))
    .test('required', i18next.t(`${I18N_PATH}AtLeastOneLineItemShouldBeAdded`), lineItems => {
      return !!lineItems && lineItems.length > 0;
    }),
});
