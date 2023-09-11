import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm';
import {
  EventListenerTypes as ImportedEventListenerTypes,
  EventListenerType as ImportedEventListenerType,
} from 'typeorm/metadata/types/EventListenerTypes';
import BaseEntity from '../entities/BaseEntity';

export const EventListenerTypes = ImportedEventListenerTypes;
export type EventListenerType = ImportedEventListenerType;

export interface ObservableEntityEvent<T extends BaseEntity> {
  entity?: T;
  event?: InsertEvent<T> | UpdateEvent<T> | RemoveEvent<T>;
  type: EventListenerType;
}

export const observableEntitySubject = new Subject<ObservableEntityEvent<BaseEntity>>();

export const observeEntity = <T extends BaseEntity>(
  entityClass: any, // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
): Observable<ObservableEntityEvent<T>> => {
  return observableEntitySubject.pipe(
    filter((event) => event.entity instanceof (entityClass as any)), // eslint-disable-line @typescript-eslint/no-explicit-any
  ) as Observable<ObservableEntityEvent<T>>;
};
