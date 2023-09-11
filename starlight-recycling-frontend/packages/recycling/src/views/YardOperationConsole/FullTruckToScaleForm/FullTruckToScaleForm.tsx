import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Trans } from '../../../i18n';
import { Box } from '@material-ui/core';
import { omit } from 'lodash-es';

import {
  ContainerInput,
  CustomerInput,
  CustomerTruckInput,
  JobSiteInput,
  MaterialInput,
  NoteInput,
  OriginDistrictInput,
  ProductOrderInput,
  ProjectInput,
  WalkUpCustomerInput,
  WeightInput,
  WorkOrderField,
} from '../Inputs';

import {
  CustomerType,
  GetOrderQuery,
  HaulingMaterial,
  OrderUpdateInput,
  useCreateOrderMutation,
  useGetRequireOriginQuery,
  useMakeOrderInYardMutation,
} from '../../../graphql/api';
import { getDumpInitialValues } from '../EditDumpOrder/getDumpInitialValues';
import { showError, showSuccess } from '../../../components/Toast';
import { closeSidePanel } from '../../../components/SidePanels';
import { refreshYardOperationConsole } from '../refreshYardOperationConsole';
import { validate } from '../../../utils/forms';
import { schema } from './schema';
import { formDecorator } from './formDecorator';
import CustomerOnHoldWarning from '../../../components/CustomerOnHoldWarning';
import { OrderFormSidebar } from '../components/OrderFormSidebar';
import { CreateOrderForm, CreateOrderFormValues } from '../components/CreateOrderForm';
import { HeaderComponentProps } from '@starlightpro/common/components/SidepanelView';
import { FormHeader } from '../components/FormHeader';
import { TwoFieldsRow } from '../components/TwoFieldsRow';
import { FieldsRowDivider } from '../components/FieldsRowDivider';
import { EditOrderFormValues } from '../components/EditOrderForm';
import { getOrderUpdateInput, OrderValues } from '../helpers/getOrderUpdateInput';

import FullTruckToScaleSvg from '../components/icons/FullTruckToScaleSvg';
import { ScaleWeightInValues } from '../Inputs/ScaleWeightInValues';
import { defaultCreateOrderFormValues } from './defaultCreateOrderFormValues';
import delay from '../../../utils/delay';
import { useTranslation } from '@starlightpro/common/i18n';
import {
  MeasureTarget,
  useCompanyMeasurementUnits,
} from '../../../hooks/useCompanyMeasurementUnits';
import { UnitOfMeasurementType } from '../../../constants/unitOfMeasurement';
import { MaterialOrderContext } from '../../../utils/contextProviders/MaterialOrderProvider';
import { getUomTranslation } from '../../../hooks/useUnitOfMeasurementConversion';
import { CustomerOption } from '../../../components/FinalForm/CustomerSearchField';
import { useScale } from '../../../hooks/useScale';
import { LicensePlateInput } from '../Inputs/LicensePlateInput';

interface Props {
  order?: GetOrderQuery['order'];
  onSubmitted?(data?: CreateOrderFormValues | EditOrderFormValues): Promise<void>;
  updateOrder?(data: OrderUpdateInput): Promise<void>;
}

export const HeaderComponent: FC<HeaderComponentProps> = () => {
  return (
    <FormHeader icon={<FullTruckToScaleSvg />} headerText={<Trans>Full Truck To Scale</Trans>} />
  );
};

