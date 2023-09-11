import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterThresholdColumns1663627202889 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DO $$
    DECLARE
            _current_schema varchar;
    BEGIN        
            for _current_schema in select distinct(name) FROM public.tenants
            LOOP
            EXECUTE format('ALTER TABLE %I.threshold_items_historical ADD new_column numeric;', _current_schema);
            EXECUTE format('UPDATE %I.threshold_items_historical SET new_column = price_to_display;', _current_schema);
            EXECUTE format('ALTER TABLE %I.threshold_items_historical DROP price_to_display;', _current_schema);
            EXECUTE format('ALTER TABLE %I.threshold_items_historical RENAME new_column TO price_to_display;', _current_schema);
            END LOOP;
    END $$;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
