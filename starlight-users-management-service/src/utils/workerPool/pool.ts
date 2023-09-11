import EventEmitter from 'events';
import { type WorkerOptions } from 'worker_threads';
import { nanoid } from 'nanoid';

import { logger } from '../../services/logger';

import WorkerThread from './worker';
import { type Task, type ExecuteTaskOptions, type WorkersPoolOptions } from './types';

const getEventNames = (taskId: string): [string, string] => [
  `${taskId}-success`,
  `${taskId}-error`,
];

export default class WorkersPool<T, R> {
  private workers: WorkerThread<T, R>[] = [];

  private queue: Task<T, R>[] = [];

  private threadsCount: number;

  private scriptPath: string;

  private uniqueItemsOnly: boolean;

  private pendingTasks: Set<string> = new Set();

  private rawWorkerOptions?: WorkerOptions;

  private workersEventBus: EventEmitter;

  constructor(params: WorkersPoolOptions) {
    this.threadsCount = params.threadsCount;
    this.scriptPath = params.scriptPath;
    this.rawWorkerOptions = params.rawWorkerOptions;
    this.workersEventBus = new EventEmitter();
    this.uniqueItemsOnly = !!params.uniqueItemsOnly;

    this.initializeWorkers();

    this.workersEventBus.on('worker-ready', (worker: WorkerThread<T, R>) => {
      this.processQueueItem(worker);
    });
  }

  private createWorker() {
    const worker = new WorkerThread<T, R>(this.scriptPath, this.rawWorkerOptions);

    worker.on('ready', (worker: WorkerThread<T, R>) =>
      this.workersEventBus.emit('worker-ready', worker),
    );

    worker.once('exit', () => {
      logger.info('Worker was terminated. Replacing with new one...');
      this.repInitWorker(worker);
    });

    return worker;
  }

  private getTaskId(key?: string) {
    if (key && this.uniqueItemsOnly) {
      return key;
    }

    return nanoid();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.threadsCount; i++) {
      this.workers.push(this.createWorker());
    }
  }

  private repInitWorker(worker: WorkerThread<T, R>): void {
    const i = this.workers.indexOf(worker);
    this.workers[i] = this.createWorker();
  }

  private getReadyWorker(): WorkerThread<T, R> | null {
    const worker = this.workers.find(worker => worker.ready);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return worker || null;
  }

  private processQueueItem(worker: WorkerThread<T, R>): void {
    const task = this.queue.shift();

    if (!task) {
      return;
    }

    const { payload, taskId } = task;

    const [successEvent, errorEvent] = getEventNames(taskId);

    worker
      .run(payload)
      .then((result: R) => this.workersEventBus.emit(successEvent, result))
      .catch(error => {
        void worker.terminate();

        logger.error(error, 'Worker was terminated due to error');

        this.workersEventBus.emit(errorEvent, error);
      });
  }

  private cleanupPendingTask = (taskId: string) => {
    const eventNames = this.workersEventBus.eventNames();

    if (eventNames.some(name => (name as string).includes(taskId))) {
      return;
    }

    this.pendingTasks.delete(taskId);
  };

  async putTaskInQueue(payload: T, { key }: ExecuteTaskOptions = {}): Promise<R> {
    const taskId = this.getTaskId(key);

    const [successEvent, errorEvent] = getEventNames(taskId);

    return new Promise((resolve, reject) => {
      const onSuccess = (result: R) => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        this.workersEventBus.removeListener(errorEvent, onError);
        this.cleanupPendingTask(taskId);
        resolve(result);
      };

      const onError = (err: unknown) => {
        this.workersEventBus.removeListener(successEvent, onSuccess);
        this.cleanupPendingTask(taskId);
        reject(err);
      };

      this.workersEventBus.once(successEvent, onSuccess);
      this.workersEventBus.once(errorEvent, onError);

      if (!this.uniqueItemsOnly || !key || !this.pendingTasks.has(taskId)) {
        if (this.uniqueItemsOnly && key) {
          this.pendingTasks.add(key);
        }

        const task: Task<T, R> = { payload, resolve, reject, taskId };

        this.queue.push(task);
        const worker = this.getReadyWorker();

        if (worker) {
          this.processQueueItem(worker);
        }
      }
    });
  }
}
