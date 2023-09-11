import { type FormikTaxExemption } from '@root/components/forms/TaxExemption/types';
import { type ITaxExemption } from '@root/types';

import { haulingHttpClient } from '../base';

const getBaseUrl = (customerId: number) => {
  return `customers/${customerId}/tax-exemptions`;
};

export class TaxExemptionService {
  static getCustomerTaxExemptions(customerId: number) {
    return haulingHttpClient.get<ITaxExemption>(getBaseUrl(customerId));
  }

  static getCustomerJobSiteTaxExemptions(customerId: number, jobSiteId: number) {
    return haulingHttpClient.get<ITaxExemption>(`${getBaseUrl(customerId)}/${jobSiteId}`);
  }

  static updateCustomerTaxExemptions(customerId: number, data: FormikTaxExemption) {
    return haulingHttpClient.sendForm<FormikTaxExemption, ITaxExemption>({
      url: getBaseUrl(customerId),
      data,
    });
  }

  static updateCustomerJobSiteTaxExemptions(
    customerId: number,
    jobSiteId: number,
    data: FormikTaxExemption,
  ) {
    return haulingHttpClient.sendForm<FormikTaxExemption, ITaxExemption>({
      url: `${getBaseUrl(customerId)}/${jobSiteId}`,
      data,
    });
  }
}
