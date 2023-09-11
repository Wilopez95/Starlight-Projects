import { NonEmptyArray } from 'type-graphql';
import ContainerResolver from './resolvers/ContainerResolver';
import MaterialResolver from './resolvers/MaterialResolver';
import BillableItemResolver from './resolvers/BillableItemResolver';
import CustomerGroupResolver from './resolvers/CustomerGroupResolver';
// import ResetLoginResolver from './resolvers/ResetLoginResolver';
import CustomerResolver from './resolvers/CustomerResolver';
import CompanyResolver from './resolvers/CompanyResolver';
import CustomerTruckResolver from './resolvers/CustomerTruckResolver';
import DestinationResolver from './resolvers/DestinationResolver';
import OriginResolver from './resolvers/OriginResolver';
import PriceGroupResolver from './resolvers/PriceGroupResolver';
import JobSiteResolver from './resolvers/JobSiteResolver';
import ProjectResolver from './resolvers/ProjectResolver';
import OrderResolver from './resolvers/OrderResolver';
import CustomerJobSiteResolver from './resolvers/CustomerJobSiteResolver';
import FileResolver from './resolvers/FileResolver';
import CreditCardResolver from './resolvers/CreditCardResolver';
import OrderIndexedResolver from './resolvers/OrderIndexedResolver';
import CustomerTruckIndexedResolver from './resolvers/CustomerTruckIndexedResolver';
import ResourceLoginResolver from './resolvers/ResourceLoginResolver';
import OrderBillableItemResolver from './resolvers/OrderBillableItemResolver';
import OrderMaterialDistributionResolver from './resolvers/OrderMaterialDistributionResolver';
import OrderMiscellaneousMaterialDistributionResolver from './resolvers/OrderMiscellaneousMaterialDistributionResolver';
import OriginDistrictsResolver from './resolvers/OriginDistrictsResolver';
import { User } from '../../../services/ums/users';
import ScaleResolver from './resolvers/ScaleResolver';
import HaulingBillableItemResolver from './resolvers/HaulingBillableItemResolver';
import { AdministrativeDistrict } from './types/AdministrativeDistrict';
import HaulingServiceDaysAndHoursResolver from './resolvers/ServiceDaysAndHoursResolver';
import { OrderHistoryResolver } from './resolvers/OrderHistoryResolver';
import DriverResolver from './resolvers/DriverResolver';

// import FacilityUserResolver from './resolvers/FacilityUserResolver';

// import { buildFederatedSchema } from '../../../utils/buildFederatedSchema';

// TODO fix types
// eslint-disable-next-line
export const resolvers: NonEmptyArray<any> = [
  ContainerResolver,
  MaterialResolver,
  BillableItemResolver,
  CustomerGroupResolver,
  // ResetLoginResolver,
  CustomerResolver,
  CompanyResolver,
  CustomerTruckResolver,
  CustomerTruckIndexedResolver,
  DestinationResolver,
  DriverResolver,
  OriginResolver,
  PriceGroupResolver,
  JobSiteResolver,
  ProjectResolver,
  OrderResolver,
  CustomerJobSiteResolver,
  FileResolver,
  CreditCardResolver,
  OrderIndexedResolver,
  ResourceLoginResolver,
  OriginDistrictsResolver,
  OrderBillableItemResolver,
  OrderMaterialDistributionResolver,
  OrderMiscellaneousMaterialDistributionResolver,
  ScaleResolver,
  // FacilityUserResolver,
  HaulingBillableItemResolver,
  HaulingServiceDaysAndHoursResolver,

  // historical
  OrderHistoryResolver,
];

export const orphanedTypes = [User, AdministrativeDistrict];

// export const schema = buildFederatedSchema({
//   resolvers,
//   orphanedTypes: [User],

//   // }, {
//   //   User: { __resolveReference: async function resolveUserReference(reference: Pick<User, "id">): Promise<User | null> {
//   //     console.log('reference', reference);

//   //     return (await User.findOne(reference.id)) || null;
//   //   } },
// });
