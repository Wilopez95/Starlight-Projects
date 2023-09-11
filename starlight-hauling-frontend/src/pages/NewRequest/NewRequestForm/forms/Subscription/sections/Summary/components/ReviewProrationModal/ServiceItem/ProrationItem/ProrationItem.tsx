import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, Protected, Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import { IProrationItemComponent } from './types';

const ProrationItem: React.FC<IProrationItemComponent> = ({
  name,
  label,
  price,
  prorationEffectivePrice,
}) => {
  const { formatCurrency } = useIntl();
  const { handleChange } = useFormikContext();

  return (
    <Layouts.Padding top="1" bottom="0.5">
      <Layouts.Flex justifyContent="space-between" alignItems="baseline">
        <Layouts.Box width="190px">
          <Layouts.Padding left="1">
            <Typography color="secondary" variant="bodyMedium">
              {label}
            </Typography>
          </Layouts.Padding>
        </Layouts.Box>

        <Layouts.Box width="125px">
          <Typography color="secondary" variant="bodyMedium" textAlign="right">
            {price !== null ? formatCurrency(price) : '-'}
          </Typography>
        </Layouts.Box>

        <Protected permissions="subscriptions:change-prorated-amount:perform">
          <Layouts.Box width="90px">
            <FormInput
              type="number"
              onChange={handleChange}
              name={name}
              value={prorationEffectivePrice}
              noError
            />
          </Layouts.Box>
        </Protected>
      </Layouts.Flex>
    </Layouts.Padding>
  );
};

export default observer(ProrationItem);
