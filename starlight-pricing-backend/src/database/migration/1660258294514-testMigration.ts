import { MigrationInterface, QueryRunner } from 'typeorm';

export class testMigration1660258294514 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS admin;`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
