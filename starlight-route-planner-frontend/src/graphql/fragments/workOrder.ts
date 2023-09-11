import { DailyRouteFragment } from './dailyRoute';

const WorkOrderFragmentBase = `
id
displayId
status
bestTimeToComeFrom
bestTimeToComeTo
materialId
serviceAreaId
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
`;

export const PartialWorkOrderFragment = `
  ${WorkOrderFragmentBase}
  workOrderId
  isIndependent
  orderId
  orderDisplayId
  serviceDate
  customerId
  jobSiteId
  businessLineId
  equipmentItemId
  subscriptionId
  billableServiceId
  billableServiceDescription
  signatureRequired
  toRoll
  alleyPlacement
  poRequired
  permitRequired
  jobSiteNote
  highPriority
  someoneOnSite
  dailyRouteId
  assignedRoute
  sequence
  instructionsForDriver
  cancellationReason
  cancellationComment
  completedAt
  pickedUpEquipment
  droppedEquipment
  weight
  weightUnit
  media {
    id
    workOrderId
    url
    timestamp
    author
    fileName
  }
  thirdPartyHaulerId
  thirdPartyHaulerDescription
  phoneNumber
`;

export const WorkOrderFragment = `
  ${PartialWorkOrderFragment}
  dailyRoute {
    ${DailyRouteFragment}
  }
  comments {
    id
  }
`;

export const WorkOrderDashboardFragment = WorkOrderFragmentBase;

export const WorkOrderMapItemFragment = `
  ${WorkOrderFragmentBase}
  isIndependent
  workOrderId
  orderId
  orderDisplayId
  serviceDate
  customerId
  jobSiteId
  businessLineId
  equipmentItemId
  subscriptionId
  billableServiceId
  billableServiceDescription
  dailyRouteId
  assignedRoute
  sequence
`;

export const UpdateWorkOrderFragment = `
  __typename
  ... on ParentOrderInvoicedNotice {
    message
    parentOrderId
  }
  ... on WorkOrder {
    ${WorkOrderFragment}
  }
`;
