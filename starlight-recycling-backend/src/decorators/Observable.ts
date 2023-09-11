import {
  getMetadataArgsStorage,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  LoadEvent,
} from 'typeorm';

import {
  EventListenerType,
  EventListenerTypes,
  observableEntitySubject,
} from '../services/observableEntity';
import { EntitySubscriberMetadataArgs } from 'typeorm/metadata-args/EntitySubscriberMetadataArgs';
import BaseEntity from '../entities/BaseEntity';

export { EventListenerType, EventListenerTypes } from '../services/observableEntity';

export interface ObservableEntityOptions {
  events: EventListenerType[];
}

export const subscribers: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

export function ObservableEntity<E extends BaseEntity>(
  options: ObservableEntityOptions,
): ClassDecorator {
  const events = options.events;

  return function ObservableEntityDecorator(target): void {
    class ObservableSubscriber implements EntitySubscriberInterface<E> {
      /**
       * Indicates that this subscriber only listen to Post events.
       */
      // eslint-disable-next-line @typescript-eslint/ban-types
      listenTo(): string | Function {
        return target;
      }

      async fireEvent(
        event: InsertEvent<E> | UpdateEvent<E> | RemoveEvent<E> | LoadEvent<E>,
        eventName: EventListenerType,
        entity?: E,
      ): Promise<void> {
        if (events.indexOf(eventName) === -1) {
          return;
        }

        observableEntitySubject.next({
          type: eventName,
          event,
          entity: entity || event.entity,
        });
      }

      async beforeInsert(event: InsertEvent<E>): Promise<void> {
        await this.fireEvent(event, EventListenerTypes.BEFORE_INSERT);
      }

      async beforeRemove(event: RemoveEvent<E>): Promise<void> {
        await this.fireEvent(event, EventListenerTypes.BEFORE_REMOVE);
      }

      async beforeUpdate(event: UpdateEvent<E>): Promise<void> {
        await this.fireEvent(event, EventListenerTypes.BEFORE_UPDATE);
      }

      async afterInsert(event: InsertEvent<E>): Promise<void> {
        await this.fireEvent(event, EventListenerTypes.AFTER_INSERT);
      }

      async afterLoad(entity: E, event: LoadEvent<E>): Promise<void> {
        await this.fireEvent(event, EventListenerTypes.AFTER_LOAD, entity);
      }

      async afterUpdate(event: UpdateEvent<E>): Promise<void> {
        await this.fireEvent(event, EventListenerTypes.AFTER_UPDATE);
      }

      async afterRemove(event: RemoveEvent<E>): Promise<void> {
        await this.fireEvent(event, EventListenerTypes.AFTER_REMOVE);
      }
    }

    Object.defineProperty(ObservableSubscriber, 'name', {
      value: `${target.name}ObservableSubscriber`,
    });

    getMetadataArgsStorage().entitySubscribers.push({
      target: ObservableSubscriber,
    } as EntitySubscriberMetadataArgs);

    subscribers.push(ObservableSubscriber);
  };
}
