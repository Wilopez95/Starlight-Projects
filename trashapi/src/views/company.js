import R from 'ramda';

const fields = [
  'id',
  'tenantId',
  'logoUrl',
  'officialWebsite',
  'phone',
  'physicalAddressLine1',
  'physicalAddressLine2',
  'physicalCity',
  'physicalState',
  'physicalZip',
  'physicalLongitude',
  'physicalLatitude',
  'deleted',
  'unit',
];

// map for compatibility
export const mapCompanyFieldsView = row => ({
  id: row.id,
  tenantId: row.tenantId,
  name: row.legalName,
  slug: row.name,
  website: row.officialWebsite,
  logoUrl: row.logoUrl,
  address: row.physicalAddressLine1,
  address2: null,
  zipcode: row.physicalZip,
  phoneNumber: row.phone,
  city: row.physicalCity,
  state: row.physicalState,
  latitude: row.physicalLatitude,
  longitude: row.physicalLongitude,
  createdAt: row.createdDate,
  updatedAt: row.modifiedDate,
  deletedAt: null,
  enableSignature: row.enableSignature,
  enableManifest: row.enableManifest,
  twilioNumber: row.twilioNumber,
  enableWhipAround: row.enableWhipAround,
  enableWingmate: row.enableWingmate,
});

export const mapCompaniesFieldsView = rows => rows.map(row => mapCompanyFieldsView(row));

export const companyView = data => R.pick(fields, data);
