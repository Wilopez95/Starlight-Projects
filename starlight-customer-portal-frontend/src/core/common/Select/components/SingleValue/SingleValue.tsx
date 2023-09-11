import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { ISelectOption } from '../../types';

export const SingleValue: SelectComponentsConfig<ISelectOption, boolean>['SingleValue'] = ({
  children,
  data,
  ...props
}) => {
  const { hint } = data;

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Layouts.Box width='100%' as={components.SingleValue as any} {...props}>
      <Layouts.Flex justifyContent='space-between'>
        <Typography>{children}</Typography>
        {hint && (
          <Layouts.Margin right='1'>
            <Typography color='secondary' shade='desaturated'>
              ({hint})
            </Typography>
          </Layouts.Margin>
        )}
      </Layouts.Flex>
    </Layouts.Box>
  );
};
