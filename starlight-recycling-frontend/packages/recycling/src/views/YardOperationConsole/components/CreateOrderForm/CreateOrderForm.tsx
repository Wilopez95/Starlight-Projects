import { Button } from '@material-ui/core';
import React, { FC } from 'react';
import { Form, FormProps } from 'react-final-form';
import {
  HaulingCustomer,
  HaulingCustomerJobSite,
  HaulingJobSite,
  HaulingProject,
  HaulingMaterial,
  OrderInput,
  GetOrderQuery,
} from '../../../../graphql/api';
import { makeStyles } from '@material-ui/core/styles';
import { CloseConfirmationFormTracker } from '@starlightpro/common';
import { onSubmitWithErrorHandling } from '@starlightpro/common/utils/forms';

import { CreateButton } from '../CreateButton';
import { CreateOrderFormWrapper, CreateOrderFormWrapperProps } from '../CreateOrderFormWrapper';
import { closeSidePanel } from '../../../../components/SidePanels';
import { Trans } from '../../../../i18n';

const useStyles = makeStyles(({ palette }) => ({
  confirmButton: {
    color: palette.primary.main,
  },
}));

export interface CreateOrderFormValues
  extends Omit<
    OrderInput,
    'customerId' | 'customerJobSiteId' | 'projectId' | 'materialId' | 'customerTruckId' | 'taxTotal'
  > {
  id?: number | null;
  customer?: HaulingCustomer | null;
  project?: HaulingProject | null;
  material?: HaulingMaterial | null;
  customerJobSite?: HaulingCustomerJobSite | null;
  jobSite?: HaulingJobSite | null;
  customerTruck?: GetOrderQuery['order']['customerTruck'] | null;
  containerWeight?: number | null;
  weightScaleUom?: any;
}

export interface CreateOrderFormProps
  extends Omit<CreateOrderFormWrapperProps, 'actions'>,
    FormProps<CreateOrderFormValues> {
  onSubmitted?: (values: CreateOrderFormValues) => Promise<void>;
  isWeightCapturing?: boolean;
}

export const CreateOrderForm: FC<CreateOrderFormProps> = ({
  children,
  sidePanel,
  HeaderComponent,
  onSubmit,
  onSubmitted,
  isWeightCapturing,
  ...props
}) => {
  const classes = useStyles();

  return (
    <Form
      {...props}
      onSubmit={onSubmitWithErrorHandling(onSubmit, onSubmitted)}
      render={({ handleSubmit }) => (
        <CreateOrderFormWrapper
          sidePanel={sidePanel}
          HeaderComponent={HeaderComponent}
          actions={
            <>
              <Button onClick={closeSidePanel} className={classes.confirmButton} variant="outlined">
                <Trans>Cancel</Trans>
              </Button>
              <CreateButton
                isWeightCapturing={isWeightCapturing}
                onSubmit={handleSubmit}
                enableIfSubmitFailed
              />
            </>
          }
        >
          <CloseConfirmationFormTracker />
          {children}
        </CreateOrderFormWrapper>
      )}
    />
  );
};
