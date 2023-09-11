import React, { useCallback } from 'react';
import { Paths } from '../../../routes';
import { useParams } from 'react-router';
import { ParamsKeys } from '../../../routes/Params';
import { useGetOrderQuery, useUpdateOrderMutation } from '../../../graphql/api';
import { ContentLoader, showError, showSuccess } from '@starlightpro/common';
import { getDumpInitialValues } from '../../YardOperationConsole/EditDumpOrder/getDumpInitialValues';
import { CreateOrderFormValues } from '../../YardOperationConsole/components/CreateOrderForm';
import { defaultCreateOrderFormValues } from '../SelfServiceOrderForm/selfServiceInitialValues';
import { getOrderUpdateInput } from '../../YardOperationConsole/helpers/getOrderUpdateInput';
import { Trans } from '../../../i18n';
import { Form } from 'react-final-form';
import { ImagesContainer } from '../../YardOperationConsole/EditDumpOrder/ArrivalDumpOrderForm/ImagesContainer';
import { getArrivalDumpOrderInitialValues } from '../../YardOperationConsole/EditDumpOrder/ArrivalDumpOrderForm/getArrivalDumpOrderInitialValues';
import { SelfServiceFooter } from '../components/SelfServiceFooter';
import { validate } from '../../../utils/forms';
import { schema } from './schema';
import { GeneralKioskView } from '../components';
import { getPaymentDumpOrderInitialValues } from '../../YardOperationConsole/EditDumpOrder/DumpOrderPaymentForm/getPaymentDumpOrderInitialValues';
import { TaxTotalField } from '../../YardOperationConsole/Inputs/TaxTotalField';
import {
  MeasureTarget,
  useCompanyMeasurementUnits,
} from '../../../hooks/useCompanyMeasurementUnits';

export const KioskAttachPhotosView = () => {
  const { orderId } = useParams<ParamsKeys>();
  const [updateOrderMutation] = useUpdateOrderMutation();
  const { convertWeights } = useCompanyMeasurementUnits();

  const { data, loading } = useGetOrderQuery({
    variables: {
      id: +orderId,
    },
    fetchPolicy: 'cache-and-network',
  });

  const order = data?.order;

  const initialValues = order
    ? convertWeights({
        ...getDumpInitialValues(order),
        ...getArrivalDumpOrderInitialValues(order),
        ...getPaymentDumpOrderInitialValues(order),
      })
    : defaultCreateOrderFormValues;

  const onSubmit = useCallback(
    async (values: CreateOrderFormValues) => {
      try {
        await updateOrderMutation({
          variables: {
            data: convertWeights(
              getOrderUpdateInput({
                ...values,
                id: +orderId,
              }),
              MeasureTarget.backend,
            ),
          },
        });
        showSuccess(<Trans>Order has been updated!</Trans>);
      } catch (e) {
        if (values.id) {
          showError(<Trans>Could not update order</Trans>);
        }
        throw e;
      }
    },
    [convertWeights, orderId, updateOrderMutation],
  );

  if (loading) {
    return <ContentLoader expanded />;
  }

  return (
    <Form
      initialValues={initialValues}
      onSubmit={onSubmit}
      subscription={{}}
      validate={async (values) =>
        validate(
          {
            ...values,
          },
          schema,
        )
      }
      render={({ handleSubmit }) => (
        <GeneralKioskView
          title={<Trans>Attach a Photo</Trans>}
          footer={
            <SelfServiceFooter
              handleSubmit={handleSubmit}
              disableSubmitWhenPristine={false}
              prevPage={Paths.KioskModule.TruckOnScale}
              nextPage={Paths.KioskModule.InboundSummary}
              submitText={<Trans>Complete Inbound</Trans>}
            />
          }
        >
          <ImagesContainer maxCount={10} hideTitle orderId={+orderId} />
          <TaxTotalField empty />
        </GeneralKioskView>
      )}
    />
  );
};
