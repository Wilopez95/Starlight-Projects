import React, { FC, useMemo } from 'react';
import { Trans } from '../../../i18n';
import { Field } from 'react-final-form';
import * as yup from 'yup';

import { makeStyles } from '@material-ui/core/styles';
import SidebarForm from '../../../components/FinalForm/SidebarForm';
import ContactForm from './ContactForm';
import { CloseConfirmationFormTracker } from '@starlightpro/common';
import { useRegion } from '../../../hooks/useRegion';
import { RegionConfig } from '../../../i18n/region';

export const contactSchema = (regionConfig: RegionConfig) =>
  yup.object().shape({
    firstName: yup.string().max(200, 'Should be less than 200 characters').required('Required'),
    lastName: yup.string().max(200, 'Should be less than 200 characters').required('Required'),
    title: yup.string().max(200, 'Should be less than 200 characters').nullable(),
    email: yup.string().email('Email address is invalid').nullable(),
    phones: yup
      .array()
      .of(
        yup.object().shape({
          number: yup
            .string()
            .max(50)
            .required('Required')
            .test(
              'phone',
              'Invalid',
              (value) => !!value && regionConfig.validatePhoneNumber(value),
            ),
          extension: yup.string().max(10, 'Too long').nullable(),
          type: yup.string(),
        }),
      )
      .min(1, 'At least one phone is required'),
  });

const useStyles = makeStyles(() => ({
  paper: {
    maxWidth: 742,
    width: '100%',
  },
}));

export interface CustomerContactFormProps {
  create?: boolean;
  onCancel(): void;
  onSubmitted(): void;
  onSubmit(values: any): Promise<void>;
  initialValues: any;
}

export const CustomerContactForm: FC<CustomerContactFormProps> = ({
  create,
  onCancel,
  onSubmit,
  initialValues,
  onSubmitted,
}) => {
  const classes = useStyles();
  const region = useRegion();
  const schema = useMemo(() => contactSchema(region), [region]);

  return (
    <SidebarForm
      create={create}
      schema={schema}
      title={
        create ? (
          <Trans>Add New Contact</Trans>
        ) : (
          <Field name="firstName" subscription={{ value: true }}>
            {({ input: { value: firstName } }) => (
              <Field name="lastName" subscription={{ value: true }}>
                {({ input: { value: lastName } }) => `${firstName} ${lastName}`}
              </Field>
            )}
          </Field>
        )
      }
      onCancel={onCancel}
      onSubmit={onSubmit}
      onSubmitted={onSubmitted}
      initialValues={initialValues}
      classes={{
        paper: classes.paper,
      }}
    >
      <CloseConfirmationFormTracker />
      <ContactForm
        disabled={!create && !initialValues.active}
        showActive
        showIsMain={!initialValues.isMain}
      />
    </SidebarForm>
  );
};

export default CustomerContactForm;
