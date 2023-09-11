import React from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { ISubjectRow } from './types';

export const SubjectRow: React.FC<ISubjectRow> = ({ subject, children, prefix }) => (
  <Layouts.Flex alignItems="center" $wrap>
    {prefix}
    <Layouts.Margin right="0.5" left={prefix ? '0.5' : '0'}>
      <Typography fontWeight="bold">{subject}</Typography>
    </Layouts.Margin>
    {children}
  </Layouts.Flex>
);
