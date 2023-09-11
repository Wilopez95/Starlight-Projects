import React, { FC, useCallback, useMemo } from 'react';
import { Trans } from '../../../i18n';
import { omit } from 'lodash-es';
import { Box } from '@material-ui/core';

import {
  ContainerInput,
  CustomerInput,
  CustomerTruckInput,
  NoteInput,
  ProductOrderInput,
  WorkOrderInput,
} from '../Inputs';
import {
  MeasurementType,
  MeasurementUnit,
  OrderType,
  useCreateOrderMutation,
} from '../../../graphql/api';
import { emptyTruckBypassScaleSchema } from './emptyTruckBypassScaleSchema';
import { formDecorator } from '../EmptyTruckToScaleForm/formDecorator';
import { validate } from '../../../utils/forms';
import { closeSidePanel } from '../../../components/SidePanels';
import { showError, showSuccess } from '../../../components/Toast';
import { refreshYardOperationConsole } from '../refreshYardOperationConsole';
import CustomerOnHoldWarning from '../../../components/CustomerOnHoldWarning';
import { FormApi } from 'final-form';
import { CreateOrderForm, CreateOrderFormValues } from '../components/CreateOrderForm';
import { FormHeader } from '../components/FormHeader';
import EmptyTruckBypassScaleSvg from '../components/icons/EmptyTruckBypassScaleSvg';
import { HeaderComponentProps } from '@starlightpro/common/components/SidepanelView';
import { OrderFormSidebar } from '../components/OrderFormSidebar';
import { TwoFieldsRow } from '../components/TwoFieldsRow';
import { FieldsRowDivider } from '../components/FieldsRowDivider';
import { ScaleWeightInValues } from '../Inputs/ScaleWeightInValues';
import { useCompanyMeasurementUnits } from '../../../hooks/useCompanyMeasurementUnits';
import delay from '../../../utils/delay';
import { useScale } from '../../../hooks/useScale';

const HeaderComponent: FC<HeaderComponentProps> = () => {
  return (
    <FormHeader
      icon={<EmptyTruckBypassScaleSvg />}
      headerText={<Trans>Empty Truck Bypass Scale</Trans>}
    />
  );
};

const initialValues: CreateOrderFormValues = {
  type: OrderType.Load,
  customer: null,
  customerJobSite: null,
  project: null,
  material: null,
  weightIn: null,
  weightInSource: null,
  weightInType: MeasurementType.Hardware,
  weightInUnit: MeasurementUnit.Kilogram,
  weightInTimestamp: null,
  bypassScale: true,
};

export const EmptyTruckBypassScaleForm = () => {
  const [createOrder] = useCreateOrderMutation();
  const { convertWeights } = useCompanyMeasurementUnits();
  const { unitOfMeasurementType: scaleUnitOfMeasurementType } = useScale();

  const handleSubmit = useCallback(
    async (
      values: CreateOrderFormValues,
      form: FormApi<CreateOrderFormValues, CreateOrderFormValues>,
    ) => {
      try {
        if (!scaleUnitOfMeasurementType) {
          throw new Error('Please select a scale');
        }
        const weightIn = (values.customerTruck?.emptyWeight || 0) + (values?.containerWeight || 0);
        await createOrder({
          variables: {
            data: {
              ...omit(
                values,
                'customer',
                'containerWeight',
                'project',
                'material',
                'customerJobSite',
                'customerTruck',
                'originDistrict',
                'totalWeight',
              ),
              canTare: values?.containerWeight,
              truckTare: values.customerTruck?.emptyWeight,
              weightIn,
              arrivedAt: new Date(),
              customerId: values.customer?.id,
              customerTruckId: values.customerTruck?.id,
              weightScaleUom: scaleUnitOfMeasurementType,
            },
          },
        });

        form.initialize(convertWeights(values));

        showSuccess(<Trans>Order created successfully!</Trans>);

        await delay(1000);
        await refreshYardOperationConsole();

        closeSidePanel();
      } catch (e) {
        if (e?.graphQLErrors?.length) {
          showError(e?.graphQLErrors[0].message);
        } else if (e.message) {
          showError(e.message);
        } else {
          showError(<Trans>Could not create Order</Trans>);
        }
      }
    },
    [convertWeights, createOrder, scaleUnitOfMeasurementType],
  );

  const dynamicFieldsDecorator = useMemo(() => formDecorator(), []);

  return (
    <CreateOrderForm
      validate={async (values: any) => validate(values, emptyTruckBypassScaleSchema)}
      initialValues={initialValues}
      subscription={{}}
      onSubmit={handleSubmit}
      decorators={[dynamicFieldsDecorator] as any}
      sidePanel={<OrderFormSidebar />}
      HeaderComponent={HeaderComponent}
      isWeightCapturing={false}
    >
      <Box>
        <ScaleWeightInValues />
        <Box mb={1}>
          <CustomerInput autoFocus ignoreWalkup />
        </Box>
        <CustomerOnHoldWarning />
        <TwoFieldsRow>
          <CustomerTruckInput />
          <ContainerInput />
        </TwoFieldsRow>
        <FieldsRowDivider />
        <TwoFieldsRow>
          <ProductOrderInput />
          <WorkOrderInput />
        </TwoFieldsRow>
        <FieldsRowDivider />
        <Box mb={1}>
          <NoteInput />
        </Box>
      </Box>
    </CreateOrderForm>
  );
};
