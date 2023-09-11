import React, { FC, useCallback, useContext, useMemo } from 'react';
import { Trans } from '../../../i18n';
import { omit } from 'lodash-es';
import { Form } from 'react-final-form';

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
  WorkOrderField,
} from '../../YardOperationConsole/Inputs';

import {
  GetOrderQuery,
  HaulingCustomerStatus,
  OrderStatus,
  useCreateOrderMutation,
  useGetRequireOriginQuery,
  useGetUserInfoQuery,
  useMakeOrderInYardMutation,
  useUpdateOrderMutation,
} from '../../../graphql/api';
import { getDumpInitialValues } from '../../YardOperationConsole/EditDumpOrder/getDumpInitialValues';
import { showError, showSuccess } from '../../../components/Toast';
import { validate } from '../../../utils/forms';
import { schema } from './schema';
import { CreateOrderFormValues } from '../../YardOperationConsole/components/CreateOrderForm';
import { HeaderComponentProps } from '@starlightpro/common/components/SidepanelView';
import { FormHeader } from '../../YardOperationConsole/components/FormHeader';
import { FieldsRowDivider } from '../../YardOperationConsole/components/FieldsRowDivider';
import { getOrderUpdateInput } from '../../YardOperationConsole/helpers/getOrderUpdateInput';

import FullTruckToScaleSvg from '../../YardOperationConsole/components/icons/FullTruckToScaleSvg';
import { formDecorator } from '../../YardOperationConsole/FullTruckToScaleForm/formDecorator';
import { defaultCreateOrderFormValues } from './selfServiceInitialValues';
import { GeneralKioskView, SelfServiceFooter } from '../components';
import { Paths, Routes } from '../../../routes';
import {
  MeasureTarget,
  useCompanyMeasurementUnits,
} from '../../../hooks/useCompanyMeasurementUnits';
import { makeStyles } from '@material-ui/core/styles';
import { DriverContext } from '../components/DriverContext/DriverContext';
import { ContentLoader, TextField } from '@starlightpro/common';
import { Box } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import { CustomerTruckTypes } from '@starlightpro/common/graphql/api';

interface Props {
  order?: GetOrderQuery['order'];
  onSubmitted?: (orderId?: number) => void;
}

const useStyles = makeStyles(({ breakpoints }) => ({
  root: {
    [breakpoints.down('sm')]: {
      fontSize: '2rem',
    },
  },
}));

export const HeaderComponent: FC<HeaderComponentProps> = () => {
  return (
    <FormHeader icon={<FullTruckToScaleSvg />} headerText={<Trans>Full Truck To Scale</Trans>} />
  );
};

