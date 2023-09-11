import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUomColumnsToOrder1676510195403 implements MigrationInterface {
  name = 'AddUomColumnsToOrder1676510195403';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    // here will go your code for "up"
    await queryRunner.addColumn(
      'order',
      new TableColumn({
        name: 'weightScaleUom',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    // here will go your code for "down"
    await queryRunner.dropColumn('oder', 'weightScaleUom');

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }
}
