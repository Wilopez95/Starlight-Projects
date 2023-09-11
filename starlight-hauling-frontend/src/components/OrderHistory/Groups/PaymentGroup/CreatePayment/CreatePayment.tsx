import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { keyBy } from 'lodash-es';

import { Badge } from '@root/common';
import { formatCreditCard } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { ICreditCard, PaymentStatus, PaymentType } from '@root/modules/billing/types';

import { HistoryRow } from '../../../components/HistoryRow/HistoryRow';
import { SubjectRow } from '../../BaseRows';

import { getSubject } from './helpers';
import { ICreatePayment } from './types';

const attributes = ['assignedAmount', 'amount', 'paymentType', 'status'];

export const OrderHistoryCreatePayment: React.FC<ICreatePayment> = ({ historyItem }) => {
  const { formatCurrency } = useIntl();

  let byValue = null;

  const attributeValues = keyBy(
    historyItem.changes.filter(({ attribute }) => attributes.includes(attribute)),
    'attribute',
  );

  const status: PaymentStatus = attributeValues?.status?.newValue as PaymentStatus;
  const paymentType: PaymentType = attributeValues?.paymentType?.newValue as PaymentType;
  const money: number =
    (status === 'authorized'
      ? Number(attributeValues?.amount?.newValue)
      : Number(attributeValues?.assignedAmount?.newValue)) ?? 0;

  switch (paymentType) {
    case 'check':
      {
        const checkNumber = historyItem.changes.find(x => x.attribute === 'checkNumber')?.newValue;

        byValue = (
          <Badge color="secondary" shade="dark" bgColor="grey" bgShade="light">
            check # {checkNumber}
          </Badge>
        );
      }
      break;
    case 'creditCard':
      {
        const creditCard = historyItem.changes.find(x => x.attribute === 'creditCardId')
          ?.populatedValues?.newValue as ICreditCard;

        byValue = (
          <Badge color="secondary" shade="dark" bgColor="grey" bgShade="light">
            {formatCreditCard(creditCard)}
          </Badge>
        );
      }
      break;

    case 'cash':
      byValue = (
        <Badge color="secondary" shade="dark" bgColor="grey" bgShade="light">
          Cash
        </Badge>
      );
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
        <Layouts.Margin right="0.5">by</Layouts.Margin>
        {byValue}
        <Layouts.Margin left="0.5" right="0.5">
          for
        </Layouts.Margin>
        <Badge color="secondary" shade="dark" bgColor="grey" bgShade="light">
          {formatCurrency(money)}
        </Badge>
      </SubjectRow>
    </HistoryRow>
  );
};
