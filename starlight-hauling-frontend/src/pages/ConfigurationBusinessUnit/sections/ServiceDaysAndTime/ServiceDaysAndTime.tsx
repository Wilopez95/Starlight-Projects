import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@hooks';

import { WorkingDayTimeRow } from './components/WorkingDayTimeRow';

const I18N_PATH = 'pages.SystemConfiguration.tables.BusinessUnit.sections.ServiceDaysAndTime.Text.';

const ServiceDaysAndTime: React.FC = () => {
  const { t } = useTranslation();
  const { i18nStore } = useStores();
  const weekDays: [string, number][] = Object.entries(i18nStore.intlConfig.weekDays);

  return (
    <Layouts.Padding left="3" bottom="3">
      <Layouts.Margin bottom="4">
        <Typography variant="headerFive">{t(`${I18N_PATH}Title`)}</Typography>
      </Layouts.Margin>
      <Layouts.Flex>
        <Layouts.Box width="20rem">
          <Typography variant="caption" textTransform="uppercase" shade="light">
            {t(`${I18N_PATH}Day`)}
          </Typography>
        </Layouts.Box>
        <Layouts.Margin right="5">
          <Layouts.Box width="27rem">
            <Typography variant="caption" textTransform="uppercase" shade="light">
              {t(`${I18N_PATH}Start`)}
            </Typography>
          </Layouts.Box>
        </Layouts.Margin>
        <Typography variant="caption" textTransform="uppercase" shade="light">
          {t(`${I18N_PATH}End`)}
        </Typography>
      </Layouts.Flex>
      {weekDays.map(([weekDayName, weekDayNumber]) => (
        <WorkingDayTimeRow key={weekDayName} dayName={weekDayName} dayNumber={weekDayNumber} />
      ))}
    </Layouts.Padding>
  );
};

export default observer(ServiceDaysAndTime);
