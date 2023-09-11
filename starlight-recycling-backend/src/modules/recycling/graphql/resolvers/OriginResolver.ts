import { Resolver, InputType, Field } from 'type-graphql';

import {
  HaulingOrigin,
  OriginInput,
  OriginUpdateInput,
} from '../../../../services/core/types/HaulingOrigin';
import { HaulingOriginHttpService } from '../../../../services/core/haulingOrigin';
import { createHaulingCRUDResolver } from '../../../../graphql/createHaulingCRUDResolver';

@InputType()
export class OriginFilter {
  @Field(() => Boolean, { defaultValue: true })
  activeOnly!: boolean;
}

const BaseResolver = createHaulingCRUDResolver<HaulingOrigin>(
  {
    EntityInput: OriginInput,
    EntityUpdateInput: OriginUpdateInput,
    FilterInput: OriginFilter,
    service: new HaulingOriginHttpService(),
    permissionsPrefix: 'recycling',
    name: 'Origin',
  },
  HaulingOrigin,
);

@Resolver(() => HaulingOrigin)
export default class OriginResolver extends BaseResolver {}
