const mockSurcharges = [
  {
    id: 1,
    businessLineId: 1,
    active: true,
    materialBasedPricing: true,
    description: '1',
    calculation: 'flat',
  },
  {
    id: 2,
    businessLineId: 1,
    active: true,
    materialBasedPricing: false,
    description: '2',
    calculation: 'flat',
  },
  {
    id: 3,
    businessLineId: 1,
    active: true,
    materialBasedPricing: true,
    description: '3',
    calculation: 'percentage',
  },
  {
    id: 4,
    businessLineId: 1,
    active: true,
    materialBasedPricing: false,
    description: '4',
    calculation: 'percentage',
  },
];

export default mockSurcharges;
