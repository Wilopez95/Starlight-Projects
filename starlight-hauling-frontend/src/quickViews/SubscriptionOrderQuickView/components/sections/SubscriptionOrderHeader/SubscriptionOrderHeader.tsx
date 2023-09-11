/* eslint-disable no-negated-condition */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { BillableItemActionEnum, Paths, SubscriptionTabRoutes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { SubscriptionOrderStatusEnum } from '@root/types';
import { useBusinessContext, useStores } from '@hooks';

const I18N_PATH = `quickViews.SubscriptionOrderQuickView.components.sections.SubscriptionOrderHeader.Text.`;

const SubscriptionOrderHeader: React.FC = () => {
  const { t } = useTranslation();
  const { subscriptionOrderStore, subscriptionStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity!;
  const oneTime = subscriptionOrder.oneTime;
  const billableService = subscriptionOrder.billableService;
  const isNonServiceOrder = billableService.action === BillableItemActionEnum.nonService;
  const isNeedsApproval = subscriptionOrder.status === SubscriptionOrderStatusEnum.needsApproval;
  const statusColor = subscriptionOrder.statusColor;

  return (
    <div className={tableQuickViewStyles.dataContainer}>
      <div className={tableQuickViewStyles.quickViewTitle}>
        {isNonServiceOrder ? t(`${I18N_PATH}NonService`) : t(`${I18N_PATH}Subscription`)}{' '}
        {!oneTime ? t(`${I18N_PATH}Servicing`) : ''} {t(`${I18N_PATH}Order`)} #
        <Link
          to={pathToUrl(Paths.CustomerSubscriptionModule.OrderDetails, {
            businessUnit: businessUnitId,
            subscriptionId: subscriptionOrder.subscriptionServiceItem.subscriptionId,
            customerId: subscriptionOrder.customer?.originalId,
            tab: subscriptionStore?.selectedEntity?.status ?? SubscriptionTabRoutes.Active,
            subscriptionOrderId: subscriptionOrder.id,
          })}
        >
          <Typography as="span" color="information">
            {subscriptionOrder.sequenceId}
          </Typography>
        </Link>
      </div>
      <div className={tableQuickViewStyles.quickViewDescription}>
        <Badge
          borderRadius={2}
          color={statusColor}
          bgColor={isNeedsApproval ? 'grey' : statusColor}
          shade={isNeedsApproval ? 'light' : 'standard'}
          bgShade={isNeedsApproval ? 'light' : 'desaturated'}
        >
          {t(`consts.SubscriptionOrderStatuses.${subscriptionOrder.statusLabel}`)}
        </Badge>
      </div>
    </div>
  );
};

export default observer(SubscriptionOrderHeader);
