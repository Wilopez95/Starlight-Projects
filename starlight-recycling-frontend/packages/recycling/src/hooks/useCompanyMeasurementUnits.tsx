import { useTranslation } from '@starlightpro/common/i18n';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import configureMeasurements, {
  AllMeasures,
  allMeasures,
  AllMeasuresSystems,
  AllMeasuresUnits,
  mass,
  MassSystems,
  Measure,
} from 'convert-units';
import {
  HaulingMaterial,
  HaulingMeasurementUnit,
  OrderBillableItem,
  useGetHaulingCompanyGeneralSettingsQuery,
} from '../graphql/api';
import { MassImperialUnits, MassMetricUnits } from 'convert-units/lib/cjs/definitions/mass';
import { round, isNumber, isPlainObject } from 'lodash-es';
import { isMaterialOrderBillableItem } from '../views/YardOperationConsole/helpers/formatBillableItems';
import { UnitOfMeasurementType } from '../constants/unitOfMeasurement';
import {
  convertKgToUom,
  convertUomToKg,
  getUomTranslation,
  getUomTypeFromString,
} from './useUnitOfMeasurementConversion';
import { MaterialOrderContext } from '../utils/contextProviders/MaterialOrderProvider';
import { useScale } from './useScale';

type ExtendedMassImperialUnits = MassImperialUnits | 'lt';
type ExtendedMassUnits = ExtendedMassImperialUnits | MassMetricUnits;
type ExtendedAllMeasureUnits = AllMeasuresUnits | 'lt';
type ConvertWeight = (
  target?: MeasureTarget,
) => (weight: number, UOMmaterial?: string, useCompanySettings?: boolean) => number;

type ConvertProps = {
  trackBillableItemConversion?: boolean;
  useCompanySettings?: boolean;
};

export type ConvertWeights = (
  weightParam: any,
  target?: MeasureTarget,
  UOMmaterial?: string,
  materials?: Pick<HaulingMaterial, 'id' | 'units'>[],
  props?: ConvertProps,
) => any;

export enum MeasureTarget {
  tenant = 'tenant',
  backend = 'backend',
}

type ConvertedOrderBillableItem = OrderBillableItem & { converted?: boolean };

const extendedMass: Measure<MassSystems, ExtendedMassUnits> = {
  systems: {
    metric: mass.systems.metric,
    imperial: {
      ...mass.systems.imperial,
      lt: {
        name: {
          singular: 'Long Ton',
          plural: 'Long Tons',
        },
        to_anchor: 2240, // pounds in long ton
      },
    },
  },
  anchors: {
    ...mass.anchors,
  },
};

export const massConvertionMap: Map<HaulingMeasurementUnit, any> = new Map([
  [HaulingMeasurementUnit.Imperial, { measure: 'lt', translation: 'Long Tons' }],
  [HaulingMeasurementUnit.Us, { measure: 't', translation: 'Short Tons' }],
  [HaulingMeasurementUnit.Metric, { measure: 'mt', translation: 'Tonnes' }],
]);

const convert = configureMeasurements<AllMeasures, AllMeasuresSystems, ExtendedAllMeasureUnits>({
  ...allMeasures,
  mass: extendedMass,
});