export const SelfServiceOrderForm: FC<Props> = ({ order, onSubmitted = () => {} }) => {
  const { data: requireOrigin } = useGetRequireOriginQuery();
  const [updateOrderMutation] = useUpdateOrderMutation();
  const [createOrderMutation] = useCreateOrderMutation();
  const [makeOrderInYard] = useMakeOrderInYardMutation();
  const { convertWeights } = useCompanyMeasurementUnits();
  const location = useLocation();
  const classes = useStyles();

  const { driver, loading: loadingDriver } = useContext(DriverContext);
  const { data: userData, loading: loadingUser } = useGetUserInfoQuery();

  const filterByHaulerSrn = useMemo(() => {
    const resource = userData?.userInfo?.resource;

    if (!resource || !driver) {
      return undefined;
    }

    return driver.businessUnits.map(({ id }) => resource.replace(/:(?:.(?!:))+$/gm, `:${id}`));
  }, [driver, userData]);

  const isUpdateFlow = useMemo(() => location.pathname.indexOf(Routes.Edit) > -1, [location]);

  const dynamicFieldsDecorator = useMemo(formDecorator, []);

  const initialValues = useMemo(
    () =>
      order
        ? (convertWeights(getDumpInitialValues(order)) as CreateOrderFormValues)
        : defaultCreateOrderFormValues,
    [convertWeights, order],
  );

  const onSubmit = useCallback(
    async (values: CreateOrderFormValues) => {
      const isRolloff = values.customerTruck?.type === CustomerTruckTypes.Rolloff;

      try {
        let orderId = values.id;

        if (orderId) {
          await updateOrderMutation({
            variables: {
              data: {
                ...convertWeights(
                  getOrderUpdateInput({
                    ...values,
                    id: orderId,
                  }),
                  MeasureTarget.backend,
                ),
                isSelfService: true,
                bypassScale: true,
                arrivedAt: new Date(),
                truckTare: values.customerTruck?.emptyWeight,
                canTare: isRolloff ? values.containerWeight || 0 : 0,
                weightOut: isRolloff
                  ? (values.customerTruck?.emptyWeight ?? 0) + (values.containerWeight ?? 0)
                  : values.customerTruck?.emptyWeight,
              },
            },
          });

          if (order?.status !== OrderStatus.InYard) {
            await makeOrderInYard({ variables: { id: +orderId } });
          }
          showSuccess(<Trans>Order has been updated!</Trans>);
        } else {
          const result = await createOrderMutation({
            variables: {
              data: {
                ...convertWeights(
                  {
                    ...omit(values, [
                      'containerWeight',
                      'customer',
                      'customerJobSite',
                      'customerTruck',
                      'jobSite',
                      'material',
                      'project',
                      'originDistrict',
                      'totalWeight',
                    ]),
                    canTare: values.containerWeight,
                    arrivedAt: new Date(),
                    customerId: values.customer?.id,
                    jobSiteId: values.jobSite?.id,
                    customerJobSiteId: values.customerJobSite?.id,
                    projectId: values.project?.id,
                    materialId: values.material?.id,
                    customerTruckId: values.customerTruck?.id,
                    isSelfService: true,
                    weightOut:
                      values.customerTruck?.type === CustomerTruckTypes.Rolloff
                        ? (values.customerTruck?.emptyWeight ?? 0) + (values.containerWeight ?? 0)
                        : values.customerTruck?.emptyWeight,
                    bypassScale: true,
                  },
                  MeasureTarget.backend,
                ),
                weightOut: isRolloff
                  ? (values.customerTruck?.emptyWeight ?? 0) + (values.containerWeight ?? 0)
                  : values.customerTruck?.emptyWeight,
                canTare: isRolloff ? values.containerWeight : 0,
                truckTare: values.customerTruck?.emptyWeight,
              },
            },
          });
          orderId = result?.data?.createOrder?.id;
          showSuccess(<Trans>Order has been created!</Trans>);
        }

        if (orderId) {
          await onSubmitted(orderId);
        }
      } catch (e) {
        let errorMessage = <Trans>Could not create Order</Trans>;

        if (e.message) {
          errorMessage = <Trans>{e.message}</Trans>;
        } else if (values.id) {
          errorMessage = <Trans>Could not update order</Trans>;
        }
        showError(errorMessage);
      }
    },
    [
      makeOrderInYard,
      order?.status,
      updateOrderMutation,
      convertWeights,
      createOrderMutation,
      onSubmitted,
    ],
  );

  if (!loadingDriver && !driver) {
    return (
      <Box padding={2}>
        <Trans>Failed to fetch driver data. Please, use driver account</Trans>
      </Box>
    );
  }

  if (loadingUser || loadingDriver || !driver) {
    return <ContentLoader expanded />;
  }

  return (
    <Form
      validate={async (values: CreateOrderFormValues) =>
        validate(
          {
            ...values,
            requireOrigin: requireOrigin?.company.requireOriginOfInboundLoads,
          },
          schema,
        )
      }
      initialValues={initialValues}
      onSubmit={onSubmit}
      subscription={{ values: true }}
      decorators={[dynamicFieldsDecorator] as any}
      render={({ handleSubmit }) => (
        <GeneralKioskView
          className={classes.root}
          footer={
            <SelfServiceFooter
              prevPage={Paths.KioskModule.Kiosk}
              nextPage={order ? Paths.KioskModule.TruckOnScale : undefined}
              handleSubmit={handleSubmit}
              submitText={order ? <Trans>Edit Order</Trans> : <Trans>Create Order</Trans>}
            />
          }
        >
          <CustomerInput
            allowCreateNew={false}
            disabled={isUpdateFlow}
            autoFocus
            active
            customerFilter={{
              filterByState: [HaulingCustomerStatus.Active],
              filterBySelfServiceOrderAllowed: true,
              filterByOnAccount: true,
              filterByHaulerSrn,
            }}
          />
          {isUpdateFlow ? (
            <TextField disabled name="WONumber" fullWidth label={<Trans>WO#</Trans>} />
          ) : (
            <WorkOrderField onlyAllowSelfService required />
          )}
          <CustomerTruckInput allowCreateNew={false} allowUndefinedEmptyWeight={false} />
          <ContainerInput allowUndefinedEmptyWeight={false} />
          <MaterialInput />
          <JobSiteInput allowCreateNew={false} />
          <ProjectInput allowCreateNew={false} />
          <ProductOrderInput />
          <FieldsRowDivider />
          <OriginDistrictInput />
          <FieldsRowDivider />
          <NoteInput />
        </GeneralKioskView>
      )}
    />
  );
};
