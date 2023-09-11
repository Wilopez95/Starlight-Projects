import React, { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Trans } from '../../i18n';
import { useLocation } from 'react-router-dom';
import {
  HaulingMaterial,
  OrderStatus,
  OrderType,
  OrderUpdateInput,
  PaymentMethodType,
  useGetOrderLazyQuery,
  useUpdateOrderMutation,
  OrderBillableItemType,
  useGetHaulingMaterialsLazyQuery,
  GetHaulingMaterialsQueryVariables,
  GetOrderQuery,
} from '../../graphql/api';

import { EditDumpOrder } from './EditDumpOrder';
import { EditLoadOrder } from './EditLoadOrder';
import { showError, showSuccess } from '../../components/Toast';
import { refreshYardOperationConsole } from './refreshYardOperationConsole';
import { EditNonServiceOrder } from './NonServiceOrder';
import { LoadingEditOrderFormWrapper } from './components/LoadingEditOrderFormWrapper';
import { EditOrderFormWrapperProps } from './components/EditOrderFormWrapper';
import { ReadOnlyOrderFormComponent } from './types';
import { MeasureTarget, useCompanyMeasurementUnits } from '../../hooks/useCompanyMeasurementUnits';
import { orderStatuses } from '../OrdersView/constant';
import { usePlaceNewOrdersOnAccountAllowed } from './hooks/usePlaceNewOrdersOnAccountAllowed';
import delay from '../../utils/delay';
import { isNumber, isString } from 'lodash';
import {
  getUomTypeFromString,
  convertKgToUom,
  UnitOfMeasurementType,
} from '../../hooks/useUnitOfMeasurementConversion';
import { MaterialOrderContext } from '../../utils/contextProviders/MaterialOrderProvider';
import { Order } from '@starlightpro/common/graphql/api';

interface OrderProps
  extends ReadOnlyOrderFormComponent,
    Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  orderId: number;
  onSubmitted?(): void;
  onChangeStep?(): void;
  onBackStep?(status: Order['status']): void;
}

