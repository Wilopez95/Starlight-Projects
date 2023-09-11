import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Banner, Typography } from '@root/common';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { type IReminderDetails } from './types';

const fallback = '-';
const I18N_PATH = `pages.CustomerSubscriptionDetails.components.ReminderDetails.Text.`;

const ReminderDetails: React.FC<IReminderDetails> = ({ setReminderConfig }) => {
  const { reminderStore } = useStores();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();

  const getInformByResources = useMemo(() => {
    if (reminderStore.currentReminderConfig) {
      const informByResources: Record<string, boolean> = {
        informByApp: reminderStore?.currentReminderConfig.informBy.informByApp,
        informByEmail: reminderStore?.currentReminderConfig.informBy.informByEmail,
        informBySms: reminderStore?.currentReminderConfig.informBy.informBySms,
      };

      return Object.keys(informByResources)
        .reduce((allResources: string[], resource) => {
          return informByResources[resource]
            ? [...allResources, t(`consts.InformByEnum.${resource}`)]
            : allResources;
        }, [])
        .join(', ');
    }

    return fallback;
  }, [reminderStore.currentReminderConfig, t]);

  return (
    <Layouts.Margin top="2">
      <Banner showIcon={false} onEdit={setReminderConfig} color="primary">
        <Layouts.Column>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18N_PATH}ReminderToSendOffer`)}
          </Typography>
          <Layouts.Margin top="1">
            <Typography>
              {(reminderStore?.currentReminderConfig?.date &&
                formatDateTime(reminderStore.currentReminderConfig.date).date) ||
                fallback}
            </Typography>
          </Layouts.Margin>
        </Layouts.Column>
        <Layouts.Column>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18N_PATH}InformBy`)}
          </Typography>
          <Layouts.Margin top="1">
            <Typography>{getInformByResources}</Typography>
          </Layouts.Margin>
        </Layouts.Column>
      </Banner>
    </Layouts.Margin>
  );
};

export default observer(ReminderDetails);
