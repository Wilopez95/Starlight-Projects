import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { SubjectRow } from '../../BaseRows';
import { Badge } from '../../common-styles';
import { WorkOrderHistoryChanges } from '../types';

const I18N_ROOT_PATH = 'Text.';

export const Comment: React.FC<WorkOrderHistoryChanges> = ({ actualChanges }) => {
  const { t } = useTranslation();
  const { newValue } = actualChanges[0];

  return (
    <SubjectRow subject="Comment">
      {t(`${I18N_ROOT_PATH}Added`)}
      <Layouts.Margin left="1">
        <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
          {newValue}
        </Badge>
      </Layouts.Margin>
    </SubjectRow>
  );
};
