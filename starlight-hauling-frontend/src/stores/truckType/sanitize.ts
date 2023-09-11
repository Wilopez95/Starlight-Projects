/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ITruckFormikData } from '@root/types';

export const sanitizeFormData = (data: ITruckFormikData) => {
  const businessLinesData = data.businessLines
    .filter(({ active }) => active)
    .map(elem => {
      //@ts-expect-error
      delete elem.active;
      //@ts-expect-error
      delete elem.name;

      return {
        materialsIds: elem.materials
          .filter(({ active }) => active)
          .map(({ id }: { id: number }) => id),
        equipmentItemsIds: elem.equipmentItems
          .filter(({ active }) => active)
          .map(({ id }: { id: number }) => id),
        id: elem.id,
      };
    });

  return {
    businessLines: businessLinesData,
    description: data.description,
    active: data.active,
  };
};
