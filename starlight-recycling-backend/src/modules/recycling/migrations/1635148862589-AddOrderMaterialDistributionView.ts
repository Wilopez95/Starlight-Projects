import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderMaterialDistributionView1635148862589 implements MigrationInterface {
  name = 'AddOrderMaterialDistributionView1635148862589';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    await queryRunner.query(`
      create view "order_material_distributions_view" as
      select md."orderId", sum(md.value) as value, md."materialId"
      from (
          select
              m."orderId",
              m.value,
              case when m.recycle then m."materialId" else null end as "materialId"
          from "order_material_distribution" m
      ) md
      group by md."orderId", md."materialId";
    `);

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    await queryRunner.query(`DROP VIEW "order_material_distribution_view"`);

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }
}
