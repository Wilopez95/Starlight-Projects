export const CreditCardFragment = `
  id
  active
  cardNickname
  cardType
  cardNumberLastDigits
  paymentGateway

  nameOnCard
  expirationDate
  addressLine1
  addressLine2
  city
  state
  zip
  isAutopay
  spUsed

  customer { id, name }
  jobSites { id }

  expDate
  expiredLabel
`;
