import omit from 'lodash/omit.js';
import isNull from 'lodash/isNull.js';

const fieldsToOmit = ['prevProration'];

export const outputProrationPeriods = billingPeriods =>
  billingPeriods.map(prorationPeriods =>
    prorationPeriods.map(serviceItems =>
      serviceItems
        .map(serviceItem => {
          const output = omit(serviceItem, fieldsToOmit);
          output.lineItemsProrationInfo = output.lineItemsProrationInfo
            .map(lineItem => omit(lineItem, fieldsToOmit))
            .filter(({ usageDay }) => usageDay > 0 || isNull(usageDay));
          return output;
        })
        .filter(
          ({ serviceItemProrationInfo, lineItemsProrationInfo }) =>
            serviceItemProrationInfo?.usageDay > 0 ||
            isNull(serviceItemProrationInfo?.usageDay) ||
            lineItemsProrationInfo?.length > 0,
        ),
    ),
  );

export const outputProrationInfo = billingPeriods => {
  return billingPeriods.map(serviceItems => {
    return serviceItems.map(serviceItem => {
      const output = omit(serviceItem, fieldsToOmit);
      output.lineItemsProrationInfo = output.lineItemsProrationInfo.map(lineItem => {
        return omit(lineItem, fieldsToOmit);
      });
      return output;
    });
  });
};
