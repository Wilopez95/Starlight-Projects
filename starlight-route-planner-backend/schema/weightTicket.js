import gql from 'graphql-tag';

import { RELATIONS } from '../consts/relations.js';

export const typeDefs = gql`
  type WeightTicket {
    id: Int!
    ticketNumber: String!
    dailyRouteId: Int!
    loadValue: Float!
    weightUnit: WEIGHT_UNIT_ENUM!
    media: WeightTicketMedia!
    materialId: Int
    disposalSiteId: Int
    arrivalTime: String
    departureTime: String
    timeOnLandfill: String
    authorId: String
    authorName: String

    createdAt: String!
    updatedAt: String!
  }

  input CreateWeightTicketInput {
    dailyRouteId: Int!
    ticketNumber: String!
    loadValue: Float!
    weightUnit: WEIGHT_UNIT_ENUM!
    materialId: Int
    disposalSiteId: Int
    arrivalTime: String
    departureTime: String
    timeOnLandfill: String
  }

  input UpdateWeightTicketInput {
    ticketNumber: String
    loadValue: Float
    weightUnit: WEIGHT_UNIT_ENUM
    materialId: Int
    disposalSiteId: Int
    arrivalTime: String
    departureTime: String
    timeOnLandfill: String
  }
`;

export const resolvers = {
  WeightTicket: {
    media: obj => obj.$relatedQuery(RELATIONS.WEIGHT_TICKET_MEDIA),
  },
};
