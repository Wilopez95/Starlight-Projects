import { MigrationInterface, QueryRunner } from 'typeorm';
import { OrderStatus } from '../entities/Order';

export class ClearOnTheWayOrdersHaulingOrderId1639495222127 implements MigrationInterface {
  name = 'ClearOnTheWayOrdersHaulingOrderId1639495222127';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    await queryRunner.query(
      `UPDATE "order" SET "truckOnWayId"="haulingOrderId" WHERE "status" = '${OrderStatus.ON_THE_WAY}' AND "haulingOrderId" IS NOT null;`,
    );
    await queryRunner.query(
      `UPDATE "order" SET "haulingOrderId"=null WHERE "status" = '${OrderStatus.ON_THE_WAY}' AND "haulingOrderId" IS NOT null;`,
    );

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    await queryRunner.query(
      `UPDATE "order" SET "haulingOrderId"="truckOnWayId" WHERE "status" = '${OrderStatus.ON_THE_WAY}' AND "truckOnWayId" IS NOT null;`,
    );
    await queryRunner.query(
      `UPDATE "order" SET "truckOnWayId"=null WHERE "status" = '${OrderStatus.ON_THE_WAY}' AND "truckOnWayId" IS NOT null;`,
    );

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }
}
