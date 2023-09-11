export enum SUBSCRIPTION_WO_STATUS {
  scheduled = 'SCHEDULED',
  inProgress = 'IN_PROGRESS',
  blocked = 'BLOCKED',
  completed = 'COMPLETED',
  needsApproval = 'NEEDS_APPROVAL',
  approved = 'APPROVED',
  canceled = 'CANCELED',
  finalized = 'FINALIZED',
  invoiced = 'INVOICED',
}

export const enum WorkOrderStatus {
  InProgress = 'INPROGRESS',
  Completed = 'COMPLETED',
  Unassigned = 'UNASSIGNED',
  Assigned = 'ASSIGNED',
  Canceled = 'CANCELED',
  Scheduled = 'SCHEDULED',
  Blocked = 'BLOCKED',
}
