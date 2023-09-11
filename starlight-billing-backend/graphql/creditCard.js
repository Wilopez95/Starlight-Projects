import gql from 'graphql-tag';

export const typeDefs = gql`
  type CreditCard {
    id: ID!
    active: Boolean!

    cardNickname: String
    cardType: String!
    cardNumberLastDigits: String!

    ccAccountId: ID!
    ccAccountToken: String!

    paymentGateway: PaymentGateway
    merchantId: ID!

    customer: Customer!
    payments(offset: Int = 0, limit: Int = 25): [Payment!]!
    spUsed: Boolean
  }

  type CreditCardExtended {
    id: ID!
    active: Boolean!

    cardNickname: String
    cardType: String!
    cardNumberLastDigits: String!

    ccAccountId: ID!
    ccAccountToken: String!

    paymentGateway: PaymentGateway
    merchantId: ID!

    customer: Customer!
    payments: [Payment!]!
    jobSites: [JobSite!]

    nameOnCard: String
    expirationDate: String
    addressLine1: String
    addressLine2: String
    city: String
    state: String
    zip: String
    expDate: String
    expiredLabel: Boolean

    isAutopay: Boolean
    spUsed: Boolean
  }

  input AddCreditCardInput {
    active: Boolean!
    cardNickname: String

    addressLine1: String!
    addressLine2: String
    city: String!
    state: String!
    zip: String!

    nameOnCard: String!

    expirationDate: String!
    cardNumber: String!
    cvv: String!

    jobSites: [ID]
  }

  input EditCreditCardInput {
    active: Boolean!

    cardNickname: String

    addressLine1: String!
    addressLine2: String
    city: String!
    state: String!
    zip: String!

    nameOnCard: String!

    expirationDate: String!

    jobSites: [ID]
  }
`;

export const resolvers = {
  CreditCard: {
    customer: obj => obj.$relatedQuery('customer'),
    payments: (obj, args) =>
      obj.$relatedQuery('payments').orderBy('id').offset(args.offset).limit(args.limit),
  },
  CreditCardExtended: {
    expDate: obj => (obj.expDate ? new Date(obj.expDate).toUTCString() : undefined),
    customer: obj => obj.$relatedQuery('customer'),
    payments: obj => obj.$relatedQuery('payments').orderBy('id'),
    jobSites: async obj => {
      const items = await obj.$relatedQuery('jobSites').orderBy('id');
      return items?.length ? items : null;
    },
  },
};
