import { DataSource } from 'typeorm';
import { BaseController } from '../controllers/base.controller';
import { AppDataSource } from '../data-source';
import { Tenants } from './entities/admin/Tenants';

export class DatabaseConfigurations {
  async syncGeneralMigrations() {
    try {
      /*
      This function start the general miration in this backend
      */
      const existTenants: Tenants[] = await AppDataSource.createQueryRunner().query(
        'SELECT * FROM public.tenants',
      );
      if (existTenants.length > 0) {
        await AppDataSource.runMigrations();
        await Promise.all(
          existTenants.map(async (tenant: Tenants) => {
            try {
              await this.synchTenant(tenant.name);
              console.log(`Tenant ${tenant.name} updated successfully`);
            } catch (errorSynch: unknown) {
              console.error(`Error updating tenant${tenant.name} : ${errorSynch}`);
            }
          }),
        );
      }
    } catch (error: unknown) {
      console.error(`General Migrations error:${error}`);
    }
  }

  async synchTenant(schemaName: string) {
    const database: DataSource = await BaseController.getDataSource(schemaName, false);
    await database.synchronize();
  }
}
