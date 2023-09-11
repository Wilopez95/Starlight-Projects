import { registerEnumType } from 'type-graphql';

export enum AuditEntityAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  REMOVE = 'REMOVE',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(AuditEntityAction, { name: 'AuditEntityAction' });

export default AuditEntityAction;
