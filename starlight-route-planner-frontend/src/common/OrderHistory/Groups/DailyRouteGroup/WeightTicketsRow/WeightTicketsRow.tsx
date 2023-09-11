import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { HistoryEventType } from '@root/common/OrderHistory/components/HistoryGroup/types';

import { HistoryActionType } from '../../../helpers/historyActionType';
import { SubjectRow } from '../../BaseRows';
import { Badge } from '../../common-styles';
import { mapEventTypeToAction } from '../helper';
import { DailyRouteHistoryChanges } from '../types';

const I18N_ROOT_PATH = 'Text.';

interface IProps {
  changes: DailyRouteHistoryChanges;
  eventType: HistoryEventType;
}

export const WeightTicketsRow: React.FC<IProps> = ({ changes, eventType }) => {
  const { t } = useTranslation();
  const { actualChanges } = changes;
  const { newValue, previousValue } = actualChanges[0];
  const action = mapEventTypeToAction(eventType);

  if (!action) {
    return action;
  }

  return (
    <SubjectRow subject={t(`${I18N_ROOT_PATH}WeightTicket`)}>
      {t(`${I18N_ROOT_PATH}${action}`)}
      <Layouts.Margin left="1">
        <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
          {action === HistoryActionType.Removed ? previousValue : newValue}
        </Badge>
      </Layouts.Margin>
    </SubjectRow>
  );
};
