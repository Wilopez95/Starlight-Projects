import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { SubjectRow } from '../../BaseRows';
import { Badge } from '../../common-styles';

import { IWorkOrderCreated } from './types';

const I18N_ROOT_PATH = 'Text.';

export const WorkOrderCreated: React.FC<IWorkOrderCreated> = ({ workOrderId, children }) => {
  const { t } = useTranslation();

  return (
    <>
      {workOrderId && (
        <SubjectRow subject="Work Order">
          <Layouts.Margin right="1">
            <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
              #{workOrderId}
            </Badge>
          </Layouts.Margin>
          {t(`${I18N_ROOT_PATH}Created`)}
        </SubjectRow>
      )}
      {children}
    </>
  );
};
