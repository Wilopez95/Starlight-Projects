import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { getHistoryActionType, HistoryActionType } from '../../../helpers/historyActionType';
import { SubjectRow } from '../../BaseRows';
import { Badge } from '../../common-styles';
import { getSubjectMap } from '../helper';
import { WorkOrderHistoryChanges } from '../types';

const I18N_ROOT_PATH = 'Text.';

export const CommonAttribute: React.FC<WorkOrderHistoryChanges> = ({ actualChanges }) => {
  const { t } = useTranslation();
  const { previousValue, newValue, attribute } = actualChanges[0];
  const subject = getSubjectMap(t, attribute);
  const action = getHistoryActionType(previousValue, newValue);

  return (
    <SubjectRow subject={subject}>
      {t(`${I18N_ROOT_PATH}${action}`)}
      {action === HistoryActionType.Added && (
        <Layouts.Margin left="1">
          <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
            {
              /* {action === HistoryActionType.Added ?*/ newValue.toString() /* : previousValue.toString()} */
            }
          </Badge>
        </Layouts.Margin>
      )}
      {action === HistoryActionType.Changed && (
        <>
          <Layouts.Margin left="1">
            <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
              {previousValue.toString()}
            </Badge>
          </Layouts.Margin>
          <Layouts.Margin left="1">→</Layouts.Margin>
          <Layouts.Margin left="1">
            <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
              {newValue.toString()}
            </Badge>
          </Layouts.Margin>
        </>
      )}
    </SubjectRow>
  );
};
