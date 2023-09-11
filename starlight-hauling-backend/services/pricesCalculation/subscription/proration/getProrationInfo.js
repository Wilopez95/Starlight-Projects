import isNil from 'lodash/isNil.js';
import omit from 'lodash/omit.js';
import cloneDeep from 'lodash/cloneDeep.js';
import { isSameDay } from 'date-fns';

const proratedItems = ({ totalPrice, proratedTotal, effectiveDate, prevProration }) => {
  const isTotalPriceNotNull = !isNil(totalPrice);
  const isEffectiveDateNotNull = !isNil(effectiveDate);
  const isPreviousProratedApplyed = isEffectiveDateNotNull
    ? !isSameDay(effectiveDate, prevProration?.effectiveDate) ||
      !(proratedTotal === Number(prevProration?.effectivePrice))
    : true;

  const isProratedTrue =
    isTotalPriceNotNull &&
    isPreviousProratedApplyed &&
    proratedTotal !== 0 &&
    totalPrice !== proratedTotal;

  return isProratedTrue;
};

const proratedServiceItems = ({
  serviceItemProrationInfo = {},
  lineItemsProrationInfo = [],
  prevProration,
}) => {
  const { totalPrice, proratedTotal, effectiveDate } = serviceItemProrationInfo;
  return (
    proratedItems({ totalPrice, proratedTotal, effectiveDate, prevProration }) ||
    lineItemsProrationInfo.length > 0
  );
};

const getReviewProrationInfo = billingPeriods => {
  const proratedItemsByBillingPeriods = cloneDeep(billingPeriods).map(billingPeriod => {
    const serviceItemsByBillingPeriods = billingPeriod.map(serviceItem => {
      serviceItem.lineItemsProrationInfo = serviceItem.lineItemsProrationInfo.filter(proratedItems);
      return omit(serviceItem, ['subscriptionOrders']);
    });

    const filteredProratedServiceItems = serviceItemsByBillingPeriods.filter(
      service => proratedServiceItems(service) === true,
    );

    return filteredProratedServiceItems;
  });

  const onlyBillingPeriodsWithProration = proratedItemsByBillingPeriods.filter(
    items => items.length,
  );

  return onlyBillingPeriodsWithProration;
};

export default getReviewProrationInfo;
