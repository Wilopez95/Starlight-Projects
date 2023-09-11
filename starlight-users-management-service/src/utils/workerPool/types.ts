import { type WorkerOptions } from 'worker_threads';

export interface Task<T, R> {
  payload: T;
  taskId: string;
  resolve: (value: R) => void;
  reject: (reason?: unknown) => void;
}

export interface WorkersPoolOptions {
  threadsCount: number;
  scriptPath: string;
  uniqueItemsOnly?: boolean;
  rawWorkerOptions?: WorkerOptions;
}

export interface ExecuteTaskOptions {
  key?: string;
}
