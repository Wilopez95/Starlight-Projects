import React from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';

import * as Styles from './styles';
import { IAddFilterIcon } from './types';

export const AddFilterIcon: React.FC<IAddFilterIcon> = ({ children, onClick }) => {
  return (
    <Layouts.Margin left="1" right="1">
      <Typography cursor="pointer" onClick={onClick}>
        <Layouts.Box
          width="30px"
          height="30px"
          borderRadius="50%"
          backgroundColor="grey"
          backgroundShade="light"
          position="relative"
        >
          {children}
          <Layouts.Flex justifyContent="center" alignItems="center" as={Layouts.Box} height="100%">
            <Styles.AddFilter />
          </Layouts.Flex>
        </Layouts.Box>
      </Typography>
    </Layouts.Margin>
  );
};
