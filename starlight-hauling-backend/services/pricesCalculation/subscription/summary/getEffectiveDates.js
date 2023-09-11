import { compareAsc, isEqual, startOfDay } from 'date-fns';
import uniqWith from 'lodash/uniqWith.js';

const getEffectiveDates = (serviceItems = []) => {
  const effectiveDates = serviceItems
    .reduce(
      (allEffectiveDates, { effectiveDate: serviceItemEffectiveDate, lineItems }) =>
        allEffectiveDates
          .concat(serviceItemEffectiveDate ? [serviceItemEffectiveDate] : [])
          .concat(
            lineItems?.reduce(
              (lineItemEffectiveDates, { effectiveDate: lineItemEffectiveDate }) =>
                lineItemEffectiveDates.concat(lineItemEffectiveDate ? [lineItemEffectiveDate] : []),
              [],
            ) ?? [],
          ),
      [],
    )
    .map(effectiveDate => startOfDay(effectiveDate))
    .sort(compareAsc);

  return uniqWith(effectiveDates, isEqual);
};

export default getEffectiveDates;
