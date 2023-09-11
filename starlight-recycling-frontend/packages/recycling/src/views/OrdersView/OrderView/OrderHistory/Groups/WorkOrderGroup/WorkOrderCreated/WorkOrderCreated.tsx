import React from 'react';

import { Box, Chip } from '@material-ui/core';

import { SubjectRow } from '../../BaseRows';

import { IWorkOrderCreated } from './types';

export const WorkOrderCreated: React.FC<IWorkOrderCreated> = ({ id }) => {
  return (
    <SubjectRow subject="Work Order">
      {id && (
        <Box mr="1">
          <Chip label={`#${id}`} />
        </Box>
      )}
      created
    </SubjectRow>
  );
};
