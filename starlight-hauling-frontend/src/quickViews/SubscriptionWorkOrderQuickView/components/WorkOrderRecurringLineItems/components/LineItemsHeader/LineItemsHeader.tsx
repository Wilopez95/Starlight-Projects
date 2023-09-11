import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';
import { DetailColumnItem } from '@root/pages/CustomerSubscriptionDetails/components';

const I18N_PATH =
  'quickViews.SubscriptionOrderQuickView.components.sections.WorkOrderRecurringLineItems.Header.';

export const LineItemsHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="headerThree">{t(`${I18N_PATH}RecurringLineItems`)}</Typography>
      <Layouts.Flex justifyContent="space-between">
        <DetailColumnItem
          label={t(`${I18N_PATH}RecurringLineItem`)}
          textTransform="uppercase"
          variant="bodySmall"
        />
        <DetailColumnItem
          label={t(`${I18N_PATH}Units`)}
          textTransform="uppercase"
          variant="bodySmall"
        />
      </Layouts.Flex>
    </>
  );
};
