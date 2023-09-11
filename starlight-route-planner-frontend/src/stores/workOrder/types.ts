export enum WorkOrderStoreSortType {
  Status = 'status',
  AssignedRoute = 'assignedRoute',
  CompletedAt = 'completedAt',
  ThirdPartyHaulerDescription = 'thirdPartyHaulerDescription',
  DisplayId = 'displayId',
  InstructionsForDriver = 'instructionsForDriver',
  Comments = 'commentId',
  JobSite = 'fullAddress',
  Media = 'mediaId',
}

export interface IWorkOrdersBulkReschedule {
  ids: number[];
  serviceDate: string;
}
