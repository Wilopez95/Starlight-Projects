import { Box, makeStyles } from '@material-ui/core';
import { SelectOption } from '@starlightpro/common';
import React, { FC } from 'react';
import { Field } from 'react-final-form';
import { Trans } from '../../../i18n';
import { GetHaulingCustomersQuery } from '../../../graphql/api';
import Label from '../../Label';
import { SearchFieldWithNewEntity, SearchFieldWithNewEntityProps } from '../SearchField';

const useStyles = makeStyles(
  ({ spacing, typography }) => ({
    onHoldAdornment: {
      display: 'inline-block',
      marginTop: 3,
      fontSize: typography.body2.fontSize,
    },
    onHoldOptionContainer: {
      display: 'flex',
      width: '100%',
    },
    optionInnerWrap: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between',
      flexGrow: 1,
    },
    onHoldOptionText: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    onHoldOptionLabel: {
      marginLeft: spacing(1),
    },
  }),
  { name: 'CustomerSearchField' },
);

export type CustomerOption = {
  label: string;
  value: number;
  customer: GetHaulingCustomersQuery['haulingCustomers']['data'][number];
};

export interface CustomerSearchFieldProps extends SearchFieldWithNewEntityProps {
  options: CustomerOption[];
  autoFocus?: boolean;
  onInputChange?: (inputValue: string) => void;
}

export const CustomerSearchField: FC<CustomerSearchFieldProps> = ({ onChange, ...props }) => {
  const classes = useStyles();

  return (
    <SearchFieldWithNewEntity
      {...props}
      onChange={onChange}
      mapValues={{
        mapFieldValueToFormValue(value) {
          return (value as CustomerOption)?.customer;
        },
        mapFormValueToFieldValue(value) {
          const customer = (value as any) as CustomerOption['customer'];

          return customer?.id;
        },
        mapInputValueToOption(value) {
          if (typeof value === 'string') {
            return null;
          }
          const customer = (value as any) as CustomerOption['customer'];

          return {
            label: customer.businessName || `${customer.id}`,
            value: customer.id,
            customer,
          };
        },
      }}
      renderOption={(option: CustomerOption) => {
        return (
          <SelectOption data-cy={option.label} className={classes.onHoldOptionContainer}>
            <Box className={classes.optionInnerWrap}>
              <Box flexGrow="1" className={classes.onHoldOptionText}>
                {option.label}
              </Box>
              <>
                {option.customer?.onHold && (
                  <Box display="flex" flexGrow="1" justifyContent="flex-end">
                    <Label variant="inactive" className={classes.onHoldOptionLabel}>
                      <Trans>On Hold</Trans>
                    </Label>
                  </Box>
                )}
              </>
            </Box>
          </SelectOption>
        );
      }}
      endAdornmentBefore={
        <Field name="customer" subscription={{ value: true }}>
          {({ input }) => (
            <>
              {input.value?.onHold && (
                <Label variant="inactive" className={classes.onHoldOptionLabel}>
                  <Trans>On Hold</Trans>
                </Label>
              )}
            </>
          )}
        </Field>
      }
    />
  );
};

export default CustomerSearchField;
