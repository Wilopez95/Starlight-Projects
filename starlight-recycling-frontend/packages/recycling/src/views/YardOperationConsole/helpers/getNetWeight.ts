import { OrderType } from '../../../graphql/api';
import { defaultTo } from 'lodash/fp';
import {
  convertKgToUom,
  convertUomToKg,
  getUomTypeFromString,
} from '../../../hooks/useUnitOfMeasurementConversion';

export const getNetWeight = (
  type: OrderType,
  weightIn?: number | string | null,
  weightOut?: number | string | null,
  weightScaleUom?: string,
  materialUom?: string,
): number | undefined => {
  let wIn = defaultTo(0, Number(weightIn));
  let wOut = defaultTo(0, Number(weightOut));

  let netWeight = 0;
  const useUOM = weightScaleUom || materialUom;
  const convertToMaterialFromScale = useUOM != null;

  if (convertToMaterialFromScale && useUOM) {
    wIn = convertUomToKg(wIn, getUomTypeFromString(useUOM));
    wOut = wOut > 0 ? convertUomToKg(wOut, getUomTypeFromString(useUOM)) : 0;
  }

  switch (type) {
    case OrderType.Dump:
      netWeight = Number(wIn - wOut);
      break;
    case OrderType.Load:
      netWeight = Number(wOut - wIn);
      break;
  }

  if (convertToMaterialFromScale && useUOM) {
    netWeight = convertKgToUom(netWeight, getUomTypeFromString(useUOM));
  }

  return netWeight;
};
