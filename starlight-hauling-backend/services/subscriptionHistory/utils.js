import { SUBSCRIPTION_ATTRIBUTE } from '../../consts/subscriptionHistoryAttributes.js';
import { SERVICE_ITEM_ATTRIBUTE } from '../../consts/subscriptionServiceItemHistoryAttributes.js';
import { LINE_ITEM_ATTRIBUTE } from '../../consts/subscriptionLineItemHistoryAttributes.js';
import { SUBSCRIPTION_ORDER_ATTRIBUTE } from '../../consts/subscriptionOrderHistoryAttributes.js';

export const getSubscriptionAttributeValue = (sub, attr) => {
  switch (attr) {
    case SUBSCRIPTION_ATTRIBUTE.jobSiteContact:
      return sub.jobSiteContact
        ? `${sub.jobSiteContact.firstName} ${sub.jobSiteContact.lastName}`
        : undefined;
    case SUBSCRIPTION_ATTRIBUTE.subscriptionContact:
      return sub.subscriptionContact
        ? `${sub.subscriptionContact.firstName} ${sub.subscriptionContact.lastName}`
        : undefined;
    case SUBSCRIPTION_ATTRIBUTE.permit:
      return sub.permit?.number;
    case SUBSCRIPTION_ATTRIBUTE.customRatesGroup:
      return sub.customRatesGroup?.description;
    case SUBSCRIPTION_ATTRIBUTE.thirdPartyHauler:
      return sub.thirdPartyHauler?.description;
    case SUBSCRIPTION_ATTRIBUTE.purchaseOrder:
      return sub.purchaseOrder?.poNumber;
    case SUBSCRIPTION_ATTRIBUTE.promo:
      return sub.promo ? `${sub.promo.code}/${sub.promo.description}` : undefined;
    default:
      return sub[attr];
  }
};

export const getServiceItemAttributeValue = (item, attr) => {
  switch (attr) {
    case SERVICE_ITEM_ATTRIBUTE.material:
      return item.material?.description;
    case SERVICE_ITEM_ATTRIBUTE.unlockOverrides:
      return item.price;
    default:
      return item[attr];
  }
};

export const getLineItemAttributeValue = (item, attr) => {
  switch (attr) {
    case LINE_ITEM_ATTRIBUTE.unlockOverrides:
      return item.price;
    default:
      return item[attr];
  }
};

export const getSubscriptionOrderAttributeValue = (item, attr) => {
  switch (attr) {
    case SUBSCRIPTION_ORDER_ATTRIBUTE.unlockOverrides:
      return item.price;
    default:
      return item[attr];
  }
};

export const compareAttributes = (attr, prevObj, newObj) => {
  if (prevObj[attr]?.id || newObj[attr]?.id) {
    return prevObj[attr]?.id === newObj[attr]?.id;
  }
  return String(prevObj[attr]) === String(newObj[attr]);
};

export const getDeltaByAttributes = (getAttrValueFunc, attrs, prevObj, newObj) =>
  attrs
    .map(attr => {
      const isEqual = compareAttributes(attr, prevObj, newObj);
      if (!isEqual) {
        return {
          attribute: attr,
          newValue: getAttrValueFunc(newObj, attr),
          previousValue: getAttrValueFunc(prevObj, attr),
        };
      }
      return null;
    })
    .filter(Boolean);

export const getDeltaBySubscriptionAttributes = getDeltaByAttributes.bind(
  null,
  getSubscriptionAttributeValue,
);
export const getDeltaByServiceItemAttributes = getDeltaByAttributes.bind(
  null,
  getServiceItemAttributeValue,
);
export const getDeltaByLineItemAttributes = getDeltaByAttributes.bind(
  null,
  getLineItemAttributeValue,
);

export const getDeltaBySubscriptionOrderAttributes = getDeltaByAttributes.bind(
  null,
  getSubscriptionOrderAttributeValue,
);
