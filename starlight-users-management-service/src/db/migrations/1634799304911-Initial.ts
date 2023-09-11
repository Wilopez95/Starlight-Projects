import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1634799304911 implements MigrationInterface {
  name = 'Initial1634799304911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "resource_type_enum" AS ENUM('GLOBAL', 'RECYCLING', 'HAULING', 'CUSTOMER_PORTAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "resource" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "srn" text NOT NULL, "id" text, "image" text, "label" text, "subLabel" text, "loginUrl" text, "type" "resource_type_enum" NOT NULL, "tenantId" text, CONSTRAINT "PK_5697ae76e840c7dae579d85985a" PRIMARY KEY ("srn"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "permission_type_enum" AS ENUM('GLOBAL', 'RECYCLING', 'HAULING', 'CUSTOMER_PORTAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "type" "permission_type_enum" NOT NULL, CONSTRAINT "UQ_240853a0c3353c25fb12434ad33" UNIQUE ("name"), CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_policy" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "access" jsonb NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "resource" text NOT NULL, "userId" text, CONSTRAINT "PK_abf96fbbf39a06d704c652e1c39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "user_status_enum" AS ENUM('ACTIVE', 'DISABLED')`);
    await queryRunner.query(
      `CREATE TABLE "user" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "email" text NOT NULL, "status" "user_status_enum" NOT NULL DEFAULT 'ACTIVE', "name" text NOT NULL, "firstName" text, "lastName" text, "phones" text NOT NULL DEFAULT '[]', "address" jsonb, "title" text, "hasPersonalPermissions" boolean NOT NULL DEFAULT false, "tenantId" text, "tenantName" text, "salesRepresentatives" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_policy" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "access" jsonb NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "resource" text NOT NULL, "roleId" uuid, CONSTRAINT "PK_b723275101037b5c4b14a176064" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "role_status_enum" AS ENUM('ACTIVE', 'DISABLED')`);
    await queryRunner.query(
      `CREATE TABLE "role" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text NOT NULL, "status" "role_status_enum" NOT NULL DEFAULT 'ACTIVE', "tenantId" text, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "role_policy_template_resourcetype_enum" AS ENUM('GLOBAL', 'RECYCLING', 'HAULING', 'CUSTOMER_PORTAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_policy_template" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "access" jsonb NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "resourceType" "role_policy_template_resourcetype_enum" NOT NULL, "roleId" uuid, CONSTRAINT "UQ_6ff7a2135ced6cce24dfc078536" UNIQUE ("resourceType", "roleId"), CONSTRAINT "PK_db6b3645841b20aad8b3b4a5011" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles_role" ("userId" text NOT NULL, "roleId" uuid NOT NULL, CONSTRAINT "PK_b47cd6c84ee205ac5a713718292" PRIMARY KEY ("userId", "roleId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON "user_roles_role" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON "user_roles_role" ("roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_policy" ADD CONSTRAINT "FK_c2d3764cb1949fbf29f40c29c10" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" ADD CONSTRAINT "FK_30898f089b316e02ecce54e0f01" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy_template" ADD CONSTRAINT "FK_bf1b27e4ebd1e8460bee37562dc" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_5f9286e6c25594c6b88c108db77" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_4be2f7adf862634f5f803d246b8" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_4be2f7adf862634f5f803d246b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_5f9286e6c25594c6b88c108db77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy_template" DROP CONSTRAINT "FK_bf1b27e4ebd1e8460bee37562dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" DROP CONSTRAINT "FK_30898f089b316e02ecce54e0f01"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_policy" DROP CONSTRAINT "FK_c2d3764cb1949fbf29f40c29c10"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_4be2f7adf862634f5f803d246b"`);
    await queryRunner.query(`DROP INDEX "IDX_5f9286e6c25594c6b88c108db7"`);
    await queryRunner.query(`DROP TABLE "user_roles_role"`);
    await queryRunner.query(`DROP TABLE "role_policy_template"`);
    await queryRunner.query(`DROP TYPE "role_policy_template_resourcetype_enum"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TYPE "role_status_enum"`);
    await queryRunner.query(`DROP TABLE "role_policy"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
    await queryRunner.query(`DROP TABLE "user_policy"`);
    await queryRunner.query(`DROP TABLE "permission"`);
    await queryRunner.query(`DROP TYPE "permission_type_enum"`);
    await queryRunner.query(`DROP TABLE "resource"`);
    await queryRunner.query(`DROP TYPE "resource_type_enum"`);
  }
}
