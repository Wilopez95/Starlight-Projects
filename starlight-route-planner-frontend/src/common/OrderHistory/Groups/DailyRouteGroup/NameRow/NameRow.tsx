import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { getHistoryActionType, HistoryActionType } from '../../../helpers/historyActionType';
import { SubjectRow } from '../../BaseRows';
import { Badge } from '../../common-styles';
import { getSubjectMap } from '../helper';
import { DailyRouteHistoryChanges } from '../types';

const I18N_ROOT_PATH = 'Text.';

export const NameRow: React.FC<DailyRouteHistoryChanges> = ({ actualChanges }) => {
  const { t } = useTranslation();
  const { newValue, previousValue, attribute } = actualChanges[0];
  const action = getHistoryActionType(previousValue, newValue);
  const subject = getSubjectMap(t, attribute);

  return (
    <SubjectRow subject={subject}>
      {t(`${I18N_ROOT_PATH}${action}`)}
      {action === HistoryActionType.Changed ? (
        <>
          <Layouts.Margin left="1">
            <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
              {previousValue}
            </Badge>
          </Layouts.Margin>
          <Layouts.Margin left="1">→</Layouts.Margin>
          <Layouts.Margin left="1">
            <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
              {newValue}
            </Badge>
          </Layouts.Margin>
        </>
      ) : (
        <Layouts.Margin left="1">
          <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
            {/* Todo add "previousValue" if needed*/}
            {newValue}
          </Badge>
        </Layouts.Margin>
      )}
    </SubjectRow>
  );
};
