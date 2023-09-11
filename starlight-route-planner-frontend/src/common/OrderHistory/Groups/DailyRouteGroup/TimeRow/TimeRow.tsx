import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { getHistoryActionType, HistoryActionType } from '../../../helpers/historyActionType';
import { SubjectRow } from '../../BaseRows';
import { Badge } from '../../common-styles';
import { getSubjectMap } from '../helper';
import { DailyRouteHistoryChanges } from '../types';

const I18N_ROOT_PATH = 'Text.';

export const TimeRow: React.FC<DailyRouteHistoryChanges> = ({ actualChanges }) => {
  const { t } = useTranslation();
  const { newValue, previousValue, attribute } = actualChanges[0];
  const action = getHistoryActionType(previousValue, newValue);
  const { formatDateTime } = useIntl();
  const subject = getSubjectMap(t, attribute);
  const { timeZone } = useTimeZone();

  const formatTime = useCallback(
    (value: string | undefined) => {
      if (!value) {
        return;
      }

      const date = new Date(value);
      return formatDateTime(date, { timeZone }).timeWithSeconds;
    },
    [timeZone, formatDateTime],
  );

  const timeNew = useMemo(() => {
    return formatTime(newValue);
  }, [newValue, formatTime]);

  const timePrevious = useMemo(() => {
    return formatTime(previousValue);
  }, [previousValue, formatTime]);

  return (
    <SubjectRow subject={subject}>
      {t(`${I18N_ROOT_PATH}${action}`)}
      {action === HistoryActionType.Added && (
        <Layouts.Margin left="1">
          <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
            {timeNew}
          </Badge>
        </Layouts.Margin>
      )}
      {action === HistoryActionType.Changed && (
        <>
          <Layouts.Margin left="1">
            <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
              {timePrevious}
            </Badge>
          </Layouts.Margin>
          <Layouts.Margin left="1">→</Layouts.Margin>
          <Layouts.Margin left="1">
            <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
              {timeNew}
            </Badge>
          </Layouts.Margin>
        </>
      )}
    </SubjectRow>
  );
};
