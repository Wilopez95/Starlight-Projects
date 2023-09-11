import { elasticSearch } from '../elasticsearch';
import { QueryContext } from '../../types/QueryContext';

interface PublishBody {
  ctx: QueryContext;
  indexName: string;
  schemaName: string;
  document: any;
}

export const publish = ({ ctx, indexName, document }: PublishBody) => {
  setImmediate(() => {
    try {
      elasticSearch.indexDocument(indexName, document);
    } catch (error) {
      ctx.logger.error(error, `Error while indexing audit log entity with id ${document.entityId}`);
    }
  });
};
