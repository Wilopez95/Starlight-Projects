import gql from 'graphql-tag';

export const typeDefs = gql`
  enum WORK_ORDER_HISTORY_ATTRIBUTE {
    assignedRoute
    dailyRouteId
    serviceDate
    completedAt
    status
    statusLonChange
    statusLatChange
    instructionsForDriver
    pickedUpEquipment
    droppedEquipment
    weight
    deletedAt
    jobSiteContactId
    phoneNumber
    bestTimeToCome
    bestTimeToComeFrom
    bestTimeToComeTo
    alleyPlacement
    someoneOnSite
    highPriority
    signatureRequired
    poRequired
    permitRequired
    toRoll
    thirdPartyHaulerId
    thirdPartyHaulerDescription
    truckId
    driverId
    driverName
    truckType
    truckName
    mediaId
    url
    fileName
    commentId
    commentEventType
    comment
  }

  enum WORK_ORDER_CHANGE_ACTION_TYPE {
    delete
  }

  enum WORK_ORDER_HISTORY_ENTITY_TYPE {
    WORK_ORDER
    DAILY_ROUTE
    MEDIA
    COMMENT
  }

  type WorkOrderHistoryFieldChange {
    attribute: WORK_ORDER_HISTORY_ATTRIBUTE!
    actionType: WORK_ORDER_CHANGE_ACTION_TYPE
    newValue: StringOrIntArray
    previousValue: StringOrIntArray
  }

  type WorkOrderHistoryChange {
    attribute: WORK_ORDER_HISTORY_ATTRIBUTE!
    actualChanges: [WorkOrderHistoryFieldChange]
  }

  type WorkOrderHistoryEntry {
    id: Int
    originalId: Int
    workOrderId: Int
    eventType: HISTORICAL_EVENT_TYPE
    entityType: WORK_ORDER_HISTORY_ENTITY_TYPE
    timestamp: String

    userId: String
    userName: String

    changes: [WorkOrderHistoryChange]
  }
`;
