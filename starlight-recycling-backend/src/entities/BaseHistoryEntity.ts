/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseEntity as BaseEntityClass,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Column,
  BeforeInsert,
  getMetadataArgsStorage,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { get, has, omit } from 'lodash';
import { Field, ObjectType } from 'type-graphql';
import Action from './AuditEntityAction';
import BaseEntityWithHistory from './BaseEntityWithHistory';
import BaseEntityWithAudit from './BaseEntityWithAudit';
import { EntitySubscriberMetadataArgs } from 'typeorm/metadata-args/EntitySubscriberMetadataArgs';
import logger from '../services/logger';
import { EntityPersistExecutor } from 'typeorm/persistence/EntityPersistExecutor';
import { GraphQLScalarType } from 'graphql';
import { instanceToPlain } from 'class-transformer';
import { getFacilityEntitiesAndConnection } from '../modules/recycling/utils/facilityConnection';
import getContextualizedEntity from '../utils/getContextualizedEntity';
import { Context } from '../types/Context';

export const HistoryDataScalar = new GraphQLScalarType({
  name: 'HistoryDataScalar',
  description: 'A Scalar that represents data in history',
  parseValue(value: Record<string, unknown>): Record<string, unknown> {
    return value; // get as is
  },
  serialize(value: Record<string, unknown>): Record<string, unknown> {
    return value; // send as is
  },
});

@ObjectType({ isAbstract: true })
export class BaseHistoryEntity extends BaseEntityClass {
  constructor(item?: BaseEntityWithAudit | BaseEntityWithHistory) {
    super();

    if (item) {
      this.fillIn(item);
    }
  }

  private fillIn(item: BaseEntityWithAudit | BaseEntityWithHistory): void {
    this.data = omit(instanceToPlain(item), ['_userInfo']);
    this.performedBy = item.performedBy;
    this.reason = item.reason;
    this.action = item.action;

    if (has(item, 'uuid')) {
      this.uuid = get(item, 'uuid');
    }

    if (has(item, 'id')) {
      this.id = get(item, 'id');
    }
  }

  @PrimaryColumn('uuid')
  uuid!: string;

  @Column()
  id!: string;

  @Field(() => HistoryDataScalar)
  @Column({ type: 'jsonb' })
  data!: Record<string, any>;

  @Field(() => Date)
  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt!: Date;

  // TODO prevent editing
  @Field(() => Date)
  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt!: Date;
  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  performedBy: string | null = null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  reason: string | null = null;

  @Field(() => Action, { defaultValue: Action.UNKNOWN })
  @Column({ type: 'enum', enum: Action, default: Action.UNKNOWN })
  action: Action = Action.UNKNOWN;

  @BeforeInsert()
  _generateUUIDIfMissing(): void {
    if (this.uuid) {
      return;
    }

    this.uuid = uuidv4();
  }
}

export default BaseHistoryEntity;

export const subscribers: any[] = []; // eslint-disable-line

export const registerHistoryForEntity = <E extends BaseEntityWithAudit>(
  Entity: Function, // eslint-disable-line @typescript-eslint/ban-types
  // eslint-disable-next-line
  // @ts-ignore
  // eslint-disable-next-line
  HistoryEntity: typeof BaseHistoryEntity,
): void => {
  class HistorySubscriber implements EntitySubscriberInterface<E> {
    /**
     * Indicates that this subscriber only listens to Post events.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    listenTo(): string | Function {
      return Entity;
    }

    async recordHistoryItem(
      event: InsertEvent<E> | UpdateEvent<E> | RemoveEvent<E>,
    ): Promise<void> {
      if (!event.entity || !event.entity._userInfo?.resource) {
        return;
      }

      const uuid = uuidv4();
      const historyEntity = new BaseHistoryEntity({ ...event.entity, uuid });

      const [connection, connectionEntities] = await getFacilityEntitiesAndConnection(
        event.entity._userInfo?.resource,
      );

      const ctx = {
        userInfo: event.entity._userInfo,
        log: logger,
        ...connectionEntities,
      } as Context;
      const ContextualizedOrderHistory = getContextualizedEntity(HistoryEntity)(ctx);

      if (!event.entity) {
        logger.warn('Cannot record history for event with no data');

        return;
      }

      await new EntityPersistExecutor(
        connection,
        event.queryRunner,
        'save',
        ContextualizedOrderHistory,
        historyEntity,
        { transaction: false },
      ).execute();
    }

    async afterInsert(event: InsertEvent<E>): Promise<void> {
      await this.recordHistoryItem(event);
    }

    async afterUpdate(event: UpdateEvent<E>): Promise<void> {
      await this.recordHistoryItem(event);
    }

    async afterRemove(event: RemoveEvent<E>): Promise<void> {
      await this.recordHistoryItem(event);
    }
  }

  Object.defineProperty(HistorySubscriber, 'name', { value: `${Entity.name}HistorySubscriber` });

  getMetadataArgsStorage().entitySubscribers.push({
    target: HistorySubscriber,
  } as EntitySubscriberMetadataArgs);

  subscribers.push(HistorySubscriber);
};
