export const ServiceItemFragment = `
  id
  haulingId
  serviceFrequencyId
  jobSiteId
  jobSite {
    id
    address {
      addressLine1
      addressLine2
      fullAddress
      city
      state
      zip
    }
    location
    coordinates
  }
  billableServiceId
  billableServiceDescription
  businessLineId
  materialId
  subscriptionId
  businessUnitId
  startDate
  equipmentItemId
  serviceDaysOfWeek
  customerId
  serviceAreaId
  endDate
  bestTimeToComeFrom
  bestTimeToComeTo
  sequence
`;
