import { QueueEvents } from 'bullmq';
import yargs from 'yargs/yargs';
import { createFacilitySrn } from '../src/utils/srn';

/* eslint no-console: 0 */
const ELASTIC_ENTITIES = ['Order', 'CustomerTruck'];

function initQueueEventListener(queue: string) {
  const queueEvents = new QueueEvents(queue);

  queueEvents.on('progress', ({ jobId, data }) => {
    console.log(`${queue} job=${jobId} progress ${Math.floor(Number(data))}%`);
  });

  queueEvents.on('waiting', ({ jobId }) => {
    console.log(`${queue} job=${jobId} is waiting`);
  });

  queueEvents.on('drained', () => {
    process.exit();
  });

  queueEvents.on('completed', ({ jobId }) => {
    console.log(`${queue} job=${jobId} completed`);
  });

  queueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`${queue} job=${jobId} failed`, failedReason);
  });
}

yargs(process.argv.slice(2))
  .usage('Usage: $0 populate-entity [options]')
  .command(
    'populate-entity',
    'Run populate-entity event for specific tenant',
    function (yargs) {
      return yargs
        .option('tenant', {
          alias: 't',
          type: 'string',
          describe: 'tenant name',
          required: true,
        })
        .option('businessUnitId', {
          alias: 'bu',
          type: 'number',
          describe: 'business unit id',
          required: true,
        })
        .option('entity', {
          alias: 'e',
          describe: 'entity name',
          choices: ELASTIC_ENTITIES,
        })
        .option('forceReindex', {
          alias: 'force',
          type: 'boolean',
          describe: 'force recreate index and populate',
          default: false,
        });
    },
    async function (argv) {
      const { populateEntityQueue, QUEUE_NAME } = await import(
        '../src/modules/recycling/queues/populateEntity'
      );
      initQueueEventListener(QUEUE_NAME);

      const entities = argv.entity ? [argv.entity] : ELASTIC_ENTITIES;

      for (const entity of entities) {
        await populateEntityQueue.add('populate-entity', {
          resource: createFacilitySrn({
            tenantName: argv.tenant,
            businessUnitId: argv.businessUnitId,
          }),
          name: entity,
          forceReindex: argv.forceReindex,
        });
      }
    },
  )
  .command(
    'populate-elastic-search-index',
    'Run populate-entity for each tenant',
    function (yargs) {
      return yargs.option('forceReindex', {
        alias: 'force',
        type: 'boolean',
        describe: 'force recreate index and populate',
        default: false,
      });
    },
    async function (argv) {
      const { populateElasticSearchIndexQueue, QUEUE_NAME } = await import(
        '../src/modules/recycling/queues/populateElasticSearchIndex'
      );
      initQueueEventListener(QUEUE_NAME);

      await populateElasticSearchIndexQueue.add('populate-elastic-search-index', {
        forceReindex: argv.forceReindex,
      });
    },
  )
  .example(
    '$0 populate-entity -t rec_tenant -e Order --bu 1',
    'populate entity "Order" in "rec_tenant" with businessUnitId = 1',
  )
  .example(
    '$0 populate-entity -t rec_tenant -e Order --bu 1 --force',
    'populate entity "Order" in "rec_tenant" with businessUnitId = 1',
  )
  .example('$0 populate-elastic-search-index', 'populate all resource entities').argv;
