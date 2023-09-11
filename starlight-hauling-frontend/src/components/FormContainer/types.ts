import { FormikContextType } from 'formik';
import { INewCreditCard, NewUnappliedPayment } from '../../modules/billing/types';
import { IBulkRatesData } from '../../modules/pricing/CustomRate/components/quickViews/CustomRateBulkEditQuickView/types';
import { GeneralSettings } from '../../pages/ConfigurationCompanySettings/components/General/formikData';
import { INewOrders } from '../../pages/NewRequest/NewRequestForm/forms/Order/types';
import { EntityType } from '../../quickViews/BillableItemsQuickView/types';
import {
  CustomerCommentRequest,
  IConfigurableSubscriptionOrder,
  IFinanceChargesSettings,
} from '../../types';
import { GlobalRateType } from '../forms/Rates/Global/types';

export type TypeFormik =
  | FormikContextType<IConfigurableSubscriptionOrder>
  | FormikContextType<CustomerCommentRequest>
  | FormikContextType<NewUnappliedPayment>
  | FormikContextType<EntityType>
  | FormikContextType<INewOrders>
  | FormikContextType<GeneralSettings>
  | FormikContextType<INewCreditCard>
  | FormikContextType<IBulkRatesData>
  | FormikContextType<Record<string, GlobalRateType[]>>
  | FormikContextType<IFinanceChargesSettings>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | FormikContextType<any>; // preven possible conflicts

export interface IFormContainer {
  formik: TypeFormik;
  noValidate?: boolean;
  className?: string;
  fullHeight?: boolean;
}
