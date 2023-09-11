import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { SubjectRow } from '../../BaseRows';
import { Badge } from '../../common-styles';
import { WorkOrderHistoryChanges } from '../types';

const I18N_ROOT_PATH = 'Text.';

export const Media: React.FC<WorkOrderHistoryChanges> = ({ actualChanges, eventType }) => {
  const { t } = useTranslation();
  const { newValue, previousValue, actionType } = actualChanges[0];

  const deleteAction = actionType === 'delete' || eventType === 'delete';

  return (
    <SubjectRow subject="Media Files">
      {t(`${I18N_ROOT_PATH}${deleteAction ? 'Removed' : 'Added'}`)}
      <Layouts.Margin left="1">
        <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
          {deleteAction ? previousValue : newValue}
        </Badge>
      </Layouts.Margin>
    </SubjectRow>
  );
};
