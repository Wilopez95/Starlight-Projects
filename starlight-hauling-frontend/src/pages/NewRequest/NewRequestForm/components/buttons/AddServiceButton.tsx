import React from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';

import { PlusIcon } from '@root/assets';
import { Section, Typography } from '@root/common';

const AddServiceButton: React.FC<{ onClick(): void; disabled?: boolean }> = ({
  onClick,
  disabled,
}) => {
  return (
    <Section dashed alignItems="center">
      <Layouts.Padding padding="2">
        <Button variant="none" disabled={disabled} onClick={onClick}>
          <Layouts.Flex alignItems="center" justifyContent="center">
            <Layouts.IconLayout height="12px" width="12px">
              <PlusIcon />
            </Layouts.IconLayout>
            <Typography color="information" cursor="pointer" variant="bodyMedium">
              Add Service
            </Typography>
          </Layouts.Flex>
        </Button>
      </Layouts.Padding>
    </Section>
  );
};

export default AddServiceButton;
