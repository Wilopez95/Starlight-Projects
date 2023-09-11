import { EditOrderFormValues } from '../components/EditOrderForm';
import { GetOrderQuery, MeasurementType, MeasurementUnit } from '../../../graphql/api';
import { defaultTo } from 'lodash/fp';
import { getNetWeight } from '../helpers/getNetWeight';

export const getDumpInitialValues = (order: GetOrderQuery['order']): EditOrderFormValues => {
  return {
    id: order.id,
    note: order.note,
    type: order.type,
    status: order.status,
    customer: order.customer || null,
    customerTruck: order.customerTruck || null,
    useTare: order.useTare,
    truckTare: order.truckTare ?? order.customerTruck?.emptyWeight ?? 0,
    containerId: order.container?.id,
    canTare: order.canTare ?? order.container?.emptyWeight ?? 0,
    customerJobSite: order.customerJobSite || null,
    jobSite: order.jobSite || null,
    material: order.material || null,
    originDistrictId: order.originDistrictId,
    originDistrict: order.originDistrict,
    project: order.project || null,
    PONumber: order.PONumber,
    WONumber: order.WONumber || null,
    beforeTaxesTotal: order.beforeTaxesTotal,
    grandTotal: order.grandTotal,
    priceGroupId: order.priceGroupId,
    weightIn: order.weightIn,
    weightOut: order.weightOut,
    weightInSource: order.weightInSource || null,
    weightInTimestamp: order.weightInTimestamp || null,
    weightInType: order.weightInType || MeasurementType.Hardware,
    weightInUnit: order.weightInUnit || MeasurementUnit.Kilogram,
    billableServiceId: order.billableService?.id,
    billableServiceName: order.billableService?.description,
    netWeight: defaultTo(
      0,
      getNetWeight(
        order.type,
        order.weightIn,
        order.weightOut,
        order.weightScaleUom?.toString(),
        order.material?.units || undefined,
      ),
    ).toFixed(2),
    taxTotal: order.taxTotal,
    taxDistricts: order.taxDistricts,
    initialOrderTotal: order.initialOrderTotal,
    minimalWeight: order.minimalWeight ?? 0,
    weightScaleUom: order.weightScaleUom,
    licensePlate: order.nonCommercialTruck?.licensePlate,
  };
};
