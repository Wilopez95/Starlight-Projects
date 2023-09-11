import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import {
  AutocompleteOptionContext,
  HighlightDecorator,
  Layouts,
  RedirectButton,
} from '@starlightpro/shared-components';

import { Badge } from '@root/common/Badge/Badge';
import { Tooltip } from '@root/common/Tooltip/Tooltip';
import { Typography } from '@root/common/Typography/Typography';
import { CustomerStatus } from '@root/consts';
import { usePermission, useStores } from '@root/hooks';
import { CustomerSuggestion } from '@root/types/responseEntities';

import { I18N_TEMPLATE_PATH } from '../helpers';

import { CustomersListItem } from './CustomersListItem';
import { ICustomerComponent } from './types';

export const Customer: React.FC<ICustomerComponent> = ({ redirectPath, onlyName }) => {
  const item = useContext<CustomerSuggestion>(
    AutocompleteOptionContext as React.Context<CustomerSuggestion>,
  );
  const { t } = useTranslation();

  const {
    mailingAddress,
    contactName,
    contactEmail,
    phoneNumbers,
    billingAddress,
    name,
    id,
    email,
    status,
  } = item;

  const { customerStore, jobSiteStore } = useStores();
  const history = useHistory();

  const canPlaceOnHoldOrders = usePermission([
    'orders:new-prepaid-on-hold-order:perform',
    'orders:new-on-account-on-hold-order:perform',
  ]);

  const isOrderCreationDisabled =
    !redirectPath &&
    ((status === CustomerStatus.onHold && !canPlaceOnHoldOrders) ||
      status === CustomerStatus.inactive);

  const handleRedirect = useCallback(
    (e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>) => {
      e.stopPropagation();
      if (redirectPath) {
        customerStore.requestById(id);
        jobSiteStore.unSelectEntity();
        history.push(redirectPath);
      }
    },
    [customerStore, history, id, jobSiteStore, redirectPath],
  );

  const customerItem = (
    <Layouts.Flex as={Layouts.Box} justifyContent="space-between" alignItems="center" width="100%">
      <div>
        <Typography variant="bodyMedium">
          <HighlightDecorator highlight={item.highlight} property="name">
            {name}
          </HighlightDecorator>
        </Typography>

        {onlyName === false || onlyName === undefined ? (
          <Typography color="secondary" variant="bodyMedium" shade="desaturated">
            <CustomersListItem field="email" value={email} item={item} />
            <CustomersListItem field="billingAddress" value={billingAddress} item={item} />
            {mailingAddress &&
            (mailingAddress !== billingAddress ||
              (item.highlight?.mailingAddress && !item.highlight.billingAddress)) ? (
              <CustomersListItem field="mailingAddress" value={mailingAddress} item={item} />
            ) : null}
            {phoneNumbers?.length > 0 ? (
              <CustomersListItem field="phoneNumbers" value={phoneNumbers.join(', ')} item={item} />
            ) : null}
            <CustomersListItem field="contactName" value={contactName} item={item} />
            <CustomersListItem
              separator={contactName ? ', ' : '   '}
              field="contactEmail"
              value={contactEmail}
              item={item}
            />
            <CustomersListItem separator="   ID: " field="id" value={id.toString()} item={item} />
          </Typography>
        ) : null}
      </div>
      <Layouts.Flex>
        {status !== CustomerStatus.active ? (
          <Layouts.Margin as={Layouts.Box} width="75px" left="2">
            <Badge color="alert">
              {t(`Text.${status === CustomerStatus.onHold ? 'OnHold' : 'Inactive'}`)}
            </Badge>
          </Layouts.Margin>
        ) : null}
        {redirectPath &&
        status !== CustomerStatus.inactive &&
        (status !== CustomerStatus.onHold || canPlaceOnHoldOrders) ? (
          <RedirectButton onClick={handleRedirect}>
            {t(`${I18N_TEMPLATE_PATH}Customer.PlaceNewService`)}
          </RedirectButton>
        ) : null}
      </Layouts.Flex>
    </Layouts.Flex>
  );

  return isOrderCreationDisabled ? (
    <Tooltip position="top" fullWidth text={t(`${I18N_TEMPLATE_PATH}Customer.NewOrdersNotAllowed`)}>
      {customerItem}
    </Tooltip>
  ) : (
    customerItem
  );
};
