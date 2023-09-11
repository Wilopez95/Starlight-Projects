import { Resolver, Authorized, Mutation, Arg } from 'type-graphql';
import {
  populateElasticSearchIndexQueue,
  QUEUE_NAME as PopulateElasticSearchIndexQueueName,
} from '../../../../modules/recycling/queues/populateElasticSearchIndex';
import {
  populateEntityQueue,
  QUEUE_NAME as PopulateEntityQueueName,
} from '../../../../modules/recycling/queues/populateEntity';
import { PopulateEntityEvent } from '../types/PopulateEntity';

@Resolver()
export default class RecyclingQueuesResolver {
  @Authorized('starlight-admin')
  @Mutation(() => Boolean, {
    description: `send populateElasticSearchIndex event to ${PopulateElasticSearchIndexQueueName} in Recycling`,
  })
  async sendPopulateElasticSearchIndexInRecycling(): Promise<boolean> {
    populateElasticSearchIndexQueue.add('populate-elastic-search-index', {});

    return true;
  }

  @Authorized('starlight-admin')
  @Mutation(() => Boolean, {
    description: `send populateEntity event to ${PopulateEntityQueueName} in Recycling`,
  })
  async sendPopulateEntityInRecycling(
    @Arg('populateEvent', () => PopulateEntityEvent) populateEvent: PopulateEntityEvent,
  ): Promise<boolean> {
    populateEntityQueue.add('populate-entity', populateEvent);

    return true;
  }
}
