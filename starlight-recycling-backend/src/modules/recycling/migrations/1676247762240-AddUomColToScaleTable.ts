import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUomColToScaleTable1676247762240 implements MigrationInterface {
  name = 'AddUomColToScaleTable1676247762240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(`Running migration up: ${this.name}`);

    await queryRunner.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    // here will go your code for "up"
    await queryRunner.addColumn(
      'scale',
      new TableColumn({
        name: 'unitOfMeasurement',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(`Running migration down: ${this.name}`);

    await queryRunner.query(
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    // here will go your code for "down"
    await queryRunner.dropColumn('scale', 'unitOfMeasurement');

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }
}
