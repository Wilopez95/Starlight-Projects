/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class addConstraintToUser1637762427973 implements MigrationInterface {
  name = 'addConstraintToUser1637762427973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user" ADD CONSTRAINT "UQ_fc52434ee9440fcb15b198cf85f" UNIQUE ("email", "tenantId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."user" DROP CONSTRAINT "UQ_fc52434ee9440fcb15b198cf85f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`,
    );
  }
}
