import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { PlusIcon } from '@root/assets';
import { Typography } from '@root/common';

const ContactField: React.FC = () => (
  <Typography cursor="pointer" color="information" variant="bodyMedium">
    <Layouts.Flex alignItems="center">
      <Layouts.IconLayout width="12px" height="12px">
        <PlusIcon />
      </Layouts.IconLayout>
      Create new contact
    </Layouts.Flex>
  </Typography>
);

export default ContactField;
