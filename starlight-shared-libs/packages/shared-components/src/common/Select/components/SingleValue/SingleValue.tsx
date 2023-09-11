import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';

import { Layouts } from '../../../../layouts';
import { Badge } from '../../../Badge/Badge';
import { Typography } from '../../../Typography/Typography';
import { ISelectOption } from '../../types';

export const SingleValue: SelectComponentsConfig<ISelectOption, boolean>['SingleValue'] = ({
  children,
  data,
  ...props
}) => {
  const { hint, description, badge } = data;

  return (
    <Layouts.Box width="100%" as={components.SingleValue as any} {...props}>
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Flex alignItems="center">
          <Typography>{children}</Typography>
          {description ? (
            <Layouts.Margin left="1">
              <Typography color="secondary" shade="desaturated">
                {description}
              </Typography>
            </Layouts.Margin>
          ) : null}
        </Layouts.Flex>
        {hint ? (
          <Layouts.Margin right="1">
            <Typography color="secondary" shade="desaturated">
              ({hint})
            </Typography>
          </Layouts.Margin>
        ) : null}
        {badge ? (
          <Badge color={badge.color} borderRadius={badge.borderRadius}>
            {badge.text}
          </Badge>
        ) : null}
      </Layouts.Flex>
    </Layouts.Box>
  );
};
