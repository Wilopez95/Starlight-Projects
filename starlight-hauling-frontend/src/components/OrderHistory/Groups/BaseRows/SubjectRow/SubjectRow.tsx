import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';

import { ISubjectRow } from './types';

export const SubjectRow: React.FC<ISubjectRow> = ({ subject, children, prefix }) => {
  return (
    <Layouts.Flex alignItems="center" $wrap>
      {prefix}
      <Layouts.Margin right="0.5" left={prefix ? '0.5' : '0'}>
        <Typography fontWeight="bold">{subject}</Typography>
      </Layouts.Margin>
      {children}
    </Layouts.Flex>
  );
};
