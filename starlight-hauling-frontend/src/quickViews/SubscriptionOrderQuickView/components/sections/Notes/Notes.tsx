import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Banner, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { BillableItemActionEnum } from '@root/consts';
import { useStores } from '@root/hooks';

const I18N_PATH = 'quickViews.SubscriptionOrderQuickView.components.sections.Notes.';

const Notes: React.FC<{ isWorkOrderView?: boolean }> = ({ isWorkOrderView }) => {
  const { t } = useTranslation();
  const { subscriptionOrderStore, subscriptionWorkOrderStore } = useStores();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const subscriptionWorkOrder = subscriptionWorkOrderStore.selectedEntity;

  const billableService = subscriptionOrder?.billableService;
  const isNonServiceOrder = billableService?.action === BillableItemActionEnum.nonService;
  const currentViewStore = isWorkOrderView ? subscriptionWorkOrder : subscriptionOrder;

  if (!currentViewStore) {
    return null;
  }
  const { jobSiteNote, instructionsForDriver } = currentViewStore;

  return (
    <>
      {jobSiteNote || instructionsForDriver ? <Divider both /> : null}
      {jobSiteNote ? (
        <Layouts.Margin bottom="2">
          <Banner showIcon={false} color="grey">
            <Layouts.Flex direction="column">
              <Typography color="secondary" shade="light">
                {t(`${I18N_PATH}JobSitePopUpNote`)}
              </Typography>
              <Layouts.Margin top="0.5">
                <Typography variant="bodySmall">{jobSiteNote}</Typography>
              </Layouts.Margin>
            </Layouts.Flex>
          </Banner>
        </Layouts.Margin>
      ) : null}
      {instructionsForDriver ? (
        <Banner showIcon={false}>
          <Layouts.Flex direction="column">
            <Typography color="secondary" shade="light">
              {isNonServiceOrder
                ? t(`${I18N_PATH}Instructions`)
                : t(`${I18N_PATH}InstructionsForDriver`)}
            </Typography>
            <Layouts.Margin top="0.5">
              <Typography variant="bodySmall">{instructionsForDriver}</Typography>
            </Layouts.Margin>
          </Layouts.Flex>
        </Banner>
      ) : null}
    </>
  );
};

export default observer(Notes);
