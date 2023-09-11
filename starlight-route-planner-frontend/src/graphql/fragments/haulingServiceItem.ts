export const HaulingServiceItemFragment = `
  id
  jobSiteId
  businessLineId
  materialId
  subscriptionId
  businessUnitId
  customerId
  serviceFrequencyId
  startDate
  endDate
  serviceAreaId
  equipmentItemId
  billableServiceId
  billableServiceDescription
  bestTimeToComeFrom
  bestTimeToComeTo
  serviceDaysOfWeek
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
    name
    location
    coordinates
  }
  subscription {
    id
    customerId
    status
  }
`;
