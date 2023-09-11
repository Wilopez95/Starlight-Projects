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
  WalkUpCustomerInput,
  WeightInput,
  WorkOrderInput,
} from '../Inputs';
import {
  MeasurementType,
  MeasurementUnit,
  OrderType,
  useCreateOrderMutation,
} from '../../../graphql/api';
import { schema } from './schema';
import { formDecorator } from './formDecorator';
import { validate } from '../../../utils/forms';
import { closeSidePanel } from '../../../components/SidePanels';
import { showError, showSuccess } from '../../../components/Toast';
import { refreshYardOperationConsole } from '../refreshYardOperationConsole';
import CustomerOnHoldWarning from '../../../components/CustomerOnHoldWarning';
import { FormApi } from 'final-form';
import { CreateOrderForm, CreateOrderFormValues } from '../components/CreateOrderForm';
import { FormHeader } from '../components/FormHeader';
import EmptyTruckToScaleSvg from '../components/icons/EmptyTruckToScaleSvg';
import { HeaderComponentProps } from '@starlightpro/common/components/SidepanelView';
import { OrderFormSidebar } from '../components/OrderFormSidebar';
import { TwoFieldsRow } from '../components/TwoFieldsRow';
import { FieldsRowDivider } from '../components/FieldsRowDivider';
import { ScaleWeightInValues } from '../Inputs/ScaleWeightInValues';
import {
  MeasureTarget,
  useCompanyMeasurementUnits,
} from '../../../hooks/useCompanyMeasurementUnits';
import delay from '../../../utils/delay';
import { LicensePlateInput } from '../Inputs/LicensePlateInput';
import { useScale } from '../../../hooks/useScale';
import { getUomTranslation } from '../../../hooks/useUnitOfMeasurementConversion';

const HeaderComponent: FC<HeaderComponentProps> = () => {
  return (
    <FormHeader icon={<EmptyTruckToScaleSvg />} headerText={<Trans>Empty Truck To Scale</Trans>} />
  );
};

const initialValues = {
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
};

export const EmptyTruckToScaleForm = () => {
  const [createOrder] = useCreateOrderMutation();
  const { massTranslation, convertWeights } = useCompanyMeasurementUnits();
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
        await createOrder({
          variables: {
            data: {
              ...omit(values, [
                'customer',
                'containerWeight',
                'project',
                'material',
                'customerJobSite',
                'customerTruck',
                'originDistrict',
                'totalWeight',
              ]),
              arrivedAt: new Date(),
              truckTare: values.customerTruck?.emptyWeight,
              canTare: values.containerWeight,
              weightIn: convertWeights(values.weightIn, MeasureTarget.backend),
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
      } catch (e: any) {
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

  const selectedUom = scaleUnitOfMeasurementType;

  return (
    <CreateOrderForm
      validate={async (values: any) => validate(values, schema)}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      subscription={{}}
      decorators={[dynamicFieldsDecorator] as any}
      sidePanel={<OrderFormSidebar captureTareWeightEnabled />}
      HeaderComponent={HeaderComponent}
    >
      <Box>
        <Box mb={1}>
          <WalkUpCustomerInput />
        </Box>
        <TwoFieldsRow>
          <CustomerInput autoFocus active />
          <LicensePlateInput />
        </TwoFieldsRow>
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
        <FieldsRowDivider />
        <Box mb={1}>
          <WeightInput
            fieldName="weightIn"
            label={`(${selectedUom ? getUomTranslation(selectedUom) : massTranslation})`}
            isScaleValueChange
          />
          <ScaleWeightInValues />
        </Box>
      </Box>
    </CreateOrderForm>
  );
};
