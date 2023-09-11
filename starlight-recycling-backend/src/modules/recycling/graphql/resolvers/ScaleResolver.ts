import { createCRUDResolver } from '../../../../graphql/createCRUDResolver';
import Scale, { ScaleConnectionStatus, ScaleUnitOfMeasurement } from '../../entities/Scale';
import { Field, InputType, Int, Resolver } from 'type-graphql';
import { FindConditions } from 'typeorm';

@InputType()
export class ScaleInput {
  @Field(() => String)
  name!: string;

  @Field(() => ScaleConnectionStatus)
  connectionStatus!: ScaleConnectionStatus;

  @Field(() => Int, { nullable: true })
  computerId?: number;

  @Field(() => String, { nullable: true })
  deviceName?: string;

  @Field(() => Int, { nullable: true })
  deviceNumber?: number;

  @Field(() => ScaleUnitOfMeasurement, { nullable: true })
  unitOfMeasurement?: ScaleUnitOfMeasurement;
}

@InputType()
export class ScaleUpdateInput extends ScaleInput {
  @Field()
  id!: number;
}

@InputType()
export class ScaleFilterInput {
  @Field(() => ScaleConnectionStatus, { nullable: true })
  connectionStatus: ScaleConnectionStatus | null = null;
}

const BaseResolver = createCRUDResolver(
  {
    EntityInput: ScaleInput,
    EntityUpdateInput: ScaleUpdateInput,
    FilterInput: ScaleFilterInput,
    idType: Int,
    permissionsPrefix: 'recycling',
    permissions: {
      entity: [
        'recycling:SelfService:view',
        'recycling:Customer:view',
        'recycling:YardConsole:perform',
      ],
      list: [
        'recycling:SelfService:list',
        'recycling:Customer:list',
        'recycling:YardConsole:perform',
      ],
    },
    modifyListParamsWithFilters(filter: ScaleFilterInput, params): Promise<void> | void {
      const where = params.where as FindConditions<Scale>;

      if (filter.connectionStatus !== null) {
        where.connectionStatus = filter.connectionStatus;
      }
    },
  },
  Scale,
);

@Resolver(Scale)
export default class ScaleResolver extends BaseResolver {}