export const useCompanyMeasurementUnits = () => {
  const { data } = useGetHaulingCompanyGeneralSettingsQuery();
  const { t } = useTranslation();
  const { unitOfMeasurementType: scaleUnitOfMeasurementType } = useScale();
  const companySettings = data?.haulingCompanyGeneralSettings;
  const weightMeasurement = useMemo(
    () => massConvertionMap.get(companySettings?.unit || HaulingMeasurementUnit.Us),
    [companySettings?.unit],
  );
  const materialContext = useContext(MaterialOrderContext);

  const [material, setMaterial] = useState<
    | ({
        __typename?: 'HaulingMaterial' | undefined;
      } & Pick<
        HaulingMaterial,
        'id' | 'description' | 'misc' | 'useForDump' | 'useForLoad' | 'units'
      >)
    | undefined
  >(materialContext.material);

  useEffect(() => {
    setMaterial(materialContext.material);
  }, [materialContext]);

  const convertScaleWeight = useCallback(
    (mass, scaleUOM?: UnitOfMeasurementType) => {
      if (material && !scaleUOM) {
        const weightInKG = round(
          convert(mass || 0)
            .from('mcg')
            .to('kg'),
          4,
        );

        return convertKgToUom(weightInKG, material?.units as UnitOfMeasurementType);
      } else {
        if (scaleUOM) {
          const weightInKG = round(
            convert(mass || 0)
              .from('mcg')
              .to('kg'),
            4,
          );

          return convertKgToUom(weightInKG, scaleUOM as UnitOfMeasurementType);
        }

        return round(
          convert(mass || 0)
            .from('mcg')
            .to(weightMeasurement.measure),
          2,
        );
      }
    },
    [weightMeasurement.measure, material],
  );

  const convertWeight = useCallback<ConvertWeight>(
    (target) =>
      target === 'tenant'
        ? (mass, uomType, useCompanySettings = false) => {
            if (
              !useCompanySettings &&
              (materialContext.material || scaleUnitOfMeasurementType || uomType)
            ) {
              let uomTarget =
                (uomType && getUomTypeFromString(uomType)) || scaleUnitOfMeasurementType;

              if (!uomTarget) {
                uomTarget = materialContext.material?.units as UnitOfMeasurementType;
              }

              return convertKgToUom(mass, uomTarget);
            } else {
              return round(convert(mass).from('kg').to(weightMeasurement.measure), 2);
            }
          }
        : (mass, uomType, useCompanySettings = false) => {
            if (
              !useCompanySettings &&
              (materialContext.material || scaleUnitOfMeasurementType || uomType)
            ) {
              let uomTarget =
                (uomType && getUomTypeFromString(uomType)) || scaleUnitOfMeasurementType;

              if (!uomTarget) {
                uomTarget = materialContext.material?.units as UnitOfMeasurementType;
              }

              return convertUomToKg(mass, uomTarget);
            } else {
              return round(convert(mass).from(weightMeasurement.measure).to('kg'), 4);
            }
          },

    [weightMeasurement.measure, materialContext, scaleUnitOfMeasurementType],
  );

  const convertWeights = useCallback<ConvertWeights>(
    (
      weightParam,
      target = MeasureTarget.tenant,
      UOMType,
      materials?: Pick<HaulingMaterial, 'id' | 'units'>[],
      props = {
        trackBillableItemConversion: true,
        useCompanySettings: false,
      },
    ) => {
      if (!weightParam) {
        return 0;
      }

      const convertTargetWeight = convertWeight(target);

      if (isNumber(weightParam)) {
        return convertTargetWeight(weightParam, UOMType, props.useCompanySettings);
      }

      if (isPlainObject(weightParam)) {
        const convertedOrder = { ...weightParam };

        const convertMaterialOrderBillableItemQuantity = (
          billableItems: ConvertedOrderBillableItem[] & { converted?: boolean },
        ) => {
          return billableItems.map((billableItem) => {
            if (isMaterialOrderBillableItem(billableItem)) {
              let useUOM = UOMType;

              if (materials) {
                useUOM =
                  materials.find((material) => material.id === billableItem.materialId)?.units ||
                  undefined;
              } else if (billableItem.material != null) {
                useUOM = billableItem.material.units || UOMType;
              }

              const convertedData = {
                ...billableItem,
                quantity: convertTargetWeight(
                  billableItem.quantity,
                  useUOM,
                  props.useCompanySettings,
                ), //, UOMmaterial
              };

              if (props.trackBillableItemConversion) {
                convertedData.converted = true;
              }

              return convertedData;
            }

            return billableItem;
          });
        };

        if (convertedOrder.billableItems) {
          convertedOrder.billableItems = convertMaterialOrderBillableItemQuantity(
            convertedOrder.billableItems,
          );
        }

        if (convertedOrder.orderBillableItems) {
          convertedOrder.orderBillableItems = convertMaterialOrderBillableItemQuantity(
            convertedOrder.orderBillableItems,
          );
        }

        return convertedOrder;
      }

      return weightParam;
    },
    [convertWeight],
  );

  const massTranslation = useMemo(() => {
    if (material) {
      return getUomTranslation(material?.units as UnitOfMeasurementType);
    } else {
      return t(weightMeasurement.translation);
    }
  }, [t, weightMeasurement.translation, material]);

  return {
    convertScaleWeight,
    massTranslation,
    convertWeights,
  };
};
