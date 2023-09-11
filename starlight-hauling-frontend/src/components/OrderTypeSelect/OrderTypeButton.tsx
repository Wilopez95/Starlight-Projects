import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { noop } from 'lodash-es';

import { Typography } from '@root/common';

import { IOrderType } from './types';

const OrderTypeButton: React.FC<IOrderType> = ({
  disabled,
  icon: Icon,
  title,
  subtitle,
  type,
  onClick,
}) => {
  return (
    <Layouts.Flex as={Layouts.Padding} padding="1" onClick={disabled ? noop : () => onClick(type)}>
      <Layouts.IconLayout width="34px" height="36px">
        <Icon />
      </Layouts.IconLayout>

      <Layouts.Flex direction="column" justifyContent="space-between">
        <Typography variant="headerFive">{title}</Typography>

        {subtitle ? (
          <Typography variant="bodySmall" color="secondary" shade="desaturated">
            {subtitle}
          </Typography>
        ) : null}
      </Layouts.Flex>
    </Layouts.Flex>
  );
};

export default OrderTypeButton;
