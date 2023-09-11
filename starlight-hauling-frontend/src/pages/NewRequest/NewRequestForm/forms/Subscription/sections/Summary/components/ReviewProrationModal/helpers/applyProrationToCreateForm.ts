import { FormikContextType } from 'formik';

import { IReviewProration } from '@root/types';

import { INewSubscription } from '../../../../../types';

export const applyProrationToCreateForm = (
  { serviceItems }: IReviewProration,
  { values, setFieldValue }: FormikContextType<INewSubscription>,
): void => {
  // it has to be a foreach because we can use the null value as result
  values.serviceItems.forEach(({ billableServiceId, lineItems }, serviceIndex) => {
    const proratedService = serviceItems.find(
      service => service.billableServiceId === billableServiceId,
    );

    if (proratedService) {
      const servicePath = `serviceItems[${serviceIndex}]`;

      setFieldValue(`${servicePath}.prorationEffectiveDate`, values.startDate);
      setFieldValue(
        `${servicePath}.prorationEffectivePrice`,
        proratedService.prorationEffectivePrice,
      );
      setFieldValue(`${servicePath}.prorationOverride`, proratedService.prorationOverride);
      // it has to be a foreach because we can use the null value as result
      lineItems.forEach(({ billableLineItemId }, lineItemIndex) => {
        const proratedLineItem = proratedService.lineItems?.find(
          lineItem => lineItem.billableLineItemId === billableLineItemId,
        );

        if (proratedLineItem) {
          const lineItemPath = `${servicePath}.lineItems[${lineItemIndex}]`;

          setFieldValue(`${lineItemPath}.prorationEffectiveDate`, values.startDate);
          setFieldValue(
            `${lineItemPath}.prorationEffectivePrice`,
            proratedLineItem.prorationEffectivePrice,
          );
          setFieldValue(`${lineItemPath}.prorationOverride`, proratedLineItem.prorationOverride);
        }
      });
    }
  });
};
