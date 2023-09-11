import { Entity } from 'typeorm';
import { ObjectType } from 'type-graphql';

import { BaseHistoryEntity } from '../../../entities/BaseHistoryEntity';

@Entity()
@ObjectType()
export default class OrderHistory extends BaseHistoryEntity {}

/**
 * Approach to create history records for entities with no population needs. ⤵️
 * registerHistoryForEntity(Entity (e.g. JobSite), EntityHistory);
 *
 *
 * But, for Order historical records we have to get populated from ids fields.
 * For now we use dedicated queue in recycling/workers/populateOrderIndexed
 * */
