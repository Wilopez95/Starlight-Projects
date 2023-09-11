import { elasticSearch } from '../../../../services/elasticsearch';
import { TENANT_INDEX } from '../../../../constants/searchIndices';
import { JobWithLogger } from '../workerWithLogger';

export const createAuditLogTemplate = async (job: JobWithLogger<unknown>): Promise<void> => {
  try {
    const { body: exists } = await elasticSearch.client.indices.existsIndexTemplate({
      name: TENANT_INDEX.auditLogs,
    });

    if (!exists) {
      await elasticSearch.client.indices.putIndexTemplate({
        name: TENANT_INDEX.auditLogs,
        create: true,
        body: {
          index_patterns: [`srn.*.recycling.*.${TENANT_INDEX.auditLogs}__*`],
          priority: 1,
          template: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 1,
            },
          },
        },
      });

      job.info(`${TENANT_INDEX.auditLogs} index template successfully created`);
    }
  } catch (e) {
    job.error(`Failed to create ${TENANT_INDEX.auditLogs} index template`, e);
  }
};
