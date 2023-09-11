import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Tooltip } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { useStores } from '@root/hooks';
import { mondayWeekBase, sundayFirstLocals } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { IServiceDaysOfWeek } from '@root/types';

const I18N_PATH = 'quickViews.SubscriptionQuickView.ServiceItem.';

const ServiceDaysList: React.FC<{ serviceDaysOfWeek?: IServiceDaysOfWeek }> = ({
  serviceDaysOfWeek,
}) => {
  const { i18nStore } = useStores();
  const { t } = useTranslation();
  const intlConfig = useIntl();

  const dayOfWeek = useMemo(
    () => Object.keys(intlConfig.weekDays).map(day => day.charAt(0)),
    [intlConfig.weekDays],
  );

  const convertedDays =
    serviceDaysOfWeek && sundayFirstLocals.includes(i18nStore.region)
      ? Object.entries(serviceDaysOfWeek).reduce((acc, [dayIndex, value]) => {
          return { ...acc, [mondayWeekBase[+dayIndex]]: value };
        }, {})
      : serviceDaysOfWeek;

  return (
    <Layouts.Flex>
      {dayOfWeek.map((day, idx) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const hasServiceAt = convertedDays ? Object.hasOwn(convertedDays, idx) : false;

        return (
          <Layouts.Padding key={`${day} ${idx}`} right="0.5">
            {hasServiceAt ? (
              <Tooltip text={t(`${I18N_PATH}ServiceDay`)} position="top">
                <Typography as="span" color="primary" shade="standard" variant="bodyMedium">
                  {day}
                </Typography>
              </Tooltip>
            ) : (
              <Tooltip text={t(`${I18N_PATH}NonServiceDay`)} position="top">
                <Typography as="span" color="secondary" shade="desaturated" variant="bodyMedium">
                  {day}
                </Typography>
              </Tooltip>
            )}
          </Layouts.Padding>
        );
      })}
    </Layouts.Flex>
  );
};

export default observer(ServiceDaysList);
