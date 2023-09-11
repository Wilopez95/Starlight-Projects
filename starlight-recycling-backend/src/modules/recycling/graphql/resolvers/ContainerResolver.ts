import { Resolver, InputType } from 'type-graphql';
import { createHaulingCRUDResolver } from '../../../../graphql/createHaulingCRUDResolver';
import {
  Equipment,
  EquipmentInput,
  EquipmentUpdateInput,
} from '../../../../services/core/types/Equipment';
import { EquipmentHttpService } from '../../../../services/core/equipments';
import { HaulingEntityFilter } from '../../../../services/core/types/HaulingEntityFilter';

@InputType()
export class EquipmentFilterInput extends HaulingEntityFilter {}

const BaseResolver = createHaulingCRUDResolver<Equipment>(
  {
    EntityInput: EquipmentInput,
    FilterInput: EquipmentFilterInput,
    EntityUpdateInput: EquipmentUpdateInput,
    service: new EquipmentHttpService(),
    permissionsPrefix: 'recycling',
    name: 'Equipment',
    permissionName: 'Container',
    permissions: {
      list: [
        'recycling:SelfService:list',
        'recycling:Container:list',
        'recycling:YardConsole:perform',
      ],
      entity: [
        'recycling:SelfService:view',
        'recycling:Container:view',
        'recycling:YardConsole:perform',
      ],
    },
  },
  Equipment,
);

@Resolver(() => Equipment)
export default class ContainerResolver extends BaseResolver {}
