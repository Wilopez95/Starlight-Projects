import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class OrderBillableItemAuto1640107338619 implements MigrationInterface {
  name = 'OrderBillableItemAuto1640107338619';

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(`Running migration up: ${this.name}`);
    await queryRunner.query(
      `SET LOCAL search_path TO '${
        (queryRunner.connection.options as PostgresConnectionOptions).schema
      }',public,postgis`,
      [],
    );

    await queryRunner.query(
      `ALTER TABLE "order_billable_item" ADD "auto" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(`Running migration down: ${this.name}`);
    await queryRunner.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    await queryRunner.query(`ALTER TABLE "order_billable_item" DROP COLUMN "auto"`);

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }
}
