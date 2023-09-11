import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Badge } from '@root/common';

import { SubjectRow } from '../../BaseRows';

import { IWorkOrderCreated } from './types';

export const WorkOrderCreated: React.FC<IWorkOrderCreated> = ({ id }) => {
  return (
    <SubjectRow subject="Work Order">
      {id ? (
        <Layouts.Margin right="1">
          <Badge color="secondary" shade="dark" bgColor="grey" bgShade="light">
            #{id}
          </Badge>
        </Layouts.Margin>
      ) : null}
      created
    </SubjectRow>
  );
};
