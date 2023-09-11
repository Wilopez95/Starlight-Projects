# Copy Tenant from Remote to Local DB

## 1. Create DB dumps

- ### 1.1. migrations

  Export `"admin"."migrations"` table with pg_dump from the desired DB.

  If you already have the table locally and there was no squash of migrations before - do export with `data-only` flag.

  Examples:

  `pg_dump --dbname=core --file=/Users/steven/Desktop/hauling-admin-migrations-2022_03_30_13_45_43-dump.sql --inserts --schema=admin --table=admin.migrations --data-only --username=starlight --host=localhost --port=5435 -W`

  `pg_dump --dbname=core --file=/Users/steven/Desktop/hauling-admin-migrations-2022_03_30_13_45_43-dump.sql --inserts --schema=admin --table=admin.migrations --username=starlight --host=localhost --port=5435 -W`

- ### 1.2. tenant_migrations

  Export `"admin"."tenant_migrations"` table with pg_dump from the desired DB.

  If you already have it locally and there was no squash of migrations before - do export with `data-only` flag.

  Examples:

  `pg_dump --dbname=core --file=/Users/steven/Desktop/hauling-admin-tenant-migrations-2022_03_30_13_45_43-dump.sql --inserts --schema=admin --table=admin.tenant_migrations --data-only --username=starlight --host=localhost --port=5435 -W`

  `pg_dump --dbname=core --file=/Users/steven/Desktop/hauling-admin-tenant-migrations-2022_03_30_13_45_43-dump.sql --schema=admin --table=admin.tenant_migrations --inserts --username=starlight --host=localhost --port=5435 -W`

- ### 1.3. tenant

  Export `"[TENANT]"` schema with pg_dump from the desired DB.

  Make sure to **UNSET** `data-only` flag.

  Example:

  `pg_dump --dbname=core --file=/Users/steven/Downloads/dumps/hauling-tenant-2022_03_30_13_24_42-dump.sql --column-inserts --if-exists --clean --schema=rolloff_solutions --create --username=starlight --host=localhost --port=5435 -U starlight -W`

## 2. Prepare DB dumps

If your local user links to the different tenant name from what you've exported
then you have to perform such manipulations with your DB dumps:

- ### 2.1. Clean up and rename tenant migrations

  `sed -i -n -e "s/', '[TENANT_FROM]', /', '[TENANT_TO]', /g" -e "/[TENANT_TO]/{p;n;}" [PATH_TO_TENANT_MIGRATIONS_DUMP]`

- 2.1.1. Data only dump
  `sed -i -n -e "s/', '[TENANT_FROM]', /', '[TENANT_TO]', /g" -e "/[TENANT_TO]/{p;n;}" [PATH_TO_TENANT_MIGRATIONS_DUMP]`

- 2.1.2. Data + Structure dump
  `sed -i "s/', '[TENANT_FROM]', /', '[TENANT_TO]', /g" [PATH_TO_TENANT_MIGRATIONS]`

      In this case you'll need later to clean up imported table and remove redundant tenants (see [Clean up imported tenants_migration table](#Clean up imported tenants_migration table) below)

- ### 2.2. Rename tenant schema

  `sed -i "s/CREATE SCHEMA [TENANT_FROM]/CREATE SCHEMA [TENANT_TO]/g;s/ [TENANT_FROM]./ [TENANT_TO]./g;s/setval('[TENANT_FROM]./setval('[TENANT_TO]./g" [PATH_TO_SCHEMA_DUMP]`

## 3. Clean-up local DB

- 3.1. Drop `"[TENANT]"` schema
- 3.2. Drop `"admin"."migrations"` table if there was squash of migrations before
- 3.3. Drop `"admin"."tenant_migrations"` table if there was squash of migrations before

## 4. Import DB dumps

- 4.1. Import `"admin"."migrations"` table

`export PGPASSWORD='[DB_PASSWORD]'; psql -h [DB_HOST] -d [DB_NAME] -U [DB_USER] -p [DB_PORT] < [PATH_TO_MIGRATIONS_DUMP]`

- 4.2. Import `"admin"."tenant_migrations"` table

`export PGPASSWORD='[DB_PASSWORD]'; psql -h [DB_HOST] -d [DB_NAME] -U [DB_USER] -p [DB_PORT] < [PATH_TO_TENANT_MIGRATIONS_DUMP]`

### Clean up imported tenants_migration table

If you have imported **Data + Structure** dump then remove redundant tenants:

`DELETE FROM "admin"."tenant_migrations" WHERE tenant != '[TENANT_TO]';`

- 4.3. Import `"[TENANT]"` schema

`export PGPASSWORD='[DB_PASSWORD]'; psql -h [DB_HOST] -d [DB_NAME] -U [DB_USER] -p [DB_PORT] < [PATH_TO_SCHEMA_DUMP]`
