import * as React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { InfoIcon } from '@root/assets';
import { Typography } from '@root/common/Typography/Typography';

export const DuplicatedNotification: React.FC<{ duplicatedFields: string }> = ({
  duplicatedFields,
}) => (
  <Layouts.Flex alignItems="center">
    <Layouts.Margin right="1">
      <InfoIcon />
    </Layouts.Margin>
    <Typography variant="bodyMedium">
      The customer with entered {duplicatedFields} already exists in the system.
    </Typography>
  </Layouts.Flex>
);
