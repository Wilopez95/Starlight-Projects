import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import { TypeFormik } from '../FormContainer/types';
import { IPriceField } from './types';

const PriceField: React.FC<IPriceField> = ({ value = 0, ...props }) => {
  const { formatCurrency } = useIntl();
  const { values, handleChange } = useFormikContext() as TypeFormik;

  return (
    <>
      {values.unlockOverrides ? (
        <FormInput {...props} value={value} onChange={handleChange} />
      ) : (
        <Layouts.Flex
          justifyContent="space-between"
          direction="column"
          as={Layouts.Margin}
          right="3"
        >
          <Layouts.Margin bottom="2">
            <Typography
              color="secondary"
              shade="desaturated"
              variant="bodyMedium"
              textAlign="right"
            >
              {props.label}
            </Typography>
          </Layouts.Margin>
          <Typography variant="bodyMedium" textAlign="right">
            {formatCurrency(value)}
          </Typography>
        </Layouts.Flex>
      )}
    </>
  );
};

export default observer(PriceField);
