import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class AddUseTareToOrderColumns1635319724691 implements MigrationInterface {
  name = 'AddUseTareToOrderColumns1635319724691';

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(`Running migration up: ${this.name}`);
    await queryRunner.query(
      `SET LOCAL search_path TO '${
        (queryRunner.connection.options as PostgresConnectionOptions).schema
      }',public,postgis`,
      [],
    );

    await queryRunner.query(`ALTER TABLE "order" ADD "useTare" boolean`);
    await queryRunner.query(`ALTER TABLE "order" ADD "truckTare" numeric`);
    await queryRunner.query(`ALTER TABLE "order" ADD "canTare" numeric`);

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(`Running migration down: ${this.name}`);
    await queryRunner.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "canTare"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "truckTare"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "useTare"`);

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }
}
