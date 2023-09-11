export enum MasterRouteStatus {
  ACTIVE = 'ACTIVE',
  EDITING = 'EDITING',
  UPDATING = 'UPDATING',
  // only on UI (by default)
  UNPUBLISHED = 'UNPUBLISHED',
  // only on UI based on published prop
  PUBLISHED = 'PUBLISHED',
}
