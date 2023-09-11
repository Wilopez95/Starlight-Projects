import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { ArrowLeftIcon } from '@root/assets';
import { Typography } from '@root/common';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useSubscriptionSelectedTab } from '@root/hooks';

import { CustomerSubscriptionParams } from '../../../types';

import { LinkButton } from './styles';

const BackButton: React.FC = () => {
  const { businessUnitId } = useBusinessContext();
  const { customerId } = useParams<CustomerSubscriptionParams>();
  const selectedTab = useSubscriptionSelectedTab();
  const { t } = useTranslation();

  const ordersAndSubscriptionsPath = pathToUrl(Paths.CustomerSubscriptionModule.Subscriptions, {
    businessUnit: businessUnitId,
    customerId,
    tab: selectedTab,
  });

  return (
    <LinkButton to={ordersAndSubscriptionsPath}>
      <Layouts.Flex justifyContent="flex-start" alignItems="center">
        <Layouts.IconLayout color="information" shade="standard">
          <ArrowLeftIcon />
        </Layouts.IconLayout>
        <Typography color="information">
          {t(
            'components.PageLayouts.CustomerSubscriptionLayout.components.buttons.BackButton.Text.BackToSubscriptionsList',
          )}
        </Typography>
      </Layouts.Flex>
    </LinkButton>
  );
};

export default observer(BackButton);
