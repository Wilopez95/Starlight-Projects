import 'reflect-metadata';
import { DataSource } from 'typeorm';
import Entity from './database/entities/_entitiesAdmin';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER, DB_LOGGING } from './config/config';
import { alterThresholdColumns1663627202889 } from './database/migration/1663627202889-alterThresholdColumns';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: true, //Should no run in prod
  logging: DB_LOGGING === 'true',
  entities: Entity.entities,
  //entities: [`${__dirname}/**/database/entities/admin/*{ts,js}`],
  migrations: [alterThresholdColumns1663627202889],
  // migrations: [`${__dirname}/**/database/migratios/*{ts,js}`],
  subscribers: ['./database/subscribers/**'],
  migrationsTableName: 'migrations',
});
