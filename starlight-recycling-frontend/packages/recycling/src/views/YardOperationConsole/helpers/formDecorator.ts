import createDecorator from 'final-form-calculate';
import { defaultTo, map, pipe, prop, sum, toNumber } from 'lodash/fp';
import { GetOrderQuery } from '../../../graphql/api';
import { preventUpdate } from './utils';
import { ConvertWeights } from '../../../hooks/useCompanyMeasurementUnits';
import { getNetWeight } from './getNetWeight';
import { isMaterialOrderBillableItem } from './formatBillableItems';

export const dynamicFieldsDecorator = (convert: ConvertWeights) => {
  const calcNetWeight = (state: any) => {
    let {
      weightIn,
      weightOut,
      truckTare,
      canTare,
      containerId,
      type,
      weightScaleUom,
      material,
      useTare,
    } = state;

    let useWeightOut = weightOut;

    if (useTare) {
      useWeightOut = containerId ? (truckTare ?? 0) + (canTare ?? 0) : truckTare;
    }

    let result = getNetWeight(type, weightIn, useWeightOut, weightScaleUom, material?.units);

    return result || 0;
  };

  const updateQuantityForMaterialBillableItem = (value: number | null, state: any) => {
    return (state.billableItems as GetOrderQuery['order']['billableItems']).map((bi) => ({
      ...bi,
      quantity: isMaterialOrderBillableItem(bi) ? bi.quantityConverted : bi.quantity,
    }));
  };

  const updateNewWeight = (value: number | null, state: any) => {
    return calcNetWeight(state).toFixed(2);
  };

  return createDecorator(
    {
      field: 'customerTruck',
      updates: {
        containerId: (value, state: any, prevState: any) => {
          if (prevState.customerTruck && prevState.customerTruck.id !== value?.id) {
            return null;
          }

          return state.containerId;
        },
        truckTare: (value, state: any, prevState: any) => {
          if (prevState.customerTruck && prevState.customerTruck.id !== value?.id) {
            return convert(value?.emptyWeight) ?? 0;
          }

          return state.truckTare;
        },
        canTare: (value, state: any, prevState: any) => {
          if (
            prevState.customerTruck?.id &&
            prevState.customerTruck?.id !== state.customerTruck?.id
          ) {
            return 0;
          }

          return state.canTare;
        },
      },
    },
    {
      field: 'containerWeight',
      updates: {
        canTare: (value, state: any, prevState: any) => {
          if (
            prevState.customerTruck?.id &&
            prevState.customerTruck?.id !== state.customerTruck?.id
          ) {
            return 0;
          }

          return convert(state.containerWeight);
        },
      },
    },
    {
      field: 'jobSite',
      updates: {
        project: (value, state: any, prevState: any) => {
          if (prevState.jobSite && prevState.jobSite?.id !== value?.id) {
            return null;
          }

          return state.project;
        },
      },
    },
    {
      field: 'materialsDistribution',
      updates: {
        materialsDistributionTotal: (materialsDistribution, state: any, prevState: any) => {
          if (prevState.materialsDistribution !== state.materialsDistribution) {
            return sum(map(pipe(prop('value'), toNumber, defaultTo(0)), materialsDistribution));
          }

          return materialsDistribution;
        },
      },
    },
    {
      field: 'weightIn',
      isEqual: preventUpdate,
      updates: {
        billableItems: updateQuantityForMaterialBillableItem,
        netWeight: updateNewWeight,
      },
    },
    {
      field: 'weightOut',
      isEqual: preventUpdate,
      updates: {
        billableItems: updateQuantityForMaterialBillableItem,
        netWeight: updateNewWeight,
      },
    },
    {
      field: 'truckTare',
      isEqual: preventUpdate,
      updates: {
        billableItems: updateQuantityForMaterialBillableItem,
        netWeight: updateNewWeight,
      },
    },
    {
      field: 'canTare',
      isEqual: preventUpdate,
      updates: {
        billableItems: updateQuantityForMaterialBillableItem,
        netWeight: updateNewWeight,
      },
    },
    {
      field: 'useTare',
      updates: {
        billableItems: updateQuantityForMaterialBillableItem,
        netWeight: updateNewWeight,
      },
    },
    {
      field: 'minimalWeight',
      updates: {
        billableItems: updateQuantityForMaterialBillableItem,
      },
    },
    {
      field: 'bypassScale',
      updates: {
        netWeight: updateNewWeight,
      },
    },
  );
};
