export const subscriptionServiceName = services =>
  services?.length > 1 ? 'Multiple' : services[0]?.billableService?.description || '-';
