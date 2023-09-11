export const DailyRouteHistoryFragment = `
  id
  originalId
  eventType
  entityType
  timestamp
  userId
  userName
  changes {
    attribute
    actualChanges {
      attribute
      actionType
      newValue
      previousValue
    }
  }
`;
