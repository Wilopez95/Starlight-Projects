import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { HistoryActionType } from '../../../helpers/historyActionType';
import { SubjectRow } from '../../BaseRows';
import { Badge } from '../../common-styles';
import { getSubjectMap } from '../helper';
import { DailyRouteHistoryChanges } from '../types';

const I18N_ROOT_PATH = 'Text.';

export const WorkOrdersRow: React.FC<DailyRouteHistoryChanges> = ({ actualChanges }) => {
  const { t } = useTranslation();
  const { newValue, previousValue, attribute } = actualChanges[0];
  const subject = getSubjectMap(t, attribute);

  const removedItems = Array.isArray(previousValue)
    ? previousValue.filter((item: string) => !newValue.includes(item))
    : [];
  const addedItems = Array.isArray(newValue)
    ? newValue.filter((item: string) => !previousValue.includes(item))
    : [];

  return (
    <>
      {removedItems.length > 0 && (
        <SubjectRow subject={subject}>
          <>
            <Layouts.Margin right="1">
              {t(`${I18N_ROOT_PATH}${HistoryActionType.Removed}`)}
            </Layouts.Margin>
            <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
              {removedItems.join(' ')}
            </Badge>
          </>
        </SubjectRow>
      )}

      {addedItems.length > 0 && (
        <Layouts.Margin top="1">
          <SubjectRow subject={subject}>
            <>
              <Layouts.Margin right="1">
                {t(`${I18N_ROOT_PATH}${HistoryActionType.Added}`)}
              </Layouts.Margin>
              <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
                {addedItems.join(' ')}
              </Badge>
            </>
          </SubjectRow>
        </Layouts.Margin>
      )}
    </>
  );
};
