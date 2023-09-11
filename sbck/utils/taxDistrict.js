import { DISTRICT_TYPE } from '../consts/districtTypes.js';
import { REGION } from '../consts/regions.js';

const usaDistrictTypeLabels = {
  [DISTRICT_TYPE.primary]: 'State',
  [DISTRICT_TYPE.secondary]: 'County',
  [DISTRICT_TYPE.municipal]: 'City',
  [DISTRICT_TYPE.country]: 'Federal',
};

const caDistrictTypeLabels = {
  [DISTRICT_TYPE.primary]: 'Province/Territory',
  [DISTRICT_TYPE.secondary]: 'County/District',
  [DISTRICT_TYPE.municipal]: 'Municipality',
  [DISTRICT_TYPE.country]: 'National',
};

export const districtTypeToLabel = (districtType, region) => {
  // TODO: extend with other region types later
  const labels = region === REGION.can ? caDistrictTypeLabels : usaDistrictTypeLabels;

  return labels[districtType];
};

export const labelToDistrictType = districtTypeLabel => {
  let districtType;

  if (['State', 'Province/Territory'].includes(districtTypeLabel)) {
    districtType = DISTRICT_TYPE.primary;
  } else if (['County', 'County/District'].includes(districtTypeLabel)) {
    districtType = DISTRICT_TYPE.secondary;
  } else if (['City', 'Municipality'].includes(districtTypeLabel)) {
    districtType = DISTRICT_TYPE.municipal;
  } else if (['Federal', 'National'].includes(districtTypeLabel)) {
    districtType = DISTRICT_TYPE.country;
  }

  return districtType;
};
