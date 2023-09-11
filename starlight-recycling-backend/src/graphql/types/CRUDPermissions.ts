export interface CRUDPermissions {
  list?: string | string[];
  entity?: string | string[];
  entitiesByIds?: string | string[];
  createEntity?: string | string[];
  deleteEntity?: string | string[];
  updateEntity?: string | string[];
}
