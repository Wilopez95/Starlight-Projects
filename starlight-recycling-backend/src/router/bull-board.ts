import serve from 'koa-static';
import Router, { IMiddleware } from 'koa-router';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import { AppState, Context } from '../types/Context';
import path from 'path';
import { set } from 'lodash';
import { Queue } from 'bull';
import { queues } from '../modules/recycling/queues';

// eslint-disable-next-line
// @ts-ignore
import { queuesHandler } from 'bull-board/dist/routes/queues';
// eslint-disable-next-line
// @ts-ignore
import { retryAll } from 'bull-board/dist/routes/retryAll';
// eslint-disable-next-line
// @ts-ignore
import { retryJob } from 'bull-board/dist/routes/retryJob';
// eslint-disable-next-line
// @ts-ignore
import { promoteJob } from 'bull-board/dist/routes/promoteJob';
// eslint-disable-next-line
// @ts-ignore
import { cleanAll } from 'bull-board/dist/routes/cleanAll';
// eslint-disable-next-line
// @ts-ignore
import { cleanJob } from 'bull-board/dist/routes/cleanJob';
import { Queue as QueueMq } from 'bullmq';

export interface BullBoardQueue {
  queue: Queue | QueueMq;
}

export interface BullBoardQueues {
  [key: string]: BullBoardQueue;
}

const bullBoardQueues: BullBoardQueues = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrapAsync = (fn: any): IMiddleware<AppState, Context> => async (ctx): Promise<any> => {
  set(ctx.req, 'app.locals.bullBoardQueues', bullBoardQueues);

  return fn(ctx.req, ctx.res);
};

const router = new Router<AppState, Context>();
router.use(bodyParser());
router.use(json());
router.use(async (ctx, next) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx.req as any).params = ctx.params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx.res as any).json = (body: any): void => {
    ctx.body = body;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx.res as any).status = (status: number): any => {
    ctx.status = status;

    return ctx.res;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx.res as any).sendStatus = (status: number): any => {
    ctx.status = status;

    return ctx.res;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx.res as any).send = (body: any): any => {
    ctx.body = body;

    return ctx.res;
  };

  await next();
});

const cwd = process.cwd();

const servFn = serve(path.resolve(cwd, './node_modules/bull-board/static'));

router.use(
  '/static(.*)',
  async (ctx, next): Promise<void> => {
    const parsed = path.parse(ctx.path);

    ctx.path = `${parsed.name}${parsed.ext}`;

    await servFn(ctx, next);
  },
);

const getIndexContent = (basePath: string): string => {
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no"/>
    <title>Bull Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500&display=swap" rel="stylesheet">
    <link href="${basePath}/static/main.5e29ce3debf2d1cefaaa.css" rel="stylesheet">
    </head>
    <body>
    <div id="root">Loading...</div>
    <script src="${basePath}/static/0.bundle.7992b5ab68b75ccbf41b.js"></script><script src="${basePath}/static/bundle.fc1bc92cecc53ea32720.js"></script></body></html>
  `;
};

router.get('/', async (ctx) => {
  const basePath = ctx.url.replace(/\/$/, '');

  ctx.body = getIndexContent(basePath);
});
router.get('/queue/:queueName', async (ctx) => {
  const basePath = ctx.url;

  ctx.body = getIndexContent(basePath);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addQuery = async (ctx: any, next: any): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx.req as any).query = ctx.query;
  await next();
};

const apiRouter = new Router<AppState, Context>();
apiRouter.use(async (ctx, next) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(ctx as any).userInfo) {
    ctx.status = 401;

    return;
  }

  await next();
});
apiRouter.use(addQuery);

apiRouter.get('/queues', addQuery, wrapAsync(queuesHandler));
apiRouter.get('/queues/', addQuery, wrapAsync(queuesHandler));
apiRouter.put('/queues/:queueName/retry', addQuery, wrapAsync(retryAll));
apiRouter.put('/queues/:queueName/:id/retry', addQuery, wrapAsync(retryJob));
apiRouter.put('/queues/:queueName/:id/clean', addQuery, wrapAsync(cleanJob));
apiRouter.put('/queues/:queueName/:id/promote', addQuery, wrapAsync(promoteJob));
apiRouter.put('/queues/:queueName/clean/:queueStatus', addQuery, wrapAsync(cleanAll));

type Q = Queue | QueueMq;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setQueues = (bullQueues: ReadonlyArray<Q>): any => {
  bullQueues.forEach((queue: Queue | QueueMq) => {
    const name = queue instanceof QueueMq ? queue.toKey('~') : queue.name;

    bullBoardQueues[name] = {
      queue,
    };
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const replaceQueues = (bullQueues: ReadonlyArray<Q>): any => {
  const queuesToPersist: string[] = bullQueues.map((queue) => queue.name);

  Object.keys(bullBoardQueues).forEach((name) => {
    if (queuesToPersist.indexOf(name) === -1) {
      delete bullBoardQueues[name];
    }
  });

  return setQueues(bullQueues);
};

setQueues(queues);

router.use('/api', apiRouter.routes(), apiRouter.allowedMethods());

export { router };
