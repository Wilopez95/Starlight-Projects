import { Tenants } from './admin/Tenants';
import { TenantMigrations } from './admin/TenantMigrations';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Entity {
  public static entities = [Tenants, TenantMigrations];
}
