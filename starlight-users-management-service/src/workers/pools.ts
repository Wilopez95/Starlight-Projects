import path from 'path';

import { User } from '../entities/User';
import WorkersPool from '../utils/workerPool/pool';

import { THREADS_COUNT } from '../config';

import './singleUser/worker.js';

import { WorkerInput as SingleUserInput } from './singleUser/types';

export const userWorkerPool = new WorkersPool<SingleUserInput, User>({
  threadsCount: Number(THREADS_COUNT),
  scriptPath: path.join(__dirname, './singleUser/worker.import.js'),
  uniqueItemsOnly: true,
});
