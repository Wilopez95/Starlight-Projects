import { ITaxDistrict } from '@root/types';

export const isPartialTaxDistrict = (
  district: ITaxDistrict | Pick<ITaxDistrict, 'description'>,
): district is Pick<ITaxDistrict, 'description'> => !(district as ITaxDistrict).updatedAt;
