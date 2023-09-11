import React, { PropsWithChildren, ReactElement } from 'react';
import { Form, FormProps } from 'react-final-form';

import { onSubmitWithErrorHandling } from '@starlightpro/common/utils/forms';
import { GetOrderQuery, Order, OrderStatus, OrderUpdateInput } from '../../../../graphql/api';
import { EditOrderFormWrapper, EditOrderFormWrapperProps } from '../EditOrderFormWrapper';
import { CloseConfirmationFormTracker } from '@starlightpro/common';

export interface EditOrderFormValues
  extends Omit<
    OrderUpdateInput,
    | 'customerId'
    | 'customerJobSiteId'
    | 'projectId'
    | 'materialUuid'
    | 'emptyWeightUser'
    | 'weightInUser'
    | 'weightOutUser'
    | 'jobSiteId'
    | 'customerTruckId'
  > {
  customer: GetOrderQuery['order']['customer'] | null;
  material: GetOrderQuery['order']['material'] | null;
  project?: GetOrderQuery['order']['project'] | null;
  status: OrderStatus;
  customerJobSite?: GetOrderQuery['order']['customerJobSite'] | null;
  beforeTaxesTotal?: Order['beforeTaxesTotal'];
  grandTotal?: Order['grandTotal'];
  emptyWeightUser?: string;
  weightInUser?: string;
  weightOutUser?: string;
  jobSite?: GetOrderQuery['order']['jobSite'] | null;
  billableServiceId?: number | null;
  billableServiceName?: string | null;
  customerTruck?: GetOrderQuery['order']['customerTruck'] | null;
  netWeight?: string;
  taxDistricts?: GetOrderQuery['order']['taxDistricts'];
  initialOrderTotal: number;
  originDistrict?: GetOrderQuery['order']['originDistrict'] | null;
  minimalWeight?: number;
  weightScaleUom?: GetOrderQuery['order']['weightScaleUom'];
}

export interface EditOrderFormProps<FormValues>
  extends EditOrderFormWrapperProps,
    Omit<FormProps<FormValues>, 'onSubmit'> {
  onSubmit(values: FormValues, form?: any): Promise<any>;
  onSubmitted?: (values: FormValues) => Promise<void>;
}

export const EditOrderForm: <FormValues>(
  props: PropsWithChildren<EditOrderFormProps<FormValues>>,
) => ReactElement<any, any> | null = ({
  footer,
  children,
  sidePanel,
  formSidePanel,
  noDrawer,
  onSubmit,
  onSubmitted,
  ...props
}) => {
  return (
    <Form
      {...props}
      onSubmit={onSubmitWithErrorHandling(onSubmit, onSubmitted)}
      render={() => (
        <EditOrderFormWrapper
          sidePanel={sidePanel}
          formSidePanel={formSidePanel}
          footer={footer}
          noDrawer={noDrawer}
        >
          <CloseConfirmationFormTracker />
          {children}
        </EditOrderFormWrapper>
      )}
    />
  );
};
