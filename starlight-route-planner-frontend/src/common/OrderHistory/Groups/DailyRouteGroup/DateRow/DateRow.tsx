import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { getHistoryActionType } from '../../../helpers/historyActionType';
import { SubjectRow } from '../../BaseRows';
import { Badge } from '../../common-styles';
import { getSubjectMap } from '../helper';
import { DailyRouteHistoryChanges } from '../types';

const I18N_ROOT_PATH = 'Text.';

export const DateRow: React.FC<DailyRouteHistoryChanges> = ({ actualChanges }) => {
  const { t } = useTranslation();
  const { formatDateTime } = useIntl();
  const { timeZone } = useTimeZone();
  const { newValue, previousValue, attribute } = actualChanges[0];
  const action = getHistoryActionType(previousValue, newValue);
  const subject = getSubjectMap(t, attribute);

  return (
    <SubjectRow subject={subject}>
      {t(`${I18N_ROOT_PATH}${action}`)}
      <Layouts.Margin left="1">
        <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
          {formatDateTime(new Date(newValue), { timeZone }).date}
        </Badge>
      </Layouts.Margin>
    </SubjectRow>
  );
};
