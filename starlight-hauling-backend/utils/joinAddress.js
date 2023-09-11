// so much filtering is to avoid `null` between commas and spaces
export const joinAddress = address =>
  // 1234 East 27th Avenue, Denver, Colorado 80205, United States
  address
    ? `${[
        [address.addressLine1, address.addressLine2]
          .filter(i => !!i)
          .join(' ')
          .trim(),
        address.city,
        [address.state, address.zip]
          .filter(i => !!i)
          .join(' ')
          .trim(),
      ]
        .filter(i => !!i)
        .join(', ')
        .trim()}`
    : '';
