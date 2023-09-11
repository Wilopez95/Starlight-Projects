export const dailyRouteFragment = `
  id
  status
  name
  serviceDate
  businessUnitId
  color
  businessLineType
  completedAt
  clockIn
  clockOut
  odometerStart
  odometerEnd
  numberOfStops
  completionRate
  truckId
  driverId
  createdAt
  updatedAt
`;

export const workOrderFragment = `
  id
  workOrderId
  isIndependent
  orderId
  displayId
  serviceDate
  status
  jobSiteId
  businessLineId
  materialId
  equipmentItemId
  subscriptionId
  billableServiceId
  billableServiceDescription
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
  bestTimeToComeFrom
  bestTimeToComeTo
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
  notesCount
`;

export const workOrderSimplifiedFragment = `
  id
  workOrderId
  isIndependent
  orderId
  displayId
  serviceDate
  status
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
  bestTimeToComeFrom
  bestTimeToComeTo
  sequence
  instructionsForDriver
  cancellationReason
  cancellationComment
  completedAt
  pickedUpEquipment
  droppedEquipment
  weight
  weightUnit
  thirdPartyHaulerId
  thirdPartyHaulerDescription
  phoneNumber
`;

export const workOrderNotes = `
  __typename
  ... on Comment {
    id
    workOrderId
    authorId
    authorName
    authorRole
    comment
    createdAt
    updatedAt
  }
  ... on WorkOrderMedia {
    id
    workOrderId
    url
    timestamp
    author
    fileName
    createdAt
    updatedAt
  }
`;

export const weightTicketFragment = `
  id
  dailyRouteId
  ticketNumber
  loadValue
  weightUnit
  media {
    id
    url
    timestamp
    fileName
  }
  materialId
  disposalSiteId
  arrivalTime
  departureTime
  timeOnLandfill
  createdAt
  updatedAt
`;

export const landfillFragment = `
  id
  active
  description
  location {
    type
    coordinates
  }
  address {
    addressLine1
    city
    addressLine2
    state
    zip
  }
  type
  createdAt
  updatedAt
`;
