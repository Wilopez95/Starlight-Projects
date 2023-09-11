import { Resolver, InputType, Field } from 'type-graphql';

import {
  HaulingDestination,
  HaulingDestinationInput,
  HaulingDestinationUpdateInput,
} from '../../../../services/core/types/HaulingDestination';
import { HaulingDestinationHttpService } from '../../../../services/core/haulingDestination';
import { createHaulingCRUDResolver } from '../../../../graphql/createHaulingCRUDResolver';

@InputType()
export class DestinationFilter {
  @Field(() => Boolean, { defaultValue: true })
  activeOnly!: boolean;
}

const BaseResolver = createHaulingCRUDResolver<HaulingDestination>(
  {
    EntityInput: HaulingDestinationInput,
    EntityUpdateInput: HaulingDestinationUpdateInput,
    FilterInput: DestinationFilter,
    service: new HaulingDestinationHttpService(),
    permissionsPrefix: 'recycling',
    name: 'Destination',
  },
  HaulingDestination,
);

@Resolver(() => HaulingDestination)
export default class DestinationResolver extends BaseResolver {}
