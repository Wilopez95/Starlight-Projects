export const WorkOrderHistoryFragment = `
  id
  originalId
  workOrderId
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
