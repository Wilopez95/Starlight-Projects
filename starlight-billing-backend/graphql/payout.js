import gql from 'graphql-tag';

export const typeDefs = gql`
  type Payout {
    id: ID!

    date: String!
    paymentType: PaymentType!
    checkNumber: String
    isAch: Boolean!

    amount: Float!
    prevBalance: Float!
    newBalance: Float

    customer: Customer!
    creditCard: CreditCard
    payments: [PaidOutPayment!]!
  }

  input PayoutFilters {
    filterByCreatedFrom: String
    filterByCreatedTo: String
    filterByType: [PaymentType!]
    filterByAmountFrom: Float
    filterByAmountTo: Float
    filterByUser: [ID!]
  }

  input PayoutInput {
    paymentType: PaymentType!
    date: String

    creditCardId: ID
    newCreditCard: CreditCardInput

    checkNumber: String
    isAch: Boolean

    paymentIds: [ID!]!
  }
`;

export const resolvers = {
  Payout: {
    date: obj => new Date(obj.date).toUTCString(),

    customer: obj => obj.$relatedQuery('customer'),
    creditCard: obj => obj.$relatedQuery('creditCard'),
    payments: obj => obj.$relatedQuery('payments').orderBy('date').orderBy('id'),
  },
};
