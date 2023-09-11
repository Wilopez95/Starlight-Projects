const mergeAddressComponents = ({ addressLine1, addressLine2, city, state, zip }) =>
  [addressLine1, addressLine2, city, state, zip].filter(s => s).join(', ');

export default mergeAddressComponents;
