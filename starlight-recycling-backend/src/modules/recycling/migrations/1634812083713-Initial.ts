import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class Initial1634812083713 implements MigrationInterface {
  name = 'Initial1634812083713';

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(`Running migration up: ${this.name}`);

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `SET LOCAL search_path TO '${
        (queryRunner.connection.options as PostgresConnectionOptions).schema
      }',public,postgis`,
      [],
    );

    await queryRunner.query(
      `CREATE TABLE "company" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "yardInstructions" character varying, CONSTRAINT "PK_9aff1f58ef54f29208a3d804d59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`INSERT INTO "company" (id) VALUES (1) ON CONFLICT DO NOTHING`);
    await queryRunner.query(
      `CREATE TYPE "customer_truck_type_enum" AS ENUM('ROLLOFF', 'TRACTORTRAILER', 'DUMPTRUCK')`,
    );
    await queryRunner.query(
      `CREATE TYPE "customer_truck_emptyweightunit_enum" AS ENUM('GRAM', 'TON')`,
    );
    await queryRunner.query(
      `CREATE TYPE "customer_truck_emptyweighttype_enum" AS ENUM('HARDWARE', 'MANUAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "customer_truck" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "customerId" integer NOT NULL, "description" character varying(100), "active" boolean NOT NULL, "type" "customer_truck_type_enum" NOT NULL, "truckNumber" character varying(25) NOT NULL, "licensePlate" character varying(25), "emptyWeight" double precision, "emptyWeightUnit" "customer_truck_emptyweightunit_enum", "emptyWeightType" "customer_truck_emptyweighttype_enum", "emptyWeightSource" character varying, "emptyWeightTimestamp" TIMESTAMP, "emptyWeightUser" character varying, CONSTRAINT "PK_48a349a7760db8cbfd9686cdf01" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_material_distribution" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" integer NOT NULL, "materialId" integer NOT NULL, "value" numeric NOT NULL, "recycle" boolean, CONSTRAINT "PK_3ab9f72efa0328bac23bf662be5" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_miscellaneous_material_distribution" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" integer NOT NULL, "materialId" integer NOT NULL, "quantity" numeric NOT NULL, "recycle" boolean, CONSTRAINT "PK_75e2df77d919c5ecb76e3f64bc6" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_billable_item_pricesourcetype_enum" AS ENUM('MANUAL', 'PRICE_GROUP', 'GLOBAL_RACK_RATES', 'NO_PRICE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_billable_item" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "materialId" integer, "billableItemId" integer, "readonly" boolean NOT NULL DEFAULT false, "orderId" integer NOT NULL, "priceSource" character varying, "priceSourceType" "order_billable_item_pricesourcetype_enum" NOT NULL DEFAULT 'NO_PRICE', "price" numeric NOT NULL DEFAULT '0', "type" character varying NOT NULL, "quantity" numeric NOT NULL DEFAULT '0', "globalRatesLineItemsId" integer, "customRatesGroupLineItemsId" integer, "thresholdId" integer, "applySurcharges" boolean, "globalRatesThresholdsId" integer, "customRatesGroupThresholdsId" integer, "globalRatesServiceId" integer, "customRatesGroupServicesId" integer, CONSTRAINT "PK_f2b33a1fd04fb8b6036ea070695" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(`CREATE TYPE "order_type_enum" AS ENUM('DUMP', 'LOAD', 'NON_SERVICE')`);
    await queryRunner.query(
      `CREATE TYPE "order_status_enum" AS ENUM('IN_YARD', 'WEIGHT_OUT', 'LOAD', 'PAYMENT', 'COMPLETED', 'APPROVED', 'FINALIZED', 'INVOICED', 'ON_THE_WAY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_paymentmethod_enum" AS ENUM('ON_ACCOUNT', 'CASH', 'CHECK', 'CREDIT_CARD')`,
    );
    await queryRunner.query(`CREATE TYPE "order_weightinunit_enum" AS ENUM('GRAM', 'TON')`);
    await queryRunner.query(`CREATE TYPE "order_weightintype_enum" AS ENUM('HARDWARE', 'MANUAL')`);
    await queryRunner.query(`CREATE TYPE "order_weightoutunit_enum" AS ENUM('GRAM', 'TON')`);
    await queryRunner.query(`CREATE TYPE "order_weightouttype_enum" AS ENUM('HARDWARE', 'MANUAL')`);
    await queryRunner.query(
      `CREATE TABLE "order" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "type" "order_type_enum" NOT NULL, "status" "order_status_enum" NOT NULL DEFAULT 'IN_YARD', "note" character varying(250), "WONumber" character varying(200), "PONumber" character varying(200), "weightIn" double precision, "weightOut" double precision, "priceGroupId" integer, "arrivedAt" TIMESTAMP WITH TIME ZONE, "departureAt" TIMESTAMP WITH TIME ZONE, "deleteDate" TIMESTAMP, "customerId" integer NOT NULL, "customerTruckId" integer, "customerJobSiteId" integer, "jobSiteId" integer, "projectId" integer, "materialId" integer, "destinationId" integer, "originDistrictId" integer, "images" text NOT NULL DEFAULT '[]', "paymentMethod" "order_paymentmethod_enum", "creditCardId" character varying, "owner" character varying, "beforeTaxesTotal" numeric NOT NULL DEFAULT '0', "taxTotal" numeric NOT NULL DEFAULT '0', "taxes" text NOT NULL DEFAULT '[]', "grandTotal" numeric NOT NULL DEFAULT '0', "bypassScale" boolean NOT NULL DEFAULT false, "saleRepresentativeId" character varying, "amount" numeric NOT NULL DEFAULT '0', "checkNumber" character varying, "isAch" boolean NOT NULL DEFAULT false, "haulingOrderId" integer, "weightTicketAttachedAt" TIMESTAMP WITH TIME ZONE, "weightTicketCreatorId" text, "weightTicketPrivateUrl" text, "weightInUnit" "order_weightinunit_enum", "weightInType" "order_weightintype_enum", "weightInSource" character varying, "weightInTimestamp" TIMESTAMP, "weightInUser" character varying, "weightOutUnit" "order_weightoutunit_enum", "weightOutType" "order_weightouttype_enum", "weightOutSource" character varying, "weightOutTimestamp" TIMESTAMP, "weightOutUser" character varying, "billableServiceId" integer, "equipmentItemId" integer, "isSelfService" boolean NOT NULL DEFAULT false, "containerId" integer, CONSTRAINT "PK_1f8ecdeb36bcf113d5a872bd6b1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_history_action_enum" AS ENUM('CREATE', 'UPDATE', 'REMOVE', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_history" ("uuid" uuid NOT NULL, "id" character varying NOT NULL, "data" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "performedBy" character varying, "reason" character varying, "action" "order_history_action_enum" NOT NULL DEFAULT 'UNKNOWN', CONSTRAINT "PK_59adef70544bd4d53559980c904" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "scale_connectionstatus_enum" AS ENUM('CONNECTED', 'PENDING_CONNECTION', 'FAILURE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "scale" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL, "connectionStatus" "scale_connectionstatus_enum" NOT NULL DEFAULT 'PENDING_CONNECTION', "computerId" integer, "deviceName" character varying, "deviceNumber" integer, CONSTRAINT "PK_334384bd4d06d48bb0b143a0d52" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_material_distribution" ADD CONSTRAINT "FK_5d8ab412801a9635762c75ea06a" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_miscellaneous_material_distribution" ADD CONSTRAINT "FK_c1ba049138f274982cf9d3102a2" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_billable_item" ADD CONSTRAINT "FK_9c31121fbe96353e3c8d1f41167" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_7ce47629c022cf692910e485a63" FOREIGN KEY ("customerTruckId") REFERENCES "customer_truck"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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

    await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_7ce47629c022cf692910e485a63"`);
    await queryRunner.query(
      `ALTER TABLE "order_billable_item" DROP CONSTRAINT "FK_9c31121fbe96353e3c8d1f41167"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_miscellaneous_material_distribution" DROP CONSTRAINT "FK_c1ba049138f274982cf9d3102a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_material_distribution" DROP CONSTRAINT "FK_5d8ab412801a9635762c75ea06a"`,
    );
    await queryRunner.query(`DROP TABLE "scale"`);
    await queryRunner.query(`DROP TYPE "scale_connectionstatus_enum"`);
    await queryRunner.query(`DROP TABLE "order_history"`);
    await queryRunner.query(`DROP TYPE "order_history_action_enum"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TYPE "order_weightouttype_enum"`);
    await queryRunner.query(`DROP TYPE "order_weightoutunit_enum"`);
    await queryRunner.query(`DROP TYPE "order_weightintype_enum"`);
    await queryRunner.query(`DROP TYPE "order_weightinunit_enum"`);
    await queryRunner.query(`DROP TYPE "order_paymentmethod_enum"`);
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
    await queryRunner.query(`DROP TYPE "order_type_enum"`);
    await queryRunner.query(`DROP TABLE "order_billable_item"`);
    await queryRunner.query(`DROP TYPE "order_billable_item_pricesourcetype_enum"`);
    await queryRunner.query(`DROP TABLE "order_miscellaneous_material_distribution"`);
    await queryRunner.query(`DROP TABLE "order_material_distribution"`);
    await queryRunner.query(`DROP TABLE "customer_truck"`);
    await queryRunner.query(`DROP TYPE "customer_truck_emptyweighttype_enum"`);
    await queryRunner.query(`DROP TYPE "customer_truck_emptyweightunit_enum"`);
    await queryRunner.query(`DROP TYPE "customer_truck_type_enum"`);
    await queryRunner.query(`DROP TABLE "company"`);

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }
}
