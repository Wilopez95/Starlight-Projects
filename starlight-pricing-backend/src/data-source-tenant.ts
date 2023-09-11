import 'reflect-metadata';
import { DataSource } from 'typeorm';
import Entity from './database/entities/_entitiesTenant';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER, DB_LOGGING } from './config/config';
import { testMigration1660258294514 } from './database/migration/1660258294514-testMigration';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  // synchronize: true, //Should no run in prod
  logging: DB_LOGGING === 'true',
  entities: Entity.entities,
  //entities: [`${__dirname}/**/database/entities/admin/*{ts,js}`],
  migrations: [testMigration1660258294514],
  // migrations: [`${__dirname}/**/database/migratios/*{ts,js}`],
  subscribers: ['./database/subscribers/**'],
  migrationsTableName: 'custom_migration_table',
});
