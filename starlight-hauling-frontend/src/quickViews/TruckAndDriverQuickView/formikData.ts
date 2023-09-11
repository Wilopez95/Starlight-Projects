import i18next, { TFunction } from 'i18next';
import * as Yup from 'yup';

import { notNullObject, priceValidator } from '@root/helpers';
import { IDriverCost, ITruckAndDriverCost, ITruckCost, ITruckTypeCost } from '@root/types';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDriversCosts.QuickView.Text.';

const commonTruckCostDetailedShape = {
  fuelCost: Yup.number()
    .required(
      i18next.t(`ValidationErrors.IsRequired`, {
        fieldName: i18next.t(`${I18N_PATH}FuelCost`),
      }),
    )
    .min(
      0,
      i18next.t(`ValidationErrors.MustBeGreaterThanZero`, {
        fieldName: i18next.t(`${I18N_PATH}FuelCost`),
      }),
    )
    .test(
      'fuelCost',
      i18next.t(`ValidationErrors.IncorrectSumFormat`, {
        fieldName: i18next.t(`${I18N_PATH}fuelCost`),
      }),
      priceValidator,
    )
    .nullable(),
  miscAverageCost: Yup.number()
    .required(
      i18next.t(`ValidationErrors.IsRequired`, {
        fieldName: i18next.t(`${I18N_PATH}MiscCost`),
      }),
    )
    .min(
      0,
      i18next.t(`ValidationErrors.MustBeGreaterThanZero`, {
        fieldName: i18next.t(`${I18N_PATH}MiscCost`),
      }),
    )
    .test(
      'miscAverageCost',
      i18next.t(`ValidationErrors.IncorrectSumFormat`, {
        fieldName: i18next.t(`${I18N_PATH}miscCost`),
      }),
      priceValidator,
    )
    .nullable(),
  insuranceCost: Yup.number()
    .required(
      i18next.t(`ValidationErrors.IsRequired`, {
        fieldName: i18next.t(`${I18N_PATH}InsuranceCost`),
      }),
    )
    .min(
      0,
      i18next.t(`ValidationErrors.MustBeGreaterThanZero`, {
        fieldName: i18next.t(`${I18N_PATH}InsuranceCost`),
      }),
    )
    .test(
      'insuranceCost',
      i18next.t(`ValidationErrors.IncorrectSumFormat`, {
        fieldName: i18next.t(`${I18N_PATH}insuranceCost`),
      }),
      priceValidator,
    )
    .nullable(),
  maintenanceCost: Yup.number()
    .required(
      i18next.t(`ValidationErrors.IsRequired`, {
        fieldName: i18next.t(`${I18N_PATH}MaintenanceCost`),
      }),
    )
    .min(
      0,
      i18next.t(`ValidationErrors.MustBeGreaterThanZero`, {
        fieldName: i18next.t(`${I18N_PATH}MaintenanceCost`),
      }),
    )
    .test(
      'maintenanceCost',
      i18next.t(`ValidationErrors.IncorrectSumFormat`, {
        fieldName: i18next.t(`${I18N_PATH}maintenanceCost`),
      }),
      priceValidator,
    )
    .nullable(),
  depreciationCost: Yup.number()
    .required(
      i18next.t(`ValidationErrors.IsRequired`, {
        fieldName: i18next.t(`${I18N_PATH}DepreciationCost`),
      }),
    )
    .min(
      0,
      i18next.t(`ValidationErrors.MustBeGreaterThanZero`, {
        fieldName: i18next.t(`${I18N_PATH}DepreciationCost`),
      }),
    )
    .test(
      'depreciationCost',
      i18next.t(`ValidationErrors.IncorrectSumFormat`, {
        fieldName: i18next.t(`${I18N_PATH}depreciationCost`),
      }),
      priceValidator,
    )
    .nullable(),
};

const truckTypeCostShape = {
  truckTypeId: Yup.number().required(
    i18next.t(`ValidationErrors.IsRequired`, {
      fieldName: i18next.t(`${I18N_PATH}Description`),
    }),
  ),
  truckAverageCost: Yup.number()
    .required(
      i18next.t(`ValidationErrors.IsRequired`, {
        fieldName: i18next.t(`${I18N_PATH}Cost`),
      }),
    )
    .min(
      0,
      i18next.t(`ValidationErrors.MustBeGreaterThanZero`, {
        fieldName: i18next.t(`${I18N_PATH}Cost`),
      }),
    )
    .test(
      'truckAverageCost',
      i18next.t(`ValidationErrors.IncorrectSumFormat`, {
        fieldName: i18next.t(`${I18N_PATH}cost`),
      }),
      priceValidator,
    )
    .nullable(),
};

const truckTypeCostDetailedShape = {
  truckTypeId: Yup.number().required(
    i18next.t(`ValidationErrors.IsRequired`, {
      fieldName: i18next.t(`${I18N_PATH}Description`),
    }),
  ),
  ...commonTruckCostDetailedShape,
};

