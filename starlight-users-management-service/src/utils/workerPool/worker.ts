/* eslint-disable @typescript-eslint/no-use-before-define */
import { Worker } from 'worker_threads';

import { promiseWithTimer } from './utils';

export default class WorkerThread<T, R> extends Worker {
  public ready = false;

  constructor(...args: ConstructorParameters<typeof Worker>) {
    super(...args);

    this.once('online', () => this.readyToWork());
  }

  private readyToWork(): void {
    this.ready = true;
    this.emit('ready', this);
  }

  async run(payload: T): Promise<R> {
    this.ready = false;

    const taskPromise = new Promise<R>((resolve, reject) => {
      const onTaskProcessed = (res: R) => {
        this.removeListener('error', onTaskRejected);
        this.readyToWork();
        resolve(res);
      };

      const onTaskRejected = (err: unknown) => {
        this.removeListener('message', onTaskProcessed);
        reject(err);
      };

      this.once('message', onTaskProcessed);
      this.once('error', onTaskRejected);

      this.postMessage(payload);
    });

    return promiseWithTimer(taskPromise, 10000);
  }

  override async terminate(): Promise<number> {
    this.once('exit', () => {
      setImmediate(() => {
        this.removeAllListeners();
      });
    });

    return super.terminate();
  }
}
