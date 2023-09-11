import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { EquipmentItemStore } from '@root/stores/equipmentItem/EquipmentItemStore';
import {
  EquipmentItemType,
  EquipmentItemWithImage,
  IEquipmentItem,
} from '@root/types/entities/equipmentItem';

export const generateValidationSchema = (
  equipmentStore: EquipmentItemStore,
  t: TFunction,
  i18n: string,
) => {
  const currentId = equipmentStore.selectedEntity?.id;
  let equipmentItems = equipmentStore.values;

  if (currentId) {
    equipmentItems = equipmentItems.filter(equipmentItem => equipmentItem.id !== currentId);
  }

  const descriptions = equipmentItems.map(equipmentItem => equipmentItem.description);
  const shortDescriptions = equipmentItems.map(equipmentItem => equipmentItem.shortDescription);

  return Yup.object().shape({
    shortDescription: Yup.string()
      .trim()
      .required(t(`${i18n}ShortDescriptionIsRequired`))
      .notOneOf(shortDescriptions, t(`${i18n}ShortDescriptionMustBeUnique`)),
    description: Yup.string()
      .trim()
      .required(t(`${i18n}DescriptionIsRequired`))
      .notOneOf(descriptions, t(`${i18n}DescriptionMustBeUnique`)),
    active: Yup.boolean().required(),
    customerOwned: Yup.boolean(),
    size: Yup.number()
      .nullable()
      .when('customerOwned', {
        is: false,
        then: Yup.number()
          .positive(t(`${i18n}SizeMustBeGreaterThanZero`))
          .required(t(`${i18n}SizeIsRequired`))
          .typeError(t(`${i18n}SizeMustBeANumber`)),
      }),
    length: Yup.number()
      .nullable()
      .when('customerOwned', {
        is: false,
        then: Yup.number()
          .required(t(`${i18n}LengthIsRequired`))
          .typeError(t(`${i18n}LengthMustBeANumber`))
          .min(0, t(`${i18n}LengthMustBePositive`)),
      }),
    width: Yup.number()
      .nullable()
      .when('customerOwned', {
        is: false,
        then: Yup.number()
          .required(t(`${i18n}WidthIsRequired`))
          .typeError(t(`${i18n}WidthMustBeANumber`))
          .min(0, t(`${i18n}WidthMustBePositive`)),
      }),
    height: Yup.number()
      .nullable()
      .when('customerOwned', {
        is: false,
        then: Yup.number()
          .required(t(`${i18n}HeightIsRequired`))
          .typeError(t(`${i18n}HeightMustBeANumber`))
          .min(0, t(`${i18n}HeightMustBePositive`)),
      }),
    emptyWeight: Yup.number()
      .nullable()
      .when('customerOwned', {
        is: false,
        then: Yup.number()
          .required(t(`${i18n}EmptyWeightIsRequired`))
          .typeError(t(`${i18n}EmptyWeightMustBeANumber`))
          .min(0, t(`${i18n}EmptyWeightMustBePositive`)),
      }),
    closedTop: Yup.boolean().required(),
    imageUrl: Yup.string().notRequired().nullable(),
    image: Yup.mixed()
      .notRequired()
      .test(
        'isFile',
        t('ValidationErrors.ImageMustBeValidFile'),
        value => !value || value instanceof File,
      )
      .nullable(),
  });
};

const defaultValue: EquipmentItemWithImage = {
  id: 0,
  type: EquipmentItemType.rollOffContainer,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  shortDescription: '',
  description: '',
  size: null,
  length: 0,
  width: 0,
  height: 0,
  emptyWeight: 0,
  closedTop: false,
  imageUrl: '',
  image: null,
  businessLineId: '',
  customerOwned: false,
  containerTareWeightRequired: false,
};

export const getDuplicateValues = (
  duplicateItem: EquipmentItemWithImage,
): EquipmentItemWithImage => ({
  ...duplicateItem,
  description: '',
  shortDescription: '',
});

export const getValues = (
  customInitProps: Partial<EquipmentItemWithImage>,
  item?: IEquipmentItem | null,
): EquipmentItemWithImage => {
  if (!item) {
    return { ...defaultValue, ...customInitProps };
  }

  return notNullObject(item, defaultValue);
};
