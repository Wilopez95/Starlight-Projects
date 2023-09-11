import os from 'os';
import { Worker as QueueWorker, Job } from 'bullmq';
import { client as redis } from '../../../services/redis';
import { LogFn } from 'pino';
import { createLogger } from '../../../services/logger';
import { isObject, pick } from 'lodash';

const HOSTNAME = os.hostname();
const workersLogger = createLogger({
  prettyPrint: {
    messageFormat: 'queue={queue}, jobId={jobId} - {msg} ',
  },
});

export interface JobWithResourceData {
  resource: string;
}

export interface JobWithLogger<T> extends Job<T> {
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

export type Worker<J extends JobWithResourceData> = QueueWorker<JobWithLogger<J>>;

export const createWorker = <T>(
  qeueName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (job: JobWithLogger<T>) => Promise<any>,
): QueueWorker<T> => {
  const logger = workersLogger.child({
    queue: qeueName,
    hostname: HOSTNAME,
  });

  const worker = new QueueWorker<T>(
    qeueName,
    async (job: Job) => {
      const log = logger.child({
        jobId: job.id,
        data: job.data,
      });

      const jobWithLogger = job as JobWithLogger<T>;
      jobWithLogger.info = log.info.bind(log);
      jobWithLogger.error = log.error.bind(log);
      jobWithLogger.warn = log.warn.bind(log);

      const _updateProgress = job.updateProgress.bind(job);
      jobWithLogger.updateProgress = (progress) => {
        if (isObject(progress)) {
          log.info(progress, 'Job Progress');
        } else {
          log.info(`Job progress: ${progress}`);
        }

        return _updateProgress(progress);
      };

      try {
        await fn(jobWithLogger);
      } catch (e) {
        jobWithLogger.error(e, `Job failed`);

        if (e.response) {
          jobWithLogger.error(pick(e.response, ['data', 'status']), `error response`);
        }
      }
    },
    { connection: redis },
  );

  worker.on('completed', (job) => {
    logger.info(
      {
        queue: qeueName,
        jobId: job.id,
      },
      `Worker for ${qeueName}: job ${job.id} has completed!`,
    );
  });

  worker.on('failed', (job, err) => {
    logger.error(err, `Worker for ${qeueName}: job ${job.id} has failed with ${err.message}`);
  });

  return worker;
};
