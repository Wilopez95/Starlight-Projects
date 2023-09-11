import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { groupBy } from 'lodash-es';

import {
  getHistoryActionType,
  HistoryActionType,
} from '@root/common/OrderHistory/helpers/historyActionType';
import { DailyRouteStatusBadge } from '@root/common/RouteStatus';
import { DailyRouteStatus } from '@root/consts';

import { SubjectRow } from '../../BaseRows';
import { DailyRouteHistoryChanges } from '../types';

const I18N_ROOT_PATH = 'Text.';

export const StatusRow: React.FC<DailyRouteHistoryChanges> = ({ actualChanges }) => {
  const { t } = useTranslation();
  const attributes = groupBy(actualChanges, change => change.attribute);

  const { newValue, previousValue } = attributes.status[0];
  const action = getHistoryActionType(previousValue, newValue);

  return (
    <SubjectRow subject="Status">
      {t(`${I18N_ROOT_PATH}${action}`)}
      {action === HistoryActionType.Added && (
        <Layouts.Margin left="1">
          <DailyRouteStatusBadge status={newValue as DailyRouteStatus} />
        </Layouts.Margin>
      )}
      {action === HistoryActionType.Changed && (
        <>
          <Layouts.Margin left="1">
            <DailyRouteStatusBadge status={previousValue as DailyRouteStatus} />
          </Layouts.Margin>
          <Layouts.Margin left="1">→</Layouts.Margin>
          <Layouts.Margin left="1">
            <DailyRouteStatusBadge status={newValue as DailyRouteStatus} />
          </Layouts.Margin>
        </>
      )}
    </SubjectRow>
  );
};
