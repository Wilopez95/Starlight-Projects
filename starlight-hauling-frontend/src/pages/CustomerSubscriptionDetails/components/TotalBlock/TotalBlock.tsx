import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import DetailColumnItem from '../DetailColumnItem/DetailColumnItem';

import { ITotalBlock } from './types';

const TotalBlock: React.FC<ITotalBlock> = ({
  price = 0,
  quantity = 0,
  hideLabels = false,
  variant = 'bodyMedium',
}) => {
  const { formatCurrency } = useIntl();

  return (
    <Layouts.Box as={Layouts.Flex} justifyContent="space-between">
      <DetailColumnItem
        width="80px"
        textAlign="right"
        label={hideLabels ? undefined : 'price'}
        textTransform="uppercase"
        variant={variant}
      >
        <Typography textAlign="right">{formatCurrency(price)}</Typography>
      </DetailColumnItem>
      <DetailColumnItem
        width="80px"
        textAlign="right"
        label={hideLabels ? undefined : 'qty'}
        textTransform="uppercase"
        variant={variant}
      >
        <Typography textAlign="right">{quantity}</Typography>
      </DetailColumnItem>
      <DetailColumnItem
        width="100px"
        textAlign="right"
        label={hideLabels ? undefined : 'total'}
        textTransform="uppercase"
        variant={variant}
      >
        <Typography textAlign="right">{formatCurrency(price * quantity)}</Typography>
      </DetailColumnItem>
    </Layouts.Box>
  );
};

export default TotalBlock;
