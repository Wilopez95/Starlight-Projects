import React from 'react';
import { Layouts, OffsetUnit, Typography } from '@starlightpro/shared-components';

import { EmptyValuePlaceholder } from '@root/common';

interface IProps {
  marginTop: OffsetUnit;
  title: string;
  value?: string | number | null;
}

export const DetailsItem: React.FC<IProps> = ({ title, marginTop, value }) => {
  return (
    <>
      <Layouts.Margin top={marginTop} />
      <Layouts.Flex>
        <Layouts.Margin right="2">
          <Layouts.Box width="130px">
            <Typography color="secondary" shade="light">
              {title}
            </Typography>
          </Layouts.Box>
        </Layouts.Margin>
        {value ? (
          <Typography color="secondary" shade="dark">
            {value}
          </Typography>
        ) : (
          <EmptyValuePlaceholder />
        )}
      </Layouts.Flex>
    </>
  );
};
