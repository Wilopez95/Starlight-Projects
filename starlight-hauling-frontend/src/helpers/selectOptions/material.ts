import { ISelectOption } from '@starlightpro/shared-components';
import i18next from 'i18next';

import { MaterialService } from '@root/api';
import { IMaterial } from '@root/types';

import { convertDates } from '../convertDates';

export const materialToSelectOption = (material: IMaterial): ISelectOption => ({
  label: material.description,
  value: material.id,
  hint: material.manifested ? i18next.t('Text.Manifested') : '',
});

export const getMaterialsForOptions = async ({
  materialService,
  equipmentItemId,
  businessLineId,
  materialId,
}: {
  businessLineId: string | number;
  materialService: MaterialService;
  equipmentItemId: number;
  materialId?: number;
}) => {
  const materials = await materialService.getByEquipmentItem(equipmentItemId, {
    businessLineId,
    activeOnly: true,
  });
  let selectedMaterial;
  if (materialId) {
    selectedMaterial = await materialService.getMaterialHistocal(materialId);
  }

  const materialOptions =
    materials.map(material => materialToSelectOption(convertDates(material))) ?? [];
  return { materialOptions, selectedMaterial };
};
