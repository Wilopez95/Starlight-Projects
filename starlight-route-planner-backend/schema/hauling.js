import gql from 'graphql-tag';
import { BUSINESS_LINE_ROUTE_TYPE, BUSINESS_LINE_TYPE } from '../consts/businessLineTypes.js';

export const typeDefs = gql`
  scalar Date

  type HaulingSubscription {
    id: Int
    status: String
    customerId: Int
    customerJobSiteId: Int
    jobSiteNote: String
    jobSiteContactId: Int
    driverInstructions: String
    bestTimeToComeFrom: Date
    bestTimeToComeTo: Date
    startDate: Date
    endDate: Date
    equipmentType: String
    reason: String
    reasonDescription: String
    createdAt: Date
    updatedAt: Date
  }

  type HaulingServiceItem {
    id: Int!
    jobSiteId: Int!
    businessLineId: Int!
    materialId: Int
    subscriptionId: Int!
    businessUnitId: Int!
    customerId: Int!
    serviceFrequencyId: Int
    startDate: Date
    endDate: Date
    serviceAreaId: Int
    equipmentItemId: Int
    billableServiceId: Int
    billableServiceDescription: String
    bestTimeToComeFrom: Date
    bestTimeToComeTo: Date
    serviceDaysOfWeek: ServiceDaysOfWeek
    jobSite: JobSite
    subscription: HaulingSubscription
  }

  input HaulingServiceItemFilters {
    businessLineId: Int!
    frequencyIds: [Int!]
    serviceAreaIds: [Int!]
    materialIds: [Int!]
    equipmentIds: [Int!]
    serviceDaysOfWeek: [Int!]
  }

  type HaulingEquipmentItem {
    id: Int
    active: Boolean
    businessLineId: Int
    customerOwned: Boolean
    description: String
    emptyWeight: Float
    height: Float
    length: Float
    shortDescription: String
    size: Float
    type: String
    width: Float
  }

  input HaulingMaterialFilters {
    businessLineId: Int
    materialIds: [Int!]
  }

  type HaulingMaterial {
    id: Int
    active: Boolean
    businessLineId: Int
    description: String
    manifested: Boolean
    misc: Boolean
    recycle: Boolean
    rolloff: Boolean
  }

  type HaulingServiceArea {
    id: Int
    active: Boolean
    businessLineId: Int
    businessUnitId: Int
    name: String
    description: String
  }

  type HaulingBusinessLine {
    id: Int
    active: Boolean
    name: String
    description: String
    type: String
  }

  type HaulingDisposalSite {
    id: Int!
    active: Boolean!
    description: String!
    location: Location!
    createdAt: String!
    updatedAt: String!
    address: Address!
    type: String!
  }

  type HaulingSubscriptionOrder {
    id: Int!
    status: ORDER_STATUS!
  }

  type HaulingIndependentOrder {
    id: Int!
    status: ORDER_STATUS!
  }

  type HaulingTruckType {
    id: Int!
    description: String
    active: Boolean
  }

  type HaulingTruck {
    id: Int!
    name: String!
    type: String!
    truckTypeId: Int!
    note: String
    licensePlate: String
    businessUnitIds: [Int]
    businessLineTypes: [BUSINESS_LINE_ROUTE_TYPE]
    createdAt: String
    updatedAt: String
  }

  type HaulingDriver {
    id: Int!
    email: String
    name: String
    truckId: Int
    truckName: String
    businessUnitIds: [Int]
    workingWeekdays: [Int]
    createdAt: String
    updatedAt: String
  }

  type Hauling3rdPartyHauler {
    id: Int!
    description: String!
    active: Boolean!
  }
`;

export const resolvers = {
  HaulingServiceItem: {
    materialId: ({ material }) => material?.originalId,
    billableServiceId: ({ billableService }) => billableService.originalId,
    billableServiceDescription: ({ billableService }) => billableService.description,
    jobSiteId: ({ jobSite }) => jobSite.originalId,
    equipmentItemId: ({ billableService }) => billableService.equipmentItemId,
    businessLineId: ({ subscription }) => subscription.businessLineId,
    businessUnitId: ({ subscription }) => subscription.businessUnitId,
    startDate: ({ subscription }) => subscription.startDate,
    endDate: ({ subscription }) => subscription.endDate,
    serviceAreaId: ({ serviceArea }) => serviceArea.originalId,
    customerId: ({ customer }) => customer.originalId,
    bestTimeToComeFrom: ({ subscription }) => subscription.bestTimeToComeFrom,
    bestTimeToComeTo: ({ subscription }) => subscription.bestTimeToComeTo,
  },
  HaulingDisposalSite: {
    type: ({ waypointType }) => waypointType,
  },
  HaulingTruck: {
    name: ({ description }) => description,
    type: ({ truckType }) => truckType?.description,
    businessUnitIds: ({ businessUnits }) => businessUnits?.map(({ id }) => id),
    businessLineTypes: ({ businessLines }) => {
      const result = [];

      if (!businessLines?.length) {
        return result;
      }

      const businessLineTypes = businessLines.map(({ type }) => type);

      if (businessLineTypes.includes(BUSINESS_LINE_TYPE.residentialWaste)) {
        result.push(BUSINESS_LINE_ROUTE_TYPE.residential);
      }

      if (businessLineTypes.includes(BUSINESS_LINE_TYPE.commercialWaste)) {
        result.push(BUSINESS_LINE_ROUTE_TYPE.commercial);
      }

      if (businessLineTypes.includes(BUSINESS_LINE_TYPE.portableToilets)) {
        result.push(BUSINESS_LINE_ROUTE_TYPE.portableToilets);
      }

      return result;
    },
  },
  HaulingDriver: {
    name: ({ description }) => description,
    truckName: ({ truck }) => truck?.description,
    businessUnitIds: ({ businessUnits }) => businessUnits?.map(({ id }) => id),
  },
};
