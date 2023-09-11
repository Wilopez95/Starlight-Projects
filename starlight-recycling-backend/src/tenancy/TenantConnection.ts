import { Connection, EntitySchema, EntityMetadata, MigrationExecutor } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export interface TenantConnectionOptions {
  schemaName: string;
  connection: Connection;
  entities?: (Function | string | EntitySchema<unknown>)[]; // eslint-disable-line @typescript-eslint/ban-types
  migrations?: (Function | string)[]; // eslint-disable-line @typescript-eslint/ban-types
}

export class TenantConnection extends Connection {
  private connection!: Connection;
  private originalEntitiesMapping: Function[][] = []; // eslint-disable-line @typescript-eslint/ban-types

  readonly options!: PostgresConnectionOptions;

  constructor({ schemaName, connection, entities, migrations }: TenantConnectionOptions) {
    super({
      ...connection.options,
      // eslint-disable-next-line
      // @ts-ignore
      schema: schemaName,
      name: schemaName,
      entities: [...(entities || []), ...(connection.options.entities || [])],
      migrations,
      migrationsRun: true,
    });
    const driverProxyHandler = new Proxy(connection.driver, {
      get: (target, prop, receiver): unknown => {
        if (prop === 'connection') {
          return this;
        }

        if (prop === 'options') {
          return this.options;
        }

        return Reflect.get(target, prop, receiver);
      },
    });

    // eslint-disable-next-line
    // @ts-ignore
    this.driver = driverProxyHandler;
    this.connection = connection;
  }

  // eslint-disable-next-line
  // @ts-ignore
  get isConnected(): boolean {
    return this.connection.isConnected;
  }

  // eslint-disable-next-line
  // @ts-ignore
  set isConnected(value: boolean) {
    // do nothing
  }

  protected findMetadata(
    target: Function | EntitySchema<unknown> | string, // eslint-disable-line @typescript-eslint/ban-types
  ): EntityMetadata | undefined {
    if (typeof target === 'string' || target instanceof EntitySchema) {
      return super.findMetadata(target);
    }

    let metadata = super.findMetadata(target);

    if (metadata) {
      return metadata;
    }

    const originalTarget = this.findOriginalTarget(target);

    if (!originalTarget) {
      return undefined;
    }

    metadata = super.findMetadata(originalTarget);

    if (metadata) {
      // querry runner suppose to use correct target, with our tenant connection
      metadata.target = target;
    }

    return metadata;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  addEntityMapping(newEntity: Function, originalEntity: Function): void {
    this.originalEntitiesMapping.push([newEntity, originalEntity]);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private findOriginalTarget(target: Function): Function | null {
    const foundPair = this.originalEntitiesMapping.find((pair) => pair[0] === target);

    if (foundPair) {
      return foundPair[1];
    }

    return null;
  }

  async init(): Promise<void> {
    this.buildMetadatas();

    const queryRunner = this.createQueryRunner('master');
    const schema = this.options.schema;

    if (!schema) {
      return;
    }

    const hasSchema = await queryRunner.hasSchema(schema);

    if (!hasSchema) {
      // create schema, without transaction schema will be created at some other time
      await queryRunner.startTransaction();
      await queryRunner.createSchema(schema);
      await queryRunner.commitTransaction();
    }

    // if option is set - automatically synchronize a schema
    if (this.options.synchronize) {
      // TODO it might be too dangerouse to have this option
      await this.synchronize();
    }

    // if option is set - automatically synchronize a schema
    if (this.options.migrationsRun) {
      // TODO should we create a schema here or at the creation of PlatformAccount?

      const migrationExecutor = new MigrationExecutor(this, queryRunner);
      migrationExecutor.transaction = this.options.migrationsTransactionMode || 'each';

      await migrationExecutor.executePendingMigrations();
    }

    await queryRunner.release();
  }
}
