import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useAggregatedFormatFrequency } from '@root/common/TableTools/TableData/helpers/useFormatFrequency';
import { BusinessLineType } from '@root/consts';
import { useStores } from '@root/hooks/useStores';
import { mapDaysToBase, mondayWeekBase } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { DetailColumnItem } from '@root/pages/CustomerSubscriptionDetails/components';
import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';
import { ServiceFrequencyAggregated } from '@root/types/entities/frequency';

const I18N_PATH =
  'quickViews.SubscriptionOrderQuickView.components.sections.SubscriptionServicingOrderDetails.';

const SubscriptionServicingOrderDetails: React.FC<{
  subscriptionOrder: SubscriptionOrder;
  serviceFrequencyAggregated?: ServiceFrequencyAggregated;
  isWorkOrderView?: boolean;
}> = ({ subscriptionOrder, serviceFrequencyAggregated, isWorkOrderView = false }) => {
  const { t } = useTranslation();
  const { subscriptionWorkOrderStore } = useStores();
  const intlConfig = useIntl();
  const aggregatedFormatFrequency = useAggregatedFormatFrequency();
  const subscriptionWorkOrder = subscriptionWorkOrderStore.selectedEntity;
  const { subscriptionServiceItem } = subscriptionOrder;
  const businessLineType = subscriptionOrder.businessLine?.type;

  const days = useMemo(
    () => Object.keys(mapDaysToBase(intlConfig)).map(day => day.substring(0, 2)),
    [intlConfig],
  );
  const daysList = useMemo(
    () =>
      subscriptionServiceItem.serviceDaysOfWeek &&
      Object.keys(subscriptionServiceItem.serviceDaysOfWeek)
        .map(key => days[mondayWeekBase[+key]])
        .join(', '),
    [days, subscriptionServiceItem],
  );

  return (
    <>
      <Divider both />
      <Layouts.Margin top="2" bottom="3">
        <Typography variant="headerThree">{t(`${I18N_PATH}Services`)}</Typography>
        <Layouts.Box width="90%">
          <Layouts.Flex justifyContent="space-between">
            <Layouts.Box width={isWorkOrderView ? '520px' : '630px'}>
              <Layouts.Flex justifyContent="space-between">
                <DetailColumnItem
                  label={t(`${I18N_PATH}Service`)}
                  textTransform="uppercase"
                  variant="bodySmall"
                >
                  {subscriptionOrder.billableService.description}
                </DetailColumnItem>
                <DetailColumnItem
                  label={t(`${I18N_PATH}Material`)}
                  textTransform="uppercase"
                  variant="bodySmall"
                >
                  {subscriptionOrder.subscriptionServiceItem.material?.description}
                </DetailColumnItem>
                <DetailColumnItem
                  label={t(`${I18N_PATH}Frequency`)}
                  textTransform="uppercase"
                  variant="bodySmall"
                >
                  {serviceFrequencyAggregated
                    ? aggregatedFormatFrequency(serviceFrequencyAggregated)
                    : null}
                  {typeof serviceFrequencyAggregated !== 'string' &&
                  serviceFrequencyAggregated?.type === 'xPerWeek' &&
                  daysList
                    ? ` (${daysList})`
                    : null}
                </DetailColumnItem>
              </Layouts.Flex>
            </Layouts.Box>
            <Layouts.Box>
              <DetailColumnItem
                label={t(
                  `${I18N_PATH}${
                    businessLineType === BusinessLineType.portableToilets
                      ? 'PreferredRoute'
                      : 'AssignedRoute'
                  }`,
                )}
                textTransform="uppercase"
                variant="bodySmall"
              >
                {isWorkOrderView
                  ? subscriptionWorkOrder?.assignedRoute
                  : subscriptionOrder.assignedRoute}
              </DetailColumnItem>
            </Layouts.Box>
            {!isWorkOrderView ? (
              <Layouts.Box>
                <DetailColumnItem
                  label={t(`${I18N_PATH}qty`)}
                  textTransform="uppercase"
                  textAlign="center"
                  variant="bodySmall"
                >
                  {subscriptionOrder.subscriptionServiceItem.quantity}
                </DetailColumnItem>
              </Layouts.Box>
            ) : null}
          </Layouts.Flex>
        </Layouts.Box>
      </Layouts.Margin>
    </>
  );
};

export default observer(SubscriptionServicingOrderDetails);
