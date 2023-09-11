export const recyclingOrder = {
  id: 135,
  status: 'COMPLETED',
  customerTruck: {
    id: 34,
    truckNumber: '1',
    type: 'TRACTORTRAILER',
    emptyWeight: null,
  },
  material: {
    id: 3,
  },
  container: null,
  departureAt: '2021-11-16T12:35:02.737Z',
  arrivedAt: '2021-11-16T12:33:26.430Z',
  weightTicketAttachedAt: '2021-11-16T12:35:21.074Z',
  weightTicketCreator: {
    id: '18ccd8dc-202d-4416-acf1-4a7e94a5474b',
    name: 'DpaiBep Anka',
    email: 'test1991tet@gmail.com',
  },
  weightTicketCreatorId: '18ccd8dc-202d-4416-acf1-4a7e94a5474b',
  weightTicketUrl:
    'https://recycling-dev1-files.s3.amazonaws.com/files/crpt-recycling-3/weight-ticket-135.pdf?AWSAccessKeyId=AKIA2XMFHQ225S6S5DAD&Expires=1637685993&Signature=%2FyB4qqHjjkeUUuQu%2Bora91YVtr4%3D',
  weightInUnit: 'TON',
  WONumber: 'DR434',
  PONumber: null,
  weightIn: 3,
  weightOut: 1,
  images: [],
  originDistrict: null,
  disposalSite: { id: 1 },
  businessUnitId: 1,
  materialsDistribution: [
    {
      uuid: '3ad77285-41ff-41e9-9fed-1ab985abbc14',
      materialId: 3,
      material: {
        id: 3,
        description: 'Mat 1',
        code: '1020',
      },
      value: 100,
    },
    {
      uuid: '577eca0b-82bb-4e04-9e66-d9948f146168',
      materialId: 4,
      material: {
        id: 4,
        description: 'Mat 2',
        code: '2040',
      },
      value: 0,
    },
    {
      uuid: 'abbd4ee1-7327-4184-a683-94ebd325522a',
      materialId: 12,
      material: {
        id: 12,
        description: 'Concrete',
        code: '5890',
      },
      value: 0,
    },
    {
      uuid: 'e2856040-b34b-4228-8635-fb80d1bda569',
      materialId: 13,
      material: {
        id: 13,
        description: 'C&D',
        code: '5678',
      },
      value: 0,
    },
    {
      uuid: '571ab780-b382-434f-a22d-fc6b763a7b95',
      materialId: 35,
      material: {
        id: 35,
        description: 'Wood',
        code: '6578',
      },
      value: 0,
    },
  ],
  miscellaneousMaterialsDistribution: [
    {
      uuid: '8b5337cd-7b47-4bbb-846f-4c8bd1509c79',
      materialId: 3,
      material: {
        id: 3,
        description: 'Mat 1',
        code: '1020',
      },
      quantity: 0,
    },
    {
      uuid: '056360ae-ce7d-4810-9e9b-7229fb9a2229',
      materialId: 4,
      material: {
        id: 4,
        description: 'Mat 2',
        code: '2040',
      },
      quantity: 0,
    },
    {
      uuid: '55236989-95eb-4e46-9d89-9cc035ece3d7',
      materialId: 12,
      material: {
        id: 12,
        description: 'Concrete',
        code: '5890',
      },
      quantity: 0,
    },
    {
      uuid: 'f068b294-1a1a-41de-bf66-09fc9af788df',
      materialId: 13,
      material: {
        id: 13,
        description: 'C&D',
        code: '5678',
      },
      quantity: 0,
    },
    {
      uuid: '4747d905-ee86-4a53-9eda-885135fa8230',
      materialId: 35,
      material: {
        id: 35,
        description: 'Wood',
        code: '6578',
      },
      quantity: 0,
    },
  ],
  beforeTaxesTotal: 18,
  grandTotal: 18,
};
