import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { BaseController } from '../../controllers/base.controller';
import { Tenants } from '../../database/entities/admin/Tenants';
import { ICreateTenantSubData } from '../../Interfaces/RabittMQ';

const createTableOnSchema = async (schameName: string) => {
  const schema: DataSource = await BaseController.getDataSource(schameName);
  await schema.synchronize();
  console.log(`Tenant ${schameName} created with success`);
};

export const createTenantSub = async (data: ICreateTenantSubData) => {
  const { name, legalName, region } = data;
  const tenant: Tenants | null = await AppDataSource.manager.findOne(Tenants, {
    where: { name },
  });
  if (tenant === null) {
    const newTenant = { name, legalName, region };
    await AppDataSource.manager.insert(Tenants, newTenant);
    try {
      await AppDataSource.createQueryRunner().createSchema(name, true);
      await createTableOnSchema(name);
    } catch (error: unknown) {
      console.error(error);
    }
  } else {
    console.error(`The tenant ${name} alreary exist`);
  }
};
