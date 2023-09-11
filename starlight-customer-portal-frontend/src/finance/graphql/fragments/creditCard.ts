export const CreditCardFragment = `
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

  customer { id, name }
  jobSites { id }

  expDate
  expiredLabel
`;
