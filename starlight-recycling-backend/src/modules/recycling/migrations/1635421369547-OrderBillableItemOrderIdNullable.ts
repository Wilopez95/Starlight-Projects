import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class OrderBillableItemOrderIdNullable1635421369547 implements MigrationInterface {
  name = 'OrderBillableItemOrderIdNullable1635421369547';

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(`Running migration up: ${this.name}`);
    await queryRunner.query(
      `SET LOCAL search_path TO '${
        (queryRunner.connection.options as PostgresConnectionOptions).schema
      }',public,postgis`,
      [],
    );

    await queryRunner.query(
      `ALTER TABLE "order_billable_item" ALTER COLUMN "orderId" DROP NOT NULL`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "order_billable_item"."orderId" IS NULL`);

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(`Running migration down: ${this.name}`);
    await queryRunner.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    await queryRunner.query(
      `ALTER TABLE "order_billable_item" ALTER COLUMN "orderId" SET NOT NULL`,
    );

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }
}
