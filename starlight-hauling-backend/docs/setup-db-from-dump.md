# Instructions to Backup and Restore Database from Dumps

## PostgreSQL Backup

The basic syntax to backup a PostgreSQL database is shown below:

`pg_dump -U [option] [database_name] > [backup_name]`

A brief explanation of all available option is shown below:

- -U : Specify the PostgreSQL username.
- -W : Force pg_dump command to ask for a password.
- -F : Specify the format of the output file.
- -f : Specify the output file.
- p : Plain text SQL script.
- c : Specify the custom formate.
- d : Specify the directory format.
- t : Specify tar format archive file.

## 1. Install DB Management client

You can use any of pgAdmin4/DBeaver/DataGrip

## 2. Setup connection to locally running (under docker) database instance

You must run your local database via docker (with docker-compose).

You can find credentials to connect to it in the `.env` file.

## 3. Get DB schemas dumps

- ### 3.1. admin schema

  Export `"admin"` schema with pg_dump from the desired DB into `/Users/steven/Downloads/dumps/hauling-admin-2022_03_30_13_24_42-dump.sql`.

  Example:
  You must use the full and proper path to the file location. Cannot use abbreviations like `~/` for home directory.

  `pg_dump --dbname=core --file=/Users/steven/Downloads/dumps/hauling-admin-2022_03_30_13_24_42-dump.sql --column-inserts --if-exists --clean --schema=admin --create --username=starlight --host=localhost --port=5435 -U starlight -W`

- ### 3.2. starlight schema

  Export `"starlight"` schema with pg_dump from the desired DB into `/Users/steven/Downloads/dumps/starlight-tenant-2022_03_30_13_24_42-dump.sql`.

  Example:

  `pg_dump --dbname=core --file=/Users/steven/Downloads/dumps/starlight-tenant-2022_03_30_13_24_42-dump.sql --column-inserts --if-exists --clean --schema=starlight --create --username=starlight --host=localhost --port=5435 -U starlight -W`

- ### 3.3. `"rolloff_solutions"` tenant (because USER TOKEN mocks in shared .env are linked to this tenant)

  Export `"rolloff_solutions"` schema with pg_dump from the desired DB into `/Users/steven/Downloads/dumps/hauling-tenant-2022_03_30_13_24_42-dump.sql`.

  Examples:

  `pg_dump --dbname=core --file=/Users/steven/Downloads/dumps/hauling-tenant-2022_03_30_13_24_42-dump.sql --column-inserts --if-exists --clean --schema=rolloff_solutions --create --username=starlight --host=localhost --port=5435 -U starlight -W`

## 4. Clean-up local DB

To delete old outdated DB schemas:

- 4.1. Make sure that you're connected to your local hauling DB

- 4.2. Drop (cascade) `"admin"`, `"starlight"`, `"rolloff_solutions"` schemas in your local DB

For that connect to the local database and run this SQL query:

```sql
  DROP SCHEMA IF EXISTS "rolloff_solutions" CASCADE;
  DROP SCHEMA IF EXISTS "starlight" CASCADE;
  DROP SCHEMA IF EXISTS "admin" CASCADE;
```

## 5. Import DB dumps

- 5.1. Import `"admin"` schema

This is the pattern:

`export PGPASSWORD='[DB_PASSWORD]'; psql -h [DB_HOST] -d [DB_NAME] -U [DB_USER] -p [DB_PORT] < [PATH_TO_MIGRATIONS_DUMP]`

This is an example:

`export PGPASSWORD='starlight'; psql -h localhost -d core -U starlight -p 5435 < /Users/steven/Downloads/dumps/hauling-admin-2022_03_30_13_24_42-dump.sql`

- 5.2. Import `"starlight"` schema

This is the pattern:

`export PGPASSWORD='[DB_PASSWORD]'; psql -h [DB_HOST] -d [DB_NAME] -U [DB_USER] -p [DB_PORT] < [PATH_TO_MIGRATIONS_DUMP]`

This is an example:

`export PGPASSWORD='starlight'; psql -h localhost -d core -U starlight -p 5435 < /Users/steven/Downloads/dumps/starlight-tenant-2022_03_30_13_24_42-dump.sql`

- 5.3. Import `"rolloff_solutions"` schema

This is the pattern:

`export PGPASSWORD='[DB_PASSWORD]'; psql -h [DB_HOST] -d [DB_NAME] -U [DB_USER] -p [DB_PORT] < [PATH_TO_MIGRATIONS_DUMP]`

This is an example:

`export PGPASSWORD='starlight'; psql -h localhost -d core -U starlight -p 5435 < /Users/steven/Downloads/dumps/hauling-tenant-2022_03_30_13_24_42-dump.sql`

## 6. Clean up imported data

Connect to the local database and run this SQL query:

```sql
DELETE FROM admin.companies WHERE tenant_id NOT IN (1, 2);

DELETE FROM admin.company_mail_settings WHERE tenant_id NOT IN (1, 2);

DELETE FROM admin.tenants WHERE name NOT IN ('rolloff_solutions', 'starlight');

DELETE FROM admin.tenant_migrations WHERE tenant NOT IN ('rolloff_solutions', 'starlight');
```
