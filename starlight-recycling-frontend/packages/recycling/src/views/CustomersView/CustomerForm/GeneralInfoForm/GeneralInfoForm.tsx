import React, { memo, useMemo } from 'react';
import { Trans } from '../../../../i18n';
import * as yup from 'yup';
import { CheckBoxField, SelectOption, TextField } from '@starlightpro/common';
import { gql } from '@apollo/client';

import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import { createStyles, makeStyles } from '@material-ui/core/styles';

import {
  ContactPhoneType,
  useGetSalesRepresentativesQuery,
  useGetHaulingCustomerGroupsQuery,
  HaulingCustomerGroupType,
} from '../../../../graphql/api';
import PhonesField from '../../../../components/FinalForm/PhonesField';
import { Field } from 'react-final-form';
import { RegionConfig } from '../../../../i18n/region';

gql`
  query getSalesRepresentatives {
    salesRepresentatives {
      id
      name
      firstName
      lastName
    }
  }

  query getHaulingCustomerGroups($filter: HaulingCustomerGroupFilter) {
    haulingCustomerGroups(filter: $filter) {
      id
      active
      description
    }
  }
`;

const PHONE_TYPES = [
  ContactPhoneType.Main,
  ContactPhoneType.Home,
  ContactPhoneType.Work,
  ContactPhoneType.Cell,
  ContactPhoneType.Other,
];

export const generalInfoSchema = (regionConfig: RegionConfig) =>
  yup.object().shape({
    groupId: yup.number().min(1, 'Required').required('Required'),
    businessName: yup.string().max(200, 'Should be less than 200 characters').required('Required'),
    email: yup.string().email('Email address is invalid').nullable(),
    alternateID: yup.string().max(200, 'Should be less than 200 characters').nullable(),
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
          type: yup.string().oneOf(PHONE_TYPES).required('Required'),
        }),
      )
      .min(1, 'At least one phone is required'),
    saleRepresentativeId: yup.string().nullable(),
  });

interface GeneralInfoFormProps {
  create?: boolean;
}

const useStyles = makeStyles(
  ({ spacing }) =>
    createStyles({
      phones: {
        marginTop: spacing(4),
      },
      businessNameInput: {},
      activeCheckBox: {
        marginBottom: spacing(2),
      },
    }),
  { name: 'GeneralInfoForm' },
);

export const GeneralInfoForm = memo<GeneralInfoFormProps>(({ create }) => {
  const classes = useStyles();
  const { data } = useGetHaulingCustomerGroupsQuery({
    variables: {
      filter: {
        activeOnly: true,
        type: HaulingCustomerGroupType.Commercial,
      },
    },
    fetchPolicy: 'no-cache',
  });
  const customerGroups = useMemo(() => data?.haulingCustomerGroups || [], [
    data?.haulingCustomerGroups,
  ]);

  const groupOptions = useMemo(() => {
    return customerGroups.map((group) => (
      <SelectOption key={group.id} value={group.id}>
        {group.description}
      </SelectOption>
    ));
  }, [customerGroups]);

  const { data: salesRepresentativeData } = useGetSalesRepresentativesQuery({
    fetchPolicy: 'network-only',
  });
  const salesRepresentatives = useMemo(() => salesRepresentativeData?.salesRepresentatives || [], [
    salesRepresentativeData?.salesRepresentatives,
  ]);
  const salesRepresentativeOptions = useMemo(
    () =>
      salesRepresentatives.map((user) => (
        <SelectOption key={user.id} value={user.id}>
          {`${user.firstName} ${user.lastName}`}
        </SelectOption>
      )),
    [salesRepresentatives],
  );

  return (
    <>
      <Box pt={3} display="flex" flexDirection="column">
        {!create && (
          <CheckBoxField
            name="active"
            label={<Trans>Active</Trans>}
            className={classes.activeCheckBox}
          />
        )}
        <TextField
          fullWidth
          name="groupId"
          required
          label={<Trans>Customer Group</Trans>}
          select
          id="groupId"
        >
          {groupOptions}
        </TextField>
        <Box display="flex" mb={3}>
          <Box display="flex" flexDirection="column">
            <CheckBoxField name="requirePONumber" label={<Trans>Require PO Number</Trans>} />
            <Field name="requireGrading" subscription={{ value: true }}>
              {({ input: { value: requireGrading } }) => (
                <CheckBoxField
                  disabled={requireGrading}
                  name="gradingNotification"
                  label={<Trans>Grading Notification</Trans>}
                />
              )}
            </Field>
            <CheckBoxField
              name="allowSelfServiceOrders"
              label={<Trans>Allow Self-service Orders</Trans>}
            />
          </Box>
          <Box display="flex" flexDirection="column">
            <CheckBoxField name="requireWONumber" label={<Trans>Require WO Number</Trans>} />
            <CheckBoxField name="requireJobSite" label={<Trans>Require Job Site</Trans>} />
          </Box>
          <Box display="flex" flexDirection="column">
            <CheckBoxField name="requireGrading" label={<Trans>Require Grading</Trans>} />
            <CheckBoxField
              name="requireCanTareWeight"
              label={<Trans>Require Can Tare Weight</Trans>}
            />
          </Box>
        </Box>
        <TextField
          fullWidth
          name="saleRepresentativeId"
          label={<Trans>Sales Representative</Trans>}
          select
          id="saleRepresentativeId"
        >
          {salesRepresentativeOptions}
        </TextField>
        <Box display="flex" mb={3}>
          <Box mr={3}>
            <TextField
              fullWidth
              required
              name="businessName"
              label={<Trans>Business Name</Trans>}
              className={classes.businessNameInput}
              inputProps={{ id: 'businessName' }}
            />
            <TextField
              type="email"
              fullWidth
              name="email"
              label={<Trans>E-mail</Trans>}
              inputProps={{ id: 'email' }}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              name="alternateID"
              label={<Trans>Alternate ID</Trans>}
              inputProps={{ id: 'alternateID' }}
            />
          </Box>
        </Box>
      </Box>
      <Divider />
      <Box className={classes.phones}>
        <PhonesField
          name="phones"
          phoneTypes={PHONE_TYPES}
          min={1}
          firstNumberType={ContactPhoneType.Main}
          firstNumberRemovable
        />
      </Box>
    </>
  );
});

export default GeneralInfoForm;
