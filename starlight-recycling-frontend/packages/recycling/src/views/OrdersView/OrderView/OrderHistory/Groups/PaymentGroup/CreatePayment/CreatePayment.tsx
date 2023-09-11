import React from 'react';
import { keyBy } from 'lodash-es';

import { HistoryRow } from '../../../components/HistoryRow/HistoryRow';
import { SubjectRow } from '../../BaseRows';

import { formatCreditCard, getSubject } from './helpers';
import { ICreatePayment } from './types';
import { useRegion } from '../../../../../../../hooks/useRegion';
import { CreditCard } from '../../../../../../../graphql/api';
import Label from '../../../../../../../components/Label';
import { useTranslation } from '../../../../../../../i18n';
import { Box } from '@material-ui/core';

const attributes = ['assignedAmount', 'amount', 'paymentType', 'status'];

export const OrderHistoryCreatePayment: React.FC<ICreatePayment> = ({ historyItem }) => {
  const { formatMoney } = useRegion();
  const [t] = useTranslation();

  let byValue = null;

  const attributeValues = keyBy(
    historyItem.changes.filter(({ attribute }) => attributes.includes(attribute)),
    'attribute',
  ) as { [key in 'assignedAmount' | 'amount' | 'paymentType' | 'status']: any };

  const status: any = attributeValues?.status?.newValue; // todo: UpdateHaulingOrderInput
  const paymentType: any = attributeValues?.paymentType?.newValue; // todo: UpdateHaulingOrderInput
  const money =
    (status === 'authorized'
      ? attributeValues?.amount?.newValue
      : attributeValues?.assignedAmount?.newValue) ?? 0;

  switch (paymentType) {
    case 'check':
      {
        const checkNumber = historyItem.changes.find((x) => x.attribute === 'checkNumber')
          ?.newValue;

        byValue = (
          <Label variant="lightGrey">
            {t('Check')} # {checkNumber}
          </Label>
        );
      }
      break;
    case 'creditCard':
      {
        const creditCard = historyItem.changes.find((x) => x.attribute === 'creditCardId')
          ?.populatedValues?.newValue as CreditCard;

        byValue = <Label variant="lightGrey">{formatCreditCard(creditCard)}</Label>;
      }
      break;

    case 'cash':
      byValue = <Label variant="lightGrey">{t('Cash')}</Label>;
      break;

    default:
      break;
  }

  return (
    <HistoryRow>
      <SubjectRow
        subject={getSubject(status)}
        prefix={status === 'deferred' ? 'Created' : undefined}
      >
        <Box mx={0.5}>{t('by')}</Box>
        {byValue}
        <Box mx={0.5}>{t('for')}</Box>
        <Label variant="lightGrey">{formatMoney(money)}</Label>
      </SubjectRow>
    </HistoryRow>
  );
};
