import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import { ISummaryItem } from './types';

const SummaryItem: React.FC<ISummaryItem> = ({
  label,
  price,
  value,
  width,
  fontWeight,
  tabIndex,
  ...props
}) => {
  const { formatCurrency } = useIntl();

  return (
    <Layouts.Flex as={Layouts.Padding} bottom="1" top="1" justifyContent="flex-end">
      <Layouts.Margin right="4">
        <Typography textAlign="right" fontWeight={fontWeight}>
          {label}
        </Typography>
      </Layouts.Margin>
      <Typography
        as={Layouts.Box}
        width={width}
        textAlign="right"
        fontWeight={fontWeight}
        tabIndex={tabIndex}
        {...props}
      >
        {typeof price === 'number' ? formatCurrency(price) : value}
      </Typography>
    </Layouts.Flex>
  );
};

export default SummaryItem;
