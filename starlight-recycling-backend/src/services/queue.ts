import { Subject, ReplaySubject, Observable, partition } from 'rxjs';
import { Options } from 'amqplib/properties';

export interface Message<T> {
  type: string;
  payload: T;
  assertQueue?: boolean;
}

export interface SubscribeBinding {
  exchange: string;
  assertExchange?: boolean;
  routingKey?: string;
  type: 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string;
  options?: Options.AssertExchange;
}

export interface SubscribeMessage {
  type: string;
  assertQueue?: boolean;
  bindings?: SubscribeBinding[];
}

export const subscribeSubject = new ReplaySubject<SubscribeMessage>();
export const disconnectSubject = new Subject<boolean>();
export const initSubject = new ReplaySubject<boolean>();
export const outMessages = new Subject<Message<unknown>>();
export const inMessages = new Subject<Message<unknown>>();

const partitioned: { [type: string]: Subject<Message<unknown>> } = {};
let restPartion: Observable<Message<unknown>> = inMessages.asObservable();

export const init = (): void => {
  initSubject.next(true);
};

export const disconnect = (): void => {
  disconnectSubject.next(true);
};

export const enqueue = <T>(message: Message<T>): void => {
  outMessages.next(message);
};

export const observeOn = <T>({
  type: onType,
  assertQueue,
  bindings,
}: SubscribeMessage): Observable<Message<T>> => {
  if (!partitioned[onType]) {
    const [filteredMessages, rest] = partition(restPartion, ({ type }) => type === onType);

    partitioned[onType] = new Subject<Message<unknown>>();

    filteredMessages.subscribe((msg) => {
      partitioned[onType].next(msg);
    });

    restPartion = rest;
  }

  const observable = partitioned[onType].asObservable();

  subscribeSubject.next({ type: onType, bindings, assertQueue });

  return observable as Observable<Message<T>>;
};
