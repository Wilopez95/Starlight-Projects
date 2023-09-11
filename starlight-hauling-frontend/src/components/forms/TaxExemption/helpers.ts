import { parseDate } from '@root/helpers';
import { type ITaxExemption, type JsonConversions } from '@root/types';

import { type FormikTaxExemption } from './types';

export const convertTaxExemptionDates = (
  values: JsonConversions<ITaxExemption>,
): FormikTaxExemption => {
  return {
    ...values,
    timestamp: values.timestamp ? parseDate(values.timestamp) : null,
    nonGroup: values.nonGroup?.map(item => ({
      ...item,
      timestamp: item.timestamp ? parseDate(item.timestamp) : null,
    })),
  };
};
