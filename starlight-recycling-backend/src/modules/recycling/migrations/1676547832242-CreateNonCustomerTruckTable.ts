import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateNonCustomerTruckTable1676547832242 implements MigrationInterface {
  name = 'CreateNonCustomerTruckTable1676547832242';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    // here will go your code for "up"
    await queryRunner.query(
      `CREATE TABLE "non_commercial_truck" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "customerId" integer, "description" character varying(100), "licensePlate" character varying(25), "emptyWeight" double precision, "emptyWeightUnit" "customer_truck_emptyweightunit_enum", "emptyWeightType" "customer_truck_emptyweighttype_enum", "emptyWeightSource" character varying, "emptyWeightTimestamp" TIMESTAMP, "emptyWeightUser" character varying, CONSTRAINT "PK_0e218a558b8b5e965f8bcc7d020" PRIMARY KEY ("id"))`,
    );

    await queryRunner.addColumn(
      'order',
      new TableColumn({
        name: 'nonCommercialTruckId',
        type: 'integer',
        isNullable: true,
      }),
    );

    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_89513b1a13a237f942fdcdb800b" FOREIGN KEY ("nonCommercialTruckId") REFERENCES "non_commercial_truck"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `SET LOCAL search_path TO '${(queryRunner.connection.options as any).schema}',public,postgis`,
      [],
    );

    // here will go your code for "down"
    await queryRunner.query(`DROP TABLE "non_commercial_truck"`);
    await queryRunner.dropColumn('order', 'nonCommercialTruckId');
    await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_89513b1a13a237f942fdcdb800b"`);

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }
}
