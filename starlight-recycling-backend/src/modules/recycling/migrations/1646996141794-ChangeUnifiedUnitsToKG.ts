import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class ChangeUnifiedUnitsToKG1646996141794 implements MigrationInterface {
  name = 'ChangeUnifiedUnitsToKG1646996141794';

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(`Running migration up: ${this.name}`);
    await queryRunner.query(
      `SET LOCAL search_path TO '${
        (queryRunner.connection.options as PostgresConnectionOptions).schema
      }',public,postgis`,
      [],
    );

    await queryRunner.query(
      `ALTER TYPE "customer_truck_emptyweightunit_enum" RENAME TO "customer_truck_emptyweightunit_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "customer_truck_emptyweightunit_enum" AS ENUM('GRAM', 'TON', 'KILOGRAM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_truck" ALTER COLUMN "emptyWeightUnit" TYPE "customer_truck_emptyweightunit_enum" USING "emptyWeightUnit"::"text"::"customer_truck_emptyweightunit_enum"`,
    );
    await queryRunner.query(`DROP TYPE "customer_truck_emptyweightunit_enum_old"`);
    await queryRunner.query(`COMMENT ON COLUMN "customer_truck"."emptyWeightUnit" IS NULL`);
    await queryRunner.query(
      `ALTER TYPE "order_weightinunit_enum" RENAME TO "order_weightinunit_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_weightinunit_enum" AS ENUM('GRAM', 'TON', 'KILOGRAM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "weightInUnit" TYPE "order_weightinunit_enum" USING "weightInUnit"::"text"::"order_weightinunit_enum"`,
    );
    await queryRunner.query(`DROP TYPE "order_weightinunit_enum_old"`);
    await queryRunner.query(`COMMENT ON COLUMN "order"."weightInUnit" IS NULL`);
    await queryRunner.query(
      `ALTER TYPE "order_weightoutunit_enum" RENAME TO "order_weightoutunit_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_weightoutunit_enum" AS ENUM('GRAM', 'TON', 'KILOGRAM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "weightOutUnit" TYPE "order_weightoutunit_enum" USING "weightOutUnit"::"text"::"order_weightoutunit_enum"`,
    );
    await queryRunner.query(`DROP TYPE "order_weightoutunit_enum_old"`);
    await queryRunner.query(`COMMENT ON COLUMN "order"."weightOutUnit" IS NULL`);

    const KG = 1000;

    await queryRunner.query(
      `UPDATE "customer_truck" SET "emptyWeight" = "emptyWeight" * ${KG}, "emptyWeightUnit" = 'KILOGRAM' WHERE "emptyWeight" IS NOT NULL;`,
    );
    await queryRunner.query(
      `UPDATE "order" SET "weightIn" = "weightIn" * ${KG}, "weightInUnit" = 'KILOGRAM' WHERE "weightIn" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "order" SET "weightOut" = "weightOut" * ${KG}, "weightOutUnit" = 'KILOGRAM' WHERE "weightOut" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "order" SET "truckTare" = "truckTare" * ${KG}, "canTare" = "canTare" * ${KG} WHERE "truckTare" > 0 OR "canTare" > 0`,
    );

    await queryRunner.query(
      `UPDATE "order_billable_item" SET "quantity" = "quantity" * ${KG} WHERE "thresholdId" IS NOT NULL`,
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

    const KG = 0.001;

    await queryRunner.query(
      `UPDATE "order_billable_item" SET "quantity" = "quantity" * ${KG} WHERE "thresholdId" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "order" SET "truckTare" = "truckTare" * ${KG}, "canTare" = "canTare" * ${KG} WHERE "truckTare" > 0 OR "canTare" > 0`,
    );
    await queryRunner.query(
      `UPDATE "order" SET "weightOut" = "weightOut" * ${KG}, "weightOutUnit" = 'TON' WHERE "weightOut" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "order" SET "weightIn" = "weightIn" * ${KG}, "weightInUnit" = 'TON' WHERE "weightIn" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "customer_truck" SET "emptyWeight" = "emptyWeight" * ${KG}, "emptyWeightUnit" = 'TON' WHERE "emptyWeight" IS NOT NULL;`,
    );

    await queryRunner.query(`COMMENT ON COLUMN "order"."weightOutUnit" IS NULL`);
    await queryRunner.query(`CREATE TYPE "order_weightoutunit_enum_old" AS ENUM('GRAM', 'TON')`);
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "weightOutUnit" TYPE "order_weightoutunit_enum_old" USING "weightOutUnit"::"text"::"order_weightoutunit_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "order_weightoutunit_enum"`);
    await queryRunner.query(
      `ALTER TYPE "order_weightoutunit_enum_old" RENAME TO  "order_weightoutunit_enum"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "order"."weightInUnit" IS NULL`);
    await queryRunner.query(`CREATE TYPE "order_weightinunit_enum_old" AS ENUM('GRAM', 'TON')`);
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "weightInUnit" TYPE "order_weightinunit_enum_old" USING "weightInUnit"::"text"::"order_weightinunit_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "order_weightinunit_enum"`);
    await queryRunner.query(
      `ALTER TYPE "order_weightinunit_enum_old" RENAME TO  "order_weightinunit_enum"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "customer_truck"."emptyWeightUnit" IS NULL`);
    await queryRunner.query(
      `CREATE TYPE "customer_truck_emptyweightunit_enum_old" AS ENUM('GRAM', 'TON')`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_truck" ALTER COLUMN "emptyWeightUnit" TYPE "customer_truck_emptyweightunit_enum_old" USING "emptyWeightUnit"::"text"::"customer_truck_emptyweightunit_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "customer_truck_emptyweightunit_enum"`);
    await queryRunner.query(
      `ALTER TYPE "customer_truck_emptyweightunit_enum_old" RENAME TO  "customer_truck_emptyweightunit_enum"`,
    );

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }
}