export const FullTruckToScaleForm: FC<Props> = ({ onSubmitted, order, updateOrder }) => {
  const { data: requireOrigin } = useGetRequireOriginQuery();
  const [makeOrderInYard] = useMakeOrderInYardMutation();
  const [createOrderMutation] = useCreateOrderMutation();
  const { t } = useTranslation();
  const { massTranslation, convertWeights } = useCompanyMeasurementUnits();
  const { unitOfMeasurementType: scaleUnitOfMeasurementType } = useScale();

  const dynamicFieldsDecorator = useMemo(formDecorator, []);

  const initialValues = useMemo(() => {
    const converted = convertWeights(
      order ? (getDumpInitialValues(order) as CreateOrderFormValues) : defaultCreateOrderFormValues,
    );

    return {
      ...converted,
      requireOrigin: !!requireOrigin?.company.requireOriginOfInboundLoads,
    };
  }, [convertWeights, order, requireOrigin?.company.requireOriginOfInboundLoads]);

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

  const onSubmit = useCallback(
    async (values: CreateOrderFormValues) => {
      try {
        if (values.id) {
          if (updateOrder) {
            await updateOrder(
              getOrderUpdateInput({
                ...values,
                arrivedAt: new Date(),
              } as OrderValues),
            );
          }
          await makeOrderInYard({ variables: { id: values.id } });
        } else {
          if (!scaleUnitOfMeasurementType) {
            throw new Error('Please select a scale');
          }

          await createOrderMutation({
            variables: {
              data: {
                ...omit(values, [
                  'containerWeight',
                  'customer',
                  'project',
                  'customerJobSite',
                  'material',
                  'jobSite',
                  'customerTruck',
                  'requireOrigin',
                  'originDistrict',
                  'totalWeight',
                ]),
                arrivedAt: new Date(),
                customerId: values.customer?.id,
                customerJobSiteId: values.customerJobSite?.id,
                projectId: values.project?.id,
                materialId: values.material?.id,
                jobSiteId: values.jobSite?.id,
                customerTruckId: values.customerTruck?.id,
                WONumber: values.customer?.type !== CustomerType.Walkup ? values.WONumber : null,
                truckTare: values.customerTruck?.emptyWeight,
                canTare: values.containerWeight,
                weightIn: convertWeights(values.weightIn, MeasureTarget.backend),
                weightScaleUom: scaleUnitOfMeasurementType,
              },
            },
          });
          showSuccess(<Trans>Order created successfully!</Trans>);
          materialContext.setMaterial(undefined);
        }
        await delay(1000);
        await refreshYardOperationConsole();
        closeSidePanel();
      } catch (e: any) {
        if (e?.graphQLErrors?.length) {
          showError(e?.graphQLErrors[0].message);
        } else if (e.message) {
          showError(e.message);
        } else {
          showError(<Trans>Could not {values.id ? 'update' : 'create'} order</Trans>);
        }
        throw e;
      }
    },
    [
      updateOrder,
      makeOrderInYard,
      createOrderMutation,
      convertWeights,
      scaleUnitOfMeasurementType,
      materialContext,
    ],
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onCustomerChange = (value: CustomerOption) => {
    materialContext.setMaterial(null);
  };

  let selectedUom = order?.weightScaleUom;
  const isScaleSelected = scaleUnitOfMeasurementType;

  if (!selectedUom) {
    selectedUom = scaleUnitOfMeasurementType
      ? scaleUnitOfMeasurementType
      : material?.units && (material.units as UnitOfMeasurementType);
  }

  return (
    <CreateOrderForm
      validate={async (values: CreateOrderFormValues) => validate(values, schema)}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onSubmitted={onSubmitted}
      subscription={{}}
      decorators={[dynamicFieldsDecorator] as any}
      sidePanel={<OrderFormSidebar />} //
      HeaderComponent={HeaderComponent}
    >
      <Box>
        <Box mb={1}>
          <WalkUpCustomerInput />
        </Box>
        <TwoFieldsRow>
          <CustomerInput autoFocus active onChange={onCustomerChange} />
          <LicensePlateInput />
        </TwoFieldsRow>
        <CustomerOnHoldWarning />
        <TwoFieldsRow>
          <WorkOrderField />
          <CustomerTruckInput />
        </TwoFieldsRow>
        <TwoFieldsRow>
          <MaterialInput updateContext={!isScaleSelected} />
          <ContainerInput />
        </TwoFieldsRow>
        <Box mb={1}>
          <JobSiteInput />
        </Box>
        <TwoFieldsRow>
          <ProjectInput />
          <ProductOrderInput />
        </TwoFieldsRow>
        <FieldsRowDivider />
        <Box mb={1}>
          <OriginDistrictInput />
        </Box>
        <FieldsRowDivider />
        <NoteInput />
        <Box mb={1}>
          <FieldsRowDivider />
        </Box>
        <Box mb={1}>
          <WeightInput
            fieldName="weightIn"
            label={`${t('Weight In')}  ${
              selectedUom ? getUomTranslation(selectedUom) : massTranslation
            }`}
            isScaleValueChange
          />
          <ScaleWeightInValues />
        </Box>
      </Box>
    </CreateOrderForm>
  );
};
