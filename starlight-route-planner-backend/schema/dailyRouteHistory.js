import gql from 'graphql-tag';

export const typeDefs = gql`
  scalar StringOrIntArray

  enum DAILY_ROUTE_HISTORY_ATTRIBUTE {
    name
    status
    serviceDate
    truckId
    driverId
    driverName
    truckType
    truckName
    completedAt
    clockIn
    clockOut
    odometerStart
    odometerEnd
    workOrderIds
    ticketNumber
  }

  enum DAILY_ROUTE_CHANGE_ACTION_TYPE {
    delete
  }

  enum DAILY_ROUTE_HISTORY_ENTITY_TYPE {
    DAILY_ROUTE
    WEIGHT_TICKET
  }

  type DailyRouteHistoryFieldChange {
    attribute: DAILY_ROUTE_HISTORY_ATTRIBUTE!
    actionType: DAILY_ROUTE_CHANGE_ACTION_TYPE
    newValue: StringOrIntArray
    previousValue: StringOrIntArray
  }

  type DailyRouteHistoryChange {
    attribute: DAILY_ROUTE_HISTORY_ATTRIBUTE!
    actualChanges: [DailyRouteHistoryFieldChange]
  }

  type DailyRouteHistoryEntry {
    id: Int
    originalId: Int
    eventType: HISTORICAL_EVENT_TYPE
    entityType: DAILY_ROUTE_HISTORY_ENTITY_TYPE
    timestamp: String

    userId: String
    userName: String

    changes: [DailyRouteHistoryChange]
  }
`;
