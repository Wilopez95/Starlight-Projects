import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { DetailItem } from '..';

const fallback = '-';
const I18N_PATH = `pages.CustomerSubscriptionDetails.components.CompetitorDetails.Text.`;

const CompetitorDetails: React.FC = () => {
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();

  const { subscriptionDraftStore } = useStores();
  const subscriptionDraft = subscriptionDraftStore.selectedEntity;

  if (!subscriptionDraft) {
    return null;
  }

  const { competitor, competitorExpirationDate } = subscriptionDraft;

  if (!competitor || !competitorExpirationDate) {
    return null;
  }

  return (
    <>
      <Layouts.Margin top="2" bottom="2">
        <Typography variant="headerThree">{t(`${I18N_PATH}CompetitorDetails`)}</Typography>
        <Layouts.Flex justifyContent="space-between">
          <Layouts.Column>
            <DetailItem label={t(`${I18N_PATH}CurrentProvider`)}>
              <Typography>{competitor.description ?? fallback}</Typography>
            </DetailItem>
          </Layouts.Column>
          <Layouts.Column>
            <DetailItem label={t(`${I18N_PATH}ContractExpirationDate`)}>
              {formatDateTime(competitorExpirationDate).date}
            </DetailItem>
          </Layouts.Column>
        </Layouts.Flex>
      </Layouts.Margin>
      <Divider />
    </>
  );
};

export default observer(CompetitorDetails);
