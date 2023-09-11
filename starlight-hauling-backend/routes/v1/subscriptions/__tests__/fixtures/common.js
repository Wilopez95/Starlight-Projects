export const deliveryServiceInputDefault = {
  billableServiceId: 27,
  action: 'delivery',
  globalRatesServicesId: 514,
  price: 0,
};

export const servicingServiceInputDefault = {
  billableServiceId: 31,
  materialId: 6,
  shortDescription: 'Commercial Container',
  billableServiceInclusionIds: [27, 28],

  serviceFrequencyId: 2,
  globalRatesRecurringServicesId: 517,
  serviceDaysOfWeek: {
    2: {
      requiredByCustomer: false,
    },
    4: {
      requiredByCustomer: false,
    },
  },
  price: 39,
};

export const subscriptionInputCommonFieldsDefault = {
  customerId: 1,
  jobSiteContactId: 198,
  bestTimeToComeFrom: '00:00',
  bestTimeToComeTo: '23:59',
  highPriority: false,
  promoId: null,
  grandTotal: 5.2,
  recurringGrandTotal: 5.2,
  unlockOverrides: false,
  overrideCreditLimit: true,
  subscriptionContactId: 198,
};
