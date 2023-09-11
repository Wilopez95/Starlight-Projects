import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Badge } from '@starlightpro/shared-components';
import { invert } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Table, TableBody, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import {
  CustomerSubscriptionLayout,
  CustomerSubscriptionNavigation,
} from '@root/components/PageLayouts';
import { getColorBySubscriptionHistoryAction } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { useStores } from '@hooks';

import { CustomerSubscriptionParams } from '../../components/PageLayouts/CustomerSubscriptionLayout/types';

import { formatDescriptionValue, getDescriptionOrReasonKey } from './helpers';
import { TypographyStyled } from './styles';

const I18N_PATH = 'pages.CustomerSubscriptionHistory.Text.';
const fallback = '-';

const CustomerSubscriptionHistory: React.FC = () => {
  const { subscriptionId } = useParams<CustomerSubscriptionParams>();
  const { subscriptionStore } = useStores();
  const intl = useIntl();
  const { formatDateTime, weekDays } = intl;
  const { t } = useTranslation();

  useEffect(() => {
    subscriptionStore.requestHistoryById(+subscriptionId);

    return () => {
      subscriptionStore.cleanupHistory();
    };
  }, [subscriptionId, subscriptionStore]);

  return (
    <CustomerSubscriptionLayout>
      <TableTools.ScrollContainer tableNavigation={<CustomerSubscriptionNavigation />}>
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell>{t(`${I18N_PATH}DateOfChange`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}EffectiveDate`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}MadeBy`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t('Text.Action')}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}Attribute`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}DescriptionOrReason`)}</TableTools.HeaderCell>
          </TableTools.Header>

          <TableBody cells={1}>
            {subscriptionStore.history.map(subscriptionHistoryRecord => (
              <TableRow key={subscriptionHistoryRecord.id}>
                <TableCell>
                  {formatDateTime(subscriptionHistoryRecord.createdAt as Date).dateTime}
                </TableCell>
                <TableCell>
                  {subscriptionHistoryRecord.effectiveDate
                    ? formatDateTime(subscriptionHistoryRecord.effectiveDate).date
                    : fallback}
                </TableCell>
                <TableCell>
                  {subscriptionHistoryRecord.madeById
                    ? subscriptionHistoryRecord.madeBy
                    : t(`${I18N_PATH}System`)}
                </TableCell>
                <TableCell>
                  <Badge
                    borderRadius={2}
                    color={getColorBySubscriptionHistoryAction(subscriptionHistoryRecord.action)}
                  >
                    {t(`consts.SubscriptionHistoryActionEnum.${subscriptionHistoryRecord.action}`)}{' '}
                  </Badge>
                </TableCell>
                <TableCell>
                  {subscriptionHistoryRecord.attribute
                    ? t(
                        `consts.SubscriptionHistoryAttributeEnum.${subscriptionHistoryRecord.attribute}`,
                      )
                    : t(`consts.SubscriptionHistoryEntityEnum.${subscriptionHistoryRecord.entity}`)}
                </TableCell>
                <TableCell capitalize={false}>
                  <TypographyStyled>
                    <Trans
                      i18nKey={getDescriptionOrReasonKey(subscriptionHistoryRecord)}
                      values={{
                        quantity: subscriptionHistoryRecord.description.quantity,
                        closeDate: formatDescriptionValue(
                          subscriptionHistoryRecord.description.closeDate,
                          subscriptionHistoryRecord.attribute,
                          t,
                          intl,
                        ),
                        serviceName: subscriptionHistoryRecord.description.serviceName,
                        lineItemName: subscriptionHistoryRecord.description.lineItemName,
                        subscriptionOrderName:
                          subscriptionHistoryRecord.description.subscriptionOrderName,
                        serviceDay:
                          subscriptionHistoryRecord.description.serviceDay &&
                          invert(weekDays)[subscriptionHistoryRecord.description.serviceDay],
                        newValue: formatDescriptionValue(
                          subscriptionHistoryRecord.description.newValue,
                          subscriptionHistoryRecord.attribute,
                          t,
                          intl,
                        ),
                        previousValue: formatDescriptionValue(
                          subscriptionHistoryRecord.description.previousValue,
                          subscriptionHistoryRecord.attribute,
                          t,
                          intl,
                        ),
                      }}
                      components={{
                        bold: <strong />,
                      }}
                    />
                  </TypographyStyled>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </CustomerSubscriptionLayout>
  );
};

export default observer(CustomerSubscriptionHistory);
