export const handleLinkedCustomers = async (options, trx) => {
  const { repo, customerId, linkedCustomerIds } = options;

  if (!linkedCustomerIds) {
    return null;
  }

  await repo.deleteRelatedDataByCustomerId(customerId, trx);

  if (linkedCustomerIds.length) {
    await repo.linkCustomers({ customerId, linkedCustomerIds }, trx);
  }
  return null;
};
