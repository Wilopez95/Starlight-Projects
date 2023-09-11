import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { startCase, sumBy } from 'lodash-es';

import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';

import { CancelAltIcon } from '../../../../../assets';
import { Badge, Typography } from '../../../../../common';

import { ICustomerHeader } from './types';

export const CustomerHeader: React.FC<ICustomerHeader> = ({
  customer,
  onRemove,
  removable,
  customerGroup,
}) => {
  const total = sumBy(customer.invoices, x => x.fine ?? 0);
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onRemove();
      }
    },
    [onRemove],
  );

  return (
    <>
      <Layouts.Flex justifyContent="space-between">
        <Typography color="secondary">
          {customerGroup?.description} - ID {customer.id}
        </Typography>
        {removable ? (
          <Typography color="information" as="span" cursor="pointer" onClick={onRemove}>
            <Layouts.Flex justifyContent="space-between">
              <Layouts.IconLayout>
                <CancelAltIcon
                  role="button"
                  tabIndex={0}
                  aria-label={t('Text.Remove')}
                  onKeyDown={handleKeyDown}
                />
              </Layouts.IconLayout>
              Remove Customer
            </Layouts.Flex>
          </Typography>
        ) : null}
      </Layouts.Flex>
      <Layouts.Margin top="2" bottom="1">
        <Layouts.Flex justifyContent="space-between">
          <Typography variant="headerTwo">
            {customer.businessName ?? `${customer.firstName} ${customer.lastName}`}
          </Typography>
          <Typography variant="headerTwo">{formatCurrency(total)}</Typography>
        </Layouts.Flex>
      </Layouts.Margin>
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Flex>
          <Layouts.Margin left="1">
            <Badge color="secondary" shade="desaturated" bgColor="grey" bgShade="light">
              {customer?.onAccount ? 'On Account' : 'Prepaid'}
            </Badge>
          </Layouts.Margin>
          <Layouts.Margin left="1">
            <Badge color="secondary" shade="desaturated" bgColor="grey" bgShade="light">
              {customer?.invoiceConstruction === 'byAddress'
                ? 'By Job Site'
                : startCase(customer?.invoiceConstruction)}
            </Badge>
          </Layouts.Margin>
          <Layouts.Margin left="1">
            <Badge color="secondary" shade="desaturated" bgColor="grey" bgShade="light">
              Weekly
            </Badge>
          </Layouts.Margin>
          <Layouts.Margin left="1">
            <Badge color="secondary" shade="desaturated" bgColor="grey" bgShade="light">
              APR {customer.financeChargeApr} %
            </Badge>
          </Layouts.Margin>
        </Layouts.Flex>
        <Typography color="secondary">Customer Charges Total</Typography>
      </Layouts.Flex>
      <Layouts.Margin top="2" bottom="2">
        <Typography color="secondary">
          Here you can see finance charges for overdue invoices in last statement period.
        </Typography>
      </Layouts.Margin>
    </>
  );
};
