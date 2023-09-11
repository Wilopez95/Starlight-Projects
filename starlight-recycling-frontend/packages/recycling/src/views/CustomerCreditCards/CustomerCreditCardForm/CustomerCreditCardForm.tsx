import React, { FC } from 'react';
import { omit } from 'lodash-es';
import { Field } from 'react-final-form';
import { Trans } from '../../../i18n';
import moment from 'moment';
import createDecorator from 'final-form-calculate';

import { makeStyles } from '@material-ui/core/styles';

import { SidebarForm } from '../../../components/FinalForm/SidebarForm/SidebarForm';
import { CloseConfirmationFormTracker } from '@starlightpro/common';
import { HaulingCustomerJobSite } from '../../../graphql/api';
import CreditCardFormContent from './CreditCardFormContent';
import { CreditCardSchema } from './schema';

const useStyles = makeStyles(() => ({
  paper: {
    width: 641,
  },
}));

export interface CustomerCreditCardFormProps {
  customerId: number;
  create?: boolean;
  initialValues: any;
  onSubmit(values: any): void;
  onCancel(): void;
  onSubmitted?: (values: any, result: any) => void;
  disabled?: boolean;
}

const dynamicFieldsDecorator = createDecorator(
  {
    field: 'selectedJobSite',
    updates: {
      selectedJobSites: (selectedJobSite, allValues: any) => {
        if (
          selectedJobSite &&
          allValues.selectedJobSites.every(
            (jobSite: HaulingCustomerJobSite) => jobSite.id !== selectedJobSite.id,
          )
        ) {
          return allValues.selectedJobSites.concat([selectedJobSite]);
        }

        return allValues.selectedJobSites;
      },
    },
  },
  {
    field: 'isValidFor',
    updates: {
      selectedJobSites: (validFor, allValues: any, oldValues: any) => {
        if (validFor === 'all' && oldValues.isValidFor && oldValues?.isValidFor !== validFor) {
          return [];
        }

        return allValues.selectedJobSites;
      },
    },
  },
);

export const CustomerCreditCardForm: FC<CustomerCreditCardFormProps> = ({
  customerId,
  create,
  initialValues,
  onSubmit,
  onCancel,
  onSubmitted,
  disabled,
}) => {
  const classes = useStyles();

  // TODO pass propper type of form values
  return (
    <SidebarForm<any>
      cancelable
      create={create}
      canDuplicate={!create}
      initialValues={{ preventSubmit: true, activeTab: 0, ...initialValues }}
      decorators={[dynamicFieldsDecorator]}
      schema={CreditCardSchema}
      title={
        create ? (
          <Trans>New Credit Card</Trans>
        ) : (
          <Field name="cardNickname" subscription={{ value: true }}>
            {({ input }) => input.value}
          </Field>
        )
      }
      noActions
      onCancel={onCancel}
      onSubmitted={onSubmitted}
      onSubmit={async (values) => {
        if (values.preventSubmit) {
          throw new Error();
        }
        const { expireMonth, expireYear, selectedJobSites, ...payload } = values;
        payload.expirationDate = moment(`${expireMonth} ${expireYear}`, 'MMMM YYYY').format(
          'MM/YYYY',
        );
        payload.jobSites = selectedJobSites.map((jobSite: HaulingCustomerJobSite) => jobSite.id);

        return onSubmit(
          omit(payload, [
            '__typename',
            'customerJobSites',
            'cardNumberLastDigits',
            'selectedJobSite',
            'isValidFor',
            'activeTab',
            'preventSubmit',
          ]),
        );
      }}
      classes={{
        paper: classes.paper,
      }}
    >
      <CloseConfirmationFormTracker />
      <CreditCardFormContent
        customerId={customerId}
        disabled={disabled}
        create={create}
        onCancel={onCancel}
      />
    </SidebarForm>
  );
};

export default CustomerCreditCardForm;
