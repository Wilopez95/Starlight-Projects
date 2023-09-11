import isEmpty from 'lodash/isEmpty.js';

export const extractFromRates = ratesObj => {
  const rates = {};
  if (!isEmpty(ratesObj.customRates) && !isEmpty(ratesObj.customRates.customRatesLineItems)) {
    const [item] = ratesObj.customRates.customRatesLineItems;
    rates.price = item.price;
    rates.customRatesGroupLineItemsId = item.id;
  }
  if (!isEmpty(ratesObj.globalRates) && !isEmpty(ratesObj.globalRates.globalRatesLineItems)) {
    const [item] = ratesObj.globalRates.globalRatesLineItems;
    if (!rates.price) {
      rates.price = item.price;
    }

    rates.globalRatesLineItemsId = item.id;
  }
  return rates;
};