export const EditOrder: FC<OrderProps> = ({
  orderId,
  readOnly,
  noDrawer,
  onSubmitted: onSubmittedProp,
  onChangeStep,
}) => {
  const [getOrder, { data, called: isOrderFetched }] = useGetOrderLazyQuery({
    variables: { id: orderId },
    fetchPolicy: 'no-cache',
  });

  const materialUnit: React.MutableRefObject<UnitOfMeasurementType | unknown> = useRef(null);

  const { convertWeights } = useCompanyMeasurementUnits();
  const [updateOrderMutation] = useUpdateOrderMutation();
  const location = useLocation();
  const type = data?.order?.type;
  const materialUom = data?.order?.material?.units;
  const [getMaterials, { data: materialsData }] = useGetHaulingMaterialsLazyQuery();

  const materialContext = useContext(MaterialOrderContext);
  const [isParsedToUOM, setIsParsedToUOM] = useState(false);

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

  useEffect(() => {
    const filter: GetHaulingMaterialsQueryVariables['filter'] = {
      activeOnly: true,
      equipmentItems: false,
    };

    getMaterials({
      variables: {
        filter,
      },
    });
  }, [getMaterials, data?.order]);

  const [overrideOrderStatus, setOverrideOrderStatus] = useState<
    GetOrderQuery['order']['status']
  >();
  useEffect(() => {
    if (isOrderFetched && !overrideOrderStatus) {
      return;
    }

    if (orderId) {
      getOrder();
    }
  }, [getOrder, isOrderFetched, orderId, overrideOrderStatus]);

  const onSubmitted = useCallback(
    async (values) => {
      showSuccess(<Trans>Order updated successfully!</Trans>);

      if (orderStatuses.includes(values.status)) {
        await getOrder();
      }

      if (onSubmittedProp) {
        onSubmittedProp();
      }

      if (location.pathname.indexOf('console') > -1) {
        // due to elastic sync
        await delay(1000);
        refreshYardOperationConsole();
      }
    },
    [getOrder, location.pathname, onSubmittedProp],
  );

  const updateOrder = useCallback(
    async (data: OrderUpdateInput) => {
      try {
        let weightScaleUom = data.weightScaleUom;
        let UOMString: string | undefined = weightScaleUom
          ? getUomTypeFromString(weightScaleUom).toString()
          : undefined;

        if (material && !UOMString) {
          UOMString = material?.units ? material?.units : undefined;
        }

        if (!UOMString) {
          UOMString = materialUom ? materialUom : undefined;
        }

        let weightOutConverted = convertWeights(data.weightOut, MeasureTarget.backend, UOMString);
        let weightInConverted = convertWeights(data.weightIn, MeasureTarget.backend, UOMString);

        const canTare = convertWeights(data.canTare, MeasureTarget.backend);
        const truckTare = data.truckTare;
        const weightOut = {
          weightOut:
            data.type === OrderType.Dump && data.useTare ? canTare + truckTare : weightOutConverted,
        };

        const weightIn = {
          weightIn:
            data.type === OrderType.Load && (data.useTare || data.bypassScale)
              ? canTare + truckTare
              : weightInConverted,
        };

        let bypassScaleValue: boolean = false;

        if (Number(data.canTare) > 0 || Number(data.truckTare) > 0) {
          bypassScaleValue = true;
        }

        const updateData = {
          ...convertWeights(
            data,
            MeasureTarget.backend,
            UOMString,
            materialsData?.haulingMaterials.data,
            { trackBillableItemConversion: false },
          ),
          ...(isNumber(data.weightOut) || isString(data.weightOut) ? weightOut : {}),
          ...(isNumber(data.weightIn) || isString(data.weightIn) ? weightIn : {}),
          canTare,
          truckTare,
          bypassScale: bypassScaleValue,
        };

        await updateOrderMutation({
          variables: {
            data: updateData,
          },
        });
        setIsParsedToUOM(true);
        setOverrideOrderStatus(undefined);
      } catch (e) {
        showError(<Trans>Could not update order</Trans>);
        throw e;
      }
    },
    [updateOrderMutation, convertWeights, material, materialUom, materialsData],
  );

  const isOnAccountAllowed = usePlaceNewOrdersOnAccountAllowed();
  const showOnAccount = useMemo(
    () =>
      data?.order.customer?.onAccount &&
      ((data?.order.customer?.onHold && isOnAccountAllowed) || !data?.order.customer?.onHold),
    [data?.order.customer?.onAccount, data?.order.customer?.onHold, isOnAccountAllowed],
  );

  const modifiedOrder = useMemo(() => {
    if (!data) {
      return null;
    }
    const materials = materialsData?.haulingMaterials.data || [];
    let convertedWeights = data.order;
    const materialUnits = convertedWeights.material?.units;

    if (data.order.weightScaleUom) {
      const uomType = getUomTypeFromString(data.order.weightScaleUom);
      materialUnit.current = uomType;
      convertedWeights.weightIn = convertKgToUom(data.order.originalWeightIn || 0, uomType);
      convertedWeights.weightOut = convertKgToUom(data.order.originalWeightOut || 0, uomType);
    } else if (materialUnits && !materialContext.material) {
      materialContext.setMaterial(convertedWeights.material);
      const uomType = getUomTypeFromString(materialUnits);
      materialUnit.current = uomType;
      convertedWeights.weightIn = convertedWeights.originalWeightIn
        ? convertKgToUom(convertedWeights.originalWeightIn || 0, uomType)
        : convertedWeights.originalWeightIn;

      convertedWeights.weightOut = convertedWeights.originalWeightOut
        ? convertKgToUom(convertedWeights.originalWeightOut || 0, uomType)
        : convertedWeights.originalWeightOut;

      convertedWeights.billableItems.map((bill) => {
        if (bill.type === OrderBillableItemType.Material) {
          const units =
            materials.find((material) => material.id === bill.materialId)?.units || undefined;
          bill.quantity = convertKgToUom(bill.quantity || 0, units as UnitOfMeasurementType);
        }

        return bill;
      });
    } else if (!materialUnits) {
      convertedWeights = convertWeights(data.order, MeasureTarget.backend, undefined, materials);
    }

    if (materialContext.material) {
      convertedWeights.material = materialContext.material;
    }

    return {
      ...convertedWeights,
      weightIn: data.order?.weightIn,
      customerTruck: convertWeights(data.order?.customerTruck),
      canTare: convertWeights(data.order.canTare),
      truckTare: convertWeights(data.order.truckTare),
      status: overrideOrderStatus || convertedWeights.status,
      paymentMethod:
        data?.order?.status === OrderStatus.InYard
          ? showOnAccount
            ? PaymentMethodType.OnAccount
            : PaymentMethodType.CreditCard
          : data?.order?.paymentMethod,
    };
  }, [overrideOrderStatus, convertWeights, data, showOnAccount, materialContext, materialsData]);

  const onBackStep = (toStatus: GetOrderQuery['order']['status']) => {
    setOverrideOrderStatus(toStatus);
  };

  useEffect(() => {
    if (overrideOrderStatus && modifiedOrder && !isOrderFetched) {
      modifiedOrder.status = overrideOrderStatus;
    }
  }, [overrideOrderStatus, modifiedOrder, isOrderFetched]);

  if (modifiedOrder) {
    modifiedOrder.status = overrideOrderStatus || modifiedOrder.status;
  }

  if (!modifiedOrder) {
    return <LoadingEditOrderFormWrapper noDrawer={noDrawer} />;
  }

  if (type === OrderType.Dump) {
    return (
      <EditDumpOrder
        order={modifiedOrder}
        updateOrder={updateOrder}
        readOnly={readOnly}
        noDrawer={noDrawer}
        onSubmitted={onSubmitted}
        onChangeStep={onChangeStep}
        isParsedToUOM={isParsedToUOM}
        doConvertWeights={true}
        onBackStep={onBackStep}
      />
    );
  }

  if (type === OrderType.Load) {
    return (
      <EditLoadOrder
        order={modifiedOrder}
        updateOrder={updateOrder}
        readOnly={readOnly}
        noDrawer={noDrawer}
        onSubmitted={onSubmitted}
        onChangeStep={onChangeStep}
        isParsedToUOM={isParsedToUOM}
        doConvertWeights={true}
      />
    );
  }

  if (type === OrderType.NonService) {
    return (
      <EditNonServiceOrder
        order={modifiedOrder}
        updateOrder={updateOrder}
        readOnly={readOnly}
        noDrawer={noDrawer}
        onSubmitted={onSubmitted}
      />
    );
  }

  return null;
};
