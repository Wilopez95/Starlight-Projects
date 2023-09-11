import {
  getMetadataArgsStorage,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { kebabCase, omit } from 'lodash';

import { EntitySubscriberMetadataArgs } from 'typeorm/metadata-args/EntitySubscriberMetadataArgs';
import { EntityWithHistory } from '../db/EntityWithHistory';
import { AMQP_HISTORY_EXCHANGE } from '../config';
import { logger } from './logger';
import { publish } from './amqp/client';

/**
 * It takes an entity and returns a history record
 * @param {T} item - The item to be recorded.
 * @returns A record of the item with the action and the data.
 */
const produceHistoryRecord = <T extends EntityWithHistory>(item: T) => ({
  data: omit(item, ['userInfo', 'action', 'policies', 'roles']),
  action: item.action,
});

export const subscribers: unknown[] = [];

/**
 * It registers a subscriber for the entity.
 * @param Entity - new () => E
 * @returns Nothing.
 */
export const registerHistoryForEntity = <E extends EntityWithHistory>(
  Entity: new () => E,
): void => {
  const queueTopic = `ums.${kebabCase(Entity.name)}`;

  class HistorySubscriber implements EntitySubscriberInterface<E> {
    listenTo(): typeof Entity {
      return Entity;
    }

    async recordHistoryItem(
      event: InsertEvent<E> | UpdateEvent<E> | RemoveEvent<E>,
    ): Promise<void> {
      logger.info('Attempt to publish record history item');

      if (!event.entity) {
        logger.warn('Cannot record history for event with no data');

        return;
      }

      logger.info('Publish record history item - event.entity');
      // logger.info(event.entity);

      const record = produceHistoryRecord(event.entity as EntityWithHistory);

      logger.info('Publish record history item - record');
      try {
        // logger.info(record);
        await publish(AMQP_HISTORY_EXCHANGE, queueTopic, record);
      } catch (error) {
        if (error instanceof Error) {
          logger.error(error, 'Failed to record entity history');
        }
      }
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
