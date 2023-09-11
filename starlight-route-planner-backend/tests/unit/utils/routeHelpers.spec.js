import { checkAttachPossibilityBasedOnLOB } from '../../../utils/routeHelpers.js';
import { businessLines } from '../../fixtures/businessLinesFixture.js';

const PTIds = [13, 14];
const CommercialId = 2;
const ResidentialId = 3;

describe('checkAttachPossibilityBasedOnLOB', () => {
  it('should return true when all items have PORTABLE_TOILETS businessLine', () => {
    const dummyItems = [
      { id: 1, businessLineId: PTIds[0] },
      { id: 2, businessLineId: PTIds[0] },
      { id: 3, businessLineId: PTIds[1] },
    ];

    const result = checkAttachPossibilityBasedOnLOB(dummyItems, businessLines);

    expect(result).toBe(true);
  });

  it('should return true when none item have PORTABLE_TOILETS businessLine', () => {
    const dummyItems = [
      { id: 1, businessLineId: CommercialId },
      { id: 2, businessLineId: ResidentialId },
    ];

    const result = checkAttachPossibilityBasedOnLOB(dummyItems, businessLines);

    expect(result).toBe(true);
  });

  it('should return false when exist items with PORTABLE_TOILETS businessLine and businessLine different from PORTABLE_TOILETS', () => {
    const dummyItems = [
      { id: 1, businessLineId: ResidentialId },
      { id: 2, businessLineId: CommercialId },
      { id: 3, businessLineId: PTIds[1] },
    ];

    const result = checkAttachPossibilityBasedOnLOB(dummyItems, businessLines);

    expect(result).toBe(false);
  });
});
