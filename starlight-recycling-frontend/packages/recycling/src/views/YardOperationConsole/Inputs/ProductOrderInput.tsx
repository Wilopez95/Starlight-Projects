import React from 'react';
import { TextField } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import { useField } from 'react-final-form';
import { ReadOnlyOrderFormComponent } from '../types';
import { CustomerType } from '../../../graphql/api';
import { isObject } from 'lodash-es';
import { CustomerOption } from '../../../components/FinalForm/CustomerSearchField';

interface Props extends ReadOnlyOrderFormComponent {}

export const ProductOrderInput: React.FC<Props> = ({ readOnly }) => {
  const {
    input: { value: customer },
  } = useField('customer', { subscription: { value: true } });
  const {
    input: { value: customerJobSite },
  } = useField('customerJobSite', { subscription: { value: true } });
  const {
    input: { value: project },
  } = useField('project', { subscription: { value: true } });

  return (
    <TextField
      id="PONumber"
      name="PONumber"
      label={<Trans>PO#</Trans>}
      disabled={
        readOnly ||
        !isObject(customer) ||
        (customer as CustomerOption['customer']).type === CustomerType.Walkup
      }
      fullWidth
      required={customer?.poRequired || customerJobSite?.poRequired || project?.poRequired}
    />
  );
};
