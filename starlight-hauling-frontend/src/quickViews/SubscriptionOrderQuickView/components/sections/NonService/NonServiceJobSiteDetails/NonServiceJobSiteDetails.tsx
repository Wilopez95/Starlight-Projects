import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { DetailItem } from '@root/pages/CustomerSubscriptionDetails/components';

const I18N_PATH =
  'quickViews.SubscriptionOrderQuickView.components.sections.NonService.NonServiceJobSiteDetails.';

const NonServiceJobSiteDetails: React.FC = () => {
  const { t } = useTranslation();
  const { subscriptionOrderStore } = useStores();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;

  return (
    <>
      <Divider both />
      <Layouts.Margin top="2" bottom="2">
        <Typography variant="headerThree">{t(`${I18N_PATH}JobSiteDetails`)}</Typography>
        <Layouts.Flex justifyContent="space-between">
          <Layouts.Column>
            <Layouts.Margin top="2">
              <DetailItem label={t(`${I18N_PATH}JobSite`)}>
                <Typography>{subscriptionOrder?.jobSiteAddress}</Typography>
              </DetailItem>
            </Layouts.Margin>
            <Layouts.Margin top="2">
              <Checkbox
                value={subscriptionOrder?.poRequired}
                disabled
                name="poRequired"
                onChange={noop}
              >
                {t(`${I18N_PATH}PONumberRequired`)}
              </Checkbox>
            </Layouts.Margin>
          </Layouts.Column>
        </Layouts.Flex>
      </Layouts.Margin>
    </>
  );
};

export default observer(NonServiceJobSiteDetails);
