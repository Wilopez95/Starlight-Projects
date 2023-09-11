import { JobSiteFormValues } from '../JobSitesView/JobSiteForm/types';
import { TaxExemptionFormInput } from '../CustomersView/CustomerForm/NewCustomerView';
import { HaulingCustomerJobSiteInput } from '../../graphql/api';

export interface CustomerJobSiteFormValues
  extends JobSiteFormValues,
    Pick<
      HaulingCustomerJobSiteInput,
      'customerId' | 'jobSiteId' | 'poRequired' | 'popupNote' | 'PONumberRequired' | 'active'
    > {
  id: number;
  taxExemptions: TaxExemptionFormInput[];
}

export interface CustomerJobSitePart
  extends Omit<CustomerJobSiteFormValues, 'taxExemptions' | 'selectedLocation'> {}