const truckCostShape = {
  truckId: Yup.number().required(
    i18next.t(`ValidationErrors.IsRequired`, {
      fieldName: i18next.t(`${I18N_PATH}Description`),
    }),
  ),
  truckAverageCost: Yup.number()
    .required(
      i18next.t(`ValidationErrors.IsRequired`, {
        fieldName: i18next.t(`${I18N_PATH}Cost`),
      }),
    )
    .min(
      0,
      i18next.t(`ValidationErrors.MustBeGreaterThanZero`, {
        fieldName: i18next.t(`${I18N_PATH}Cost`),
      }),
    )
    .test(
      'truckAverageCost',
      i18next.t(`ValidationErrors.IncorrectSumFormat`, {
        fieldName: i18next.t(`${I18N_PATH}cost`),
      }),
      priceValidator,
    )
    .nullable(),
};

const truckCostDetailedShape = {
  truckId: Yup.number().required(
    i18next.t(`ValidationErrors.IsRequired`, {
      fieldName: i18next.t(`${I18N_PATH}Description`),
    }),
  ),
  ...commonTruckCostDetailedShape,
};

export const generateValidationSchema = (t: TFunction, i18n: string) =>
  Yup.object().shape({
    date: Yup.date()
      .required(t(`${i18n}EffectivePeriodIsRequired`))
      .nullable(),
    averageCost: Yup.number()
      .required(t(`${i18n}AverageCostIsRequired`))
      .min(0, t(`${i18n}CostBeGreaterThanZero`))
      .test('averageCost', t(`${i18n}CostInvalidFormat`), priceValidator),
    truckAverageCost: Yup.number()
      .required(t(`${i18n}TruckAverageCostIsRequired`))
      .min(0, t(`${i18n}CostBeGreaterThanZero`))
      .test('truckAverageCost', t(`${i18n}CostInvalidFormat`), priceValidator),
    driverAverageCost: Yup.number()
      .required(t(`${i18n}DriverAverageCostIsRequired`))
      .min(0, t(`${i18n}CostBeGreaterThanZero`))
      .test('driverAverageCost', t(`${i18n}CostInvalidFormat`), priceValidator),
    truckTypeCosts: Yup.array().when('detailedCosts', {
      is: true,
      then: Yup.array().of(Yup.object().shape(truckTypeCostDetailedShape)),
      otherwise: Yup.array().of(Yup.object().shape(truckTypeCostShape)),
    }),
    truckCosts: Yup.array().when('detailedCosts', {
      is: true,
      then: Yup.array().of(Yup.object().shape(truckCostDetailedShape)),
      otherwise: Yup.array().of(Yup.object().shape(truckCostShape)),
    }),
    driverCosts: Yup.array().of(
      Yup.object().shape({
        driverId: Yup.number().required(
          i18next.t(`ValidationErrors.IsRequired`, {
            fieldName: i18next.t(`${I18N_PATH}Description`),
          }),
        ),
        driverAverageCost: Yup.number()
          .required(
            i18next.t(`ValidationErrors.IsRequired`, {
              fieldName: i18next.t(`${I18N_PATH}Cost`),
            }),
          )
          .min(
            0,
            i18next.t(`ValidationErrors.MustBeGreaterThanZero`, {
              fieldName: i18next.t(`${I18N_PATH}Cost`),
            }),
          )
          .test(
            'truckAverageCost',
            i18next.t(`ValidationErrors.IncorrectSumFormat`, {
              fieldName: i18next.t(`${I18N_PATH}cost`),
            }),
            priceValidator,
          )
          .nullable(),
      }),
    ),
  });

const defaultCommonTruckCost = {
  truckAverageCost: undefined,
  updatedAt: new Date(),
  createdAt: new Date(),
  fuelCost: undefined,
  miscAverageCost: undefined,
  insuranceCost: undefined,
  maintenanceCost: undefined,
  depreciationCost: undefined,
};

export const defaultValueTruckTypeCost: ITruckTypeCost = {
  truckTypeId: undefined,
  ...defaultCommonTruckCost,
};

export const defaultValueTruckCost: ITruckCost = {
  truckId: undefined,
  ...defaultCommonTruckCost,
};

export const defaultDriverCost: IDriverCost = {
  driverId: undefined,
  driverAverageCost: null,
  updatedAt: new Date(),
  createdAt: new Date(),
};

const defaultValue: ITruckAndDriverCost = {
  averageCost: '',
  businessUnitId: null,
  changedBy: { id: '', name: '' },
  date: new Date(),
  detailedCosts: false,
  driverAverageCost: '',
  id: 0,
  truckAverageCost: '',
  updatedAt: new Date(),
  createdAt: new Date(),
  truckTypeCosts: [],
  truckCosts: [],
  driverCosts: [],
};

export const getValues = (item: ITruckAndDriverCost | null) => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
