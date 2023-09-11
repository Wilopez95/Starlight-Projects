import configureMeasurements, { allMeasures, mass, MassSystems, Measure } from 'convert-units';
import { HaulingMeasurementUnit } from '../../../../../services/core/types/HaulingCompany';
import {
  MassImperialUnits,
  MassMetricUnits,
  MassUnits,
} from 'convert-units/lib/cjs/definitions/mass';
import { round } from 'lodash';
import { OrderBillableItem, OrderBillableItemInput } from '../../../entities/OrderBillableItem';
import { isMaterialOrderBillableItem } from './orderHelpers';

type ExtendedMassImperialUnits = MassImperialUnits | 'lt';
type ExtendedMassUnits = ExtendedMassImperialUnits | MassMetricUnits;
type ExtendedAllMeasureUnits = MassUnits | 'lt';

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

const BACK_END_WEIGHT_MEASURE = 'kg';

export const massConversionMap: Map<HaulingMeasurementUnit, any> = new Map([
  [HaulingMeasurementUnit.imperial, { measure: 'lt', translation: 'Long Tons' }],
  [HaulingMeasurementUnit.us, { measure: 't', translation: 'Short Tons' }],
  [HaulingMeasurementUnit.metric, { measure: 'mt', translation: 'Tonnes' }],
]);

export const convert = configureMeasurements<'mass', MassSystems, ExtendedAllMeasureUnits>({
  ...allMeasures,
  mass: extendedMass,
});

export const convertItem = (
  item: number,
  buUnits: HaulingMeasurementUnit | null = HaulingMeasurementUnit.us,
): number => {
  return round(
    convert(item)
      .from(BACK_END_WEIGHT_MEASURE)
      .to(massConversionMap.get(buUnits ?? HaulingMeasurementUnit.us).measure),
    2,
  );
};

export const convertBillableItemTotalToBUUnits = (
  item: OrderBillableItem | OrderBillableItemInput,
  buUnits: HaulingMeasurementUnit | null = HaulingMeasurementUnit.us,
): number =>
  isMaterialOrderBillableItem(item)
    ? (item.price ?? 0) * convertItem(item.quantity ?? 0, buUnits)
    : (item.price ?? 0) * (item.quantity ?? 0);
