import { Resolver } from 'type-graphql';
import {
  HaulingServiceDaysAndHours,
  HaulingServiceDaysAndHoursFilter,
  HaulingServiceDaysAndHoursInput,
  HaulingServiceDaysAndHoursUpdateInput,
} from '../../../../services/core/types/HaulingServiceDaysAndHours';
import { createHaulingCRUDResolver } from '../../../../graphql/createHaulingCRUDResolver';
import { serviceDaysAngHoursServiceService } from '../../../../services/core/haulingServiceDaysAndHours';

const BaseResolver = createHaulingCRUDResolver<HaulingServiceDaysAndHours>(
  {
    EntityInput: HaulingServiceDaysAndHoursInput,
    EntityUpdateInput: HaulingServiceDaysAndHoursUpdateInput,
    FilterInput: HaulingServiceDaysAndHoursFilter,
    service: serviceDaysAngHoursServiceService,
    permissionsPrefix: 'configuration',
    name: 'ServiceDaysAndHour',
    permissionName: 'business-units',
    permissions: {
      list: ['recycling:SelfService:list', 'configuration:business-units:list'],
    },
  },
  HaulingServiceDaysAndHours,
);

@Resolver(() => HaulingServiceDaysAndHours)
export default class HaulingServiceDaysAndHoursResolver extends BaseResolver {}
