import gql from 'graphql-tag';

export const typeDefs = gql`
  type Subscription {
    id: ID!
    serviceDate: String!
    anniversaryBilling: Boolean!
    billingCycle: String!
    billingType: BillingType!
    businessLineId: ID!
    endDate: String
    nextBillingPeriodFrom: String
    nextBillingPeriodTo: String
    totalPriceForSubscription: Float
    startDate: String!

    serviceItems: [ServiceItem!]!
    nonServiceOrder: [SubscriptionOrder!]
  }

  type ServiceItem {
    serviceItemId: ID!
    serviceName: String!

    lineItems: [LineItem!]

    serviceItems: [ServiceItemInfo!]!
  }

  type LineItem {
    id: ID!
    price: Float!
    quantity: Int!
    totalPrice: Float!
    periodTo: String
    periodSince: String
    serviceName: String!
    totalDay: Int!
    usageDay: Int!
  }

  type ServiceItemInfo {
    id: ID!
    totalPrice: Float!
    totalDay: Int!
    usageDay: Int!
    price: Float!
    quantity: Int!
    periodTo: String
    periodSince: String
    subscriptionOrders: [SubscriptionOrder!]
  }

  type SubOrderLineItem {
    id: ID!
    price: Float!
    quantity: Int!
    serviceName: String!
  }

  type SubscriptionOrder {
    id: ID
    serviceDate: String!
    sequenceId: String
    price: Float
    quantity: Int
    serviceName: String!
    grandTotal: Float
    subOrderLineItems: [SubOrderLineItem!]
  }
`;
