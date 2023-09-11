import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class RemoveUnusedOrderColumns1638993546697 implements MigrationInterface {
  name = 'RemoveUnusedOrderColumns1638993546697';

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(`Running migration up: ${this.name}`);
    await queryRunner.query(
      `SET LOCAL search_path TO '${
        (queryRunner.connection.options as PostgresConnectionOptions).schema
      }',public,postgis`,
      [],
    );

    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "billableServiceId"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "equipmentItemId"`);

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(`Running migration down: ${this.name}`);
    await queryRunner.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    await queryRunner.query(`ALTER TABLE "order" ADD "equipmentItemId" integer`);
    await queryRunner.query(`ALTER TABLE "order" ADD "billableServiceId" integer`);

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }
}
