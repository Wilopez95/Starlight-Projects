import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Paths, pathToUrl } from '../../../routes';
import { useParams } from 'react-router';
import { ParamsKeys } from '../../../routes/Params';
import {
  GetOrderQuery,
  useGetCompanyYardInstructionsQuery,
  useGetOrderQuery,
  useMakeOrderPaymentMutation,
  useUpdateOrderMutation,
} from '../../../graphql/api';
import { ContentLoader, showError, showSuccess } from '@starlightpro/common';
import CheckBoxField from '@starlightpro/common/components/CheckBoxField';
import { Trans, useTranslation } from '../../../i18n';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { TruckOnScalesWeight } from './TruckOnScalesWeight';
import { SelfServiceFooter } from '../components/SelfServiceFooter';
import { GeneralKioskView } from '../components';
import {
  MeasureTarget,
  useCompanyMeasurementUnits,
} from '../../../hooks/useCompanyMeasurementUnits';
import { Form } from 'react-final-form';
import { validate } from '../../../utils/forms';
import { schema } from '../SelfServiceOrderForm/schema';
import { getDumpInitialValues } from '../../YardOperationConsole/EditDumpOrder/getDumpInitialValues';
import { getArrivalDumpOrderInitialValues } from '../../YardOperationConsole/EditDumpOrder/ArrivalDumpOrderForm/getArrivalDumpOrderInitialValues';
import { getPaymentDumpOrderInitialValues } from '../../YardOperationConsole/EditDumpOrder/DumpOrderPaymentForm/getPaymentDumpOrderInitialValues';
import { defaultCreateOrderFormValues } from '../SelfServiceOrderForm/selfServiceInitialValues';
import { CreateOrderFormValues } from '../../YardOperationConsole/components/CreateOrderForm';
import { getOrderUpdateInput } from '../../YardOperationConsole/helpers/getOrderUpdateInput';
import { ScaleWeightInValues } from '../../YardOperationConsole/Inputs/ScaleWeightInValues';

const useStyles = makeStyles(({ palette }) => ({
  instructionText: {
    fontSize: '2rem',
    wordBreak: 'break-word',
  },
  instruction: {
    backgroundColor: palette.yellow,
  },
}));

export const KioskTruckOnScalesView = () => {
  const history = useHistory();
  const { orderId, scaleId } = useParams<ParamsKeys>();
  const [didReadInstruction, setDidReadInstruction] = useState(false);
  const classes = useStyles();
  const { t } = useTranslation();
  const { convertWeights } = useCompanyMeasurementUnits();
  const [updateOrderMutation] = useUpdateOrderMutation();
  const [makeOrderPayment] = useMakeOrderPaymentMutation();

  const { data, loading, error } = useGetOrderQuery({
    variables: {
      id: +orderId,
    },
    fetchPolicy: 'cache-and-network',
  });

  const order = useMemo(
    () =>
      data?.order
        ? ({
            ...convertWeights(data?.order),
            customerTruck: convertWeights(data?.order?.customerTruck),
          } as GetOrderQuery['order'])
        : null,
    [convertWeights, data],
  );

  const { data: instructionData } = useGetCompanyYardInstructionsQuery();

  const instruction = instructionData?.company?.yardInstructions;

  const handleGoBack = useCallback(() => {
    const route = pathToUrl(Paths.KioskModule.EditSelfServiceOrder, {
      orderId,
      scaleId,
    });

    history.push(route);
  }, [history, orderId, scaleId]);

  const orderHasTaxes = useMemo(() => !!data?.order?.taxTotal, [data?.order]);

  useEffect(() => {
    if (!!error) {
      handleGoBack();
    }
  }, [error, handleGoBack]);

  useEffect(() => {
    setDidReadInstruction(orderHasTaxes);
  }, [orderHasTaxes]);

  const initialValues = useMemo(
    () =>
      order
        ? {
            ...getDumpInitialValues(order),
            ...getArrivalDumpOrderInitialValues(order),
            ...getPaymentDumpOrderInitialValues(order),
          }
        : defaultCreateOrderFormValues,
    [order],
  );

  const onSubmit = useCallback(
    async (values: CreateOrderFormValues) => {
      try {
        await updateOrderMutation({
          variables: {
            data: convertWeights(
              getOrderUpdateInput({
                ...values,
                id: +orderId,
                weightIn: values.weightIn,
              }),
              MeasureTarget.backend,
            ),
          },
        });

        await makeOrderPayment({ variables: { id: +orderId } });

        showSuccess(<Trans>Order has been updated!</Trans>);
      } catch (e) {
        if (values.id) {
          showError(<Trans>Could not update order</Trans>);
        }
        throw e;
      }
    },
    [orderId, updateOrderMutation, convertWeights, makeOrderPayment],
  );

  if (loading && !order) {
    return <ContentLoader expanded />;
  }

  return (
    <Form
      initialValues={initialValues}
      onSubmit={onSubmit}
      subscription={{ values: true }}
      validate={async (values) =>
        validate(
          {
            ...values,
          },
          schema,
        )
      }
      render={({ handleSubmit, values }) => (
        <GeneralKioskView
          title={t('TRUCK ON SCALE')}
          titleVariant="h4"
          footer={
            <SelfServiceFooter
              isWeightCapturing
              handleSubmit={handleSubmit}
              disableNextStep={!didReadInstruction}
              disableSubmitWhenPristine={false}
              prevPage={Paths.KioskModule.EditSelfServiceOrder}
              nextPage={Paths.KioskModule.AttachPhotos}
              submitText={t('Attach a Photo')}
            />
          }
        >
          <Box>
            <Box mb={2}>
              <Typography variant="h4">{t('Weight In ')}</Typography>
            </Box>
            {order && (
              <>
                <ScaleWeightInValues allowOverride />
                <TruckOnScalesWeight
                  weightIn={values.weightIn ?? 0}
                  order={convertWeights(order)}
                  scaleId={+scaleId}
                />
              </>
            )}
            <Box mt={3}>
              <Box mb={2}>
                <Typography variant="h4">{t('Yard Instruction')}</Typography>
              </Box>
              <Box p={3} className={classes.instruction}>
                <Typography className={classes.instructionText} variant="body1">
                  {instruction}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="center" pt={2}>
                <CheckBoxField
                  checked={didReadInstruction}
                  onChange={(_, value) => setDidReadInstruction(value)}
                  label={t('I Read the Yard Instruction')}
                  name="readYarnInstruction"
                />
              </Box>
            </Box>
          </Box>
        </GeneralKioskView>
      )}
    />
  );
};
