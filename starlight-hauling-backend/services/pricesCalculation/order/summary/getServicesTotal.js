const getServicesTotal = (orders = []) =>
  orders?.reduce((servicesTotal, { total = 0 }) => servicesTotal + (total ?? 0), 0) || 0;

export default getServicesTotal;
