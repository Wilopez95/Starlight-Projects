import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { BusinessLineStore, TruckType, TruckTypeStore } from '@root/stores/entities';
import { FormikBusinessLines, IEquipmentOrMaterialsItems, ITruckFormikData } from '@root/types';

export const generateValidationSchema = (
  truckStore: TruckTypeStore,
  t: TFunction,
  i18n: string,
) => {
  const currentId = truckStore.selectedEntity?.id;
  let districts = truckStore.values;

  if (currentId) {
    districts = districts.filter(district => district.id !== currentId);
  }

  const descriptions = districts.map(district => district.description);

  return Yup.object().shape({
    active: Yup.boolean(),
    businessLinesNames: Yup.boolean(),
    description: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .required(t(`${i18n}DescriptionIsRequired`))
      .notOneOf(descriptions, t(`${i18n}DescriptionUnique`)),
    businessLines: Yup.array<FormikBusinessLines>().test(
      'required',
      t(`${i18n}AtLeastOneBusinessUnit`),
      values => !!values && values.some(({ active }) => active),
    ),
  });
};

export const defaultValue: ITruckFormikData = {
  id: 0,
  active: true,
  description: '',
  businessLines: [],
};

export const getValues = (
  businessLineStore: BusinessLineStore,
  truckType: TruckType | null,
  isNew: boolean,
): ITruckFormikData => {
  const createNewTruckType = !truckType || isNew;

  return {
    id: !createNewTruckType && truckType ? truckType.id : 0,
    active: !createNewTruckType && truckType ? truckType.active : true,
    description: !createNewTruckType && truckType ? truckType.description : '',
    businessLines: businessLineStore.values
      .filter(x => x.active)
      .map(({ id, name }) => {
        let materials: IEquipmentOrMaterialsItems[] = [];
        let equipmentItems: IEquipmentOrMaterialsItems[] = [];

        if (!createNewTruckType && truckType?.businessLines.length) {
          const existedBusinessLine = truckType.businessLines.find(
            ({ id: equipmentId }) => equipmentId === id,
          );

          if (existedBusinessLine) {
            materials =
              existedBusinessLine.materials?.map(elem => ({ active: true, ...elem })) ?? [];
            equipmentItems =
              existedBusinessLine.equipments?.map(elem => ({ active: true, ...elem })) ?? [];
          }
        }

        return {
          id,
          name,
          active: createNewTruckType
            ? false
            : // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
              truckType!.businessLines.some(({ id: blID }) => blID === id),
          materials,
          equipmentItems,
        };
      }),
  };
};
