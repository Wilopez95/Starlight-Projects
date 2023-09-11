import React, { useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Layouts,
  StatusBadge,
  Switch,
  Typography,
} from '@starlightpro/shared-components';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';

import {
  Table,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeader,
  TableRow,
} from '@root/core/common/TableTools';
import { useCleanup, useStores } from '@root/core/hooks';
import { CreditCardQuickView } from '@root/customer/quickViews';

import { CustomerPortalLayout } from '../../layouts';
import { CustomerNavigation } from '../../layouts/CustomerNavigation';
import CustomerStyles from '../../layouts/CustomerStyles';

const I18N_PATH = 'pages.customerCreditCards.';

const CustomerCreditCards: React.FC = () => {
  const { t } = useTranslation();
  const { customerStore, creditCardStore } = useStores();
  const navigationRef = useRef<HTMLDivElement>(null);

  const customer = customerStore.selectedEntity!;

  useCleanup(creditCardStore);
  useEffect(() => {
    if (customer) {
      creditCardStore.request({ customerId: +customer.id });
    }
  }, [creditCardStore, customer]);

  const handleChangeShowInactive = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      creditCardStore.changeShowInactive(e.target.checked);
    },
    [creditCardStore],
  );

  const handleCreateCreditCard = useCallback(() => {
    creditCardStore.toggleQuickView(true);
  }, [creditCardStore]);

  const selectedCreditCard = creditCardStore.selectedEntity;

  return (
    <CustomerPortalLayout>
      <Helmet title={t('Titles.CreditCards')} />
      <CustomerNavigation ref={navigationRef} />
      <CreditCardQuickView
        store={creditCardStore}
        tableContainerRef={navigationRef}
        condition={creditCardStore.isOpenQuickView}
      />
      <CustomerStyles.PageContainer>
        <CustomerStyles.TitleContainer>
          <Typography variant='headerThree'>{t(`${I18N_PATH}creditCards`)}</Typography>
          <Layouts.Flex alignItems='center'>
            <Layouts.Margin right='3'>
              <Switch
                name='ShowInactiveCreditCards'
                value={creditCardStore.shouldShowInactive}
                onChange={handleChangeShowInactive}
              >
                {t(`${I18N_PATH}showInactive`)}
              </Switch>
            </Layouts.Margin>

            <Button variant='primary' onClick={handleCreateCreditCard}>
              {t(`${I18N_PATH}addCreditCard`)}
            </Button>
          </Layouts.Flex>
        </CustomerStyles.TitleContainer>

        <CustomerStyles.ScrollContainer>
          <Table>
            <TableHeader>
              <TableHeadCell>
                <Typography variant='headerFive' color='secondary'>
                  {t(`${I18N_PATH}status`)}
                </Typography>
              </TableHeadCell>
              <TableHeadCell>
                <Typography variant='headerFive' color='secondary'>
                  {t(`${I18N_PATH}cardNickname`)}
                </Typography>
              </TableHeadCell>
              <TableHeadCell>
                <Typography variant='headerFive' color='secondary'>
                  {t(`${I18N_PATH}cardType`)}
                </Typography>
              </TableHeadCell>
              <TableHeadCell>
                <Typography variant='headerFive' color='secondary'>
                  {t(`${I18N_PATH}cardNumber`)}
                </Typography>
              </TableHeadCell>
              <TableHeadCell>
                <Typography variant='headerFive' color='secondary'>
                  {t(`${I18N_PATH}expirationDate`)}
                </Typography>
              </TableHeadCell>
              {/* <TableHeadCell>
                <Typography variant='headerFive' color='secondary'>
                  {t(`${I18N_PATH}validFor`)}
                </Typography>
              </TableHeadCell> */}
            </TableHeader>
            <TableBody loading={creditCardStore.loading} cells={6}>
              {creditCardStore.filteredValues.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => creditCardStore.selectEntity(item)}
                  selected={selectedCreditCard?.id === item.id}
                >
                  <TableCell>
                    <StatusBadge active={item.active} />
                  </TableCell>
                  <TableCell>{item.nickName}</TableCell>
                  <TableCell>{item.cardBrand}</TableCell>
                  <TableCell>•••• {item.cardNumberLastDigits}</TableCell>
                  <TableCell>
                    {format(item.expDate, 'MM / yyyy')}
                    {item.expiredLabel && (
                      <Layouts.Margin left='1'>
                        <Badge color='alert'>Expired</Badge>
                      </Layouts.Margin>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CustomerStyles.ScrollContainer>
      </CustomerStyles.PageContainer>
    </CustomerPortalLayout>
  );
};

export default observer(CustomerCreditCards);
