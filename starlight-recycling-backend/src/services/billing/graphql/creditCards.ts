import gql from 'graphql-tag';

gql`
  fragment CreditCardFragment on CreditCardExtended {
    id
    active
    cardNickname
    cardType
    cardNumberLastDigits

    nameOnCard
    expirationDate
    addressLine1
    addressLine2
    city
    state
    zip

    jobSites {
      id
      addressLine1
      addressLine2
      city
      state
      zip
    }

    expDate
    expiredLabel
  }

  query getCreditCards(
    $customerId: ID
    $activeOnly: Boolean
    $jobSiteId: ID
    $relevantOnly: Boolean
  ) {
    creditCards(
      customerId: $customerId
      activeOnly: $activeOnly
      jobSiteId: $jobSiteId
      relevantOnly: $relevantOnly
    ) {
      ...CreditCardFragment
    }
  }

  query getCreditCard($id: ID!) {
    creditCard(id: $id) {
      ...CreditCardFragment
    }
  }

  mutation createCreditCard($customerId: ID!, $data: AddCreditCardInput!) {
    addCreditCard(customerId: $customerId, data: $data) {
      ...CreditCardFragment
    }
  }

  mutation updateCreditCard($id: ID!, $data: EditCreditCardInput!) {
    updateCreditCard(id: $id, data: $data) {
      ...CreditCardFragment
    }
  }
`;
