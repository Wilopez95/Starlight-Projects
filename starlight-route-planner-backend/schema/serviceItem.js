import gql from 'graphql-tag';
import { format } from 'date-fns';

import { DB_DATE_FORMAT } from '../consts/formats.js';

export const typeDefs = gql`
  input ServiceItemInput {
    id: Int!
    serviceFrequencyId: Int!
    jobSiteId: Int!
    businessLineId: Int!
    materialId: Int!
    subscriptionId: Int!
    businessUnitId: Int!
    billableServiceId: Int!
    billableServiceDescription: String!
    startDate: String!
    equipmentItemId: Int!
    serviceDaysOfWeek: ServiceDaysOfWeek!
    customerId: Int!
    endDate: String
    serviceAreaId: Int
    bestTimeToComeFrom: String
    bestTimeToComeTo: String
  }

  type ServiceItem {
    id: Int!
    haulingId: Int!
    serviceFrequencyId: Int!
    jobSiteId: Int!
    jobSite: JobSite!
    billableServiceId: Int!
    billableServiceDescription: String!
    businessLineId: Int!
    materialId: Int!
    subscriptionId: Int!
    businessUnitId: Int!
    startDate: String!
    equipmentItemId: Int!
    serviceDaysOfWeek: ServiceDaysOfWeek!
    customerId: Int!
    serviceAreaId: Int
    endDate: String
    bestTimeToComeFrom: String
    bestTimeToComeTo: String
    sequence: Int
  }

  type ServiceItemsAssignmentInfo {
    serviceItemId: Int!
    serviceItemHaulingId: Int!
    serviceDaysList: [Int!]
    routeColors: [String!]
  }

  type ServiceItemsRouteStatus {
    available: [Int]
    updating: [Int]
    published: [Int]
  }
`;

export const resolvers = {
  ServiceItem: {
    startDate: ({ startDate }) => (startDate ? format(startDate, DB_DATE_FORMAT) : null),
    endDate: ({ endDate }) => (endDate ? format(endDate, DB_DATE_FORMAT) : null),
  },
};
