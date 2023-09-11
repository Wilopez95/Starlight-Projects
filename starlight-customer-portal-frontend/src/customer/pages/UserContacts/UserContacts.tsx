import React, { useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, StatusBadge, Switch, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Phone } from '@root/core/common';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeader,
  TableRow,
} from '@root/core/common/TableTools';
import { useStores } from '@root/core/hooks';
import { CustomerNavigation, CustomerPortalLayout, CustomerStyles } from '@root/customer/layouts';
import { CustomerContactQuickView } from '@root/customer/quickViews';

const UserContacts: React.FC = () => {
  const { contactStore, customerStore } = useStores();

  const navigationRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const customer = customerStore.selectedEntity;

  useEffect(() => {
    if (customer) {
      contactStore.requestByCustomer({ customerId: customer.id });
    }
  }, [contactStore, customer]);

  const handleCreateCreditCard = useCallback(() => {
    contactStore.toggleQuickView(true);
  }, [contactStore]);

  const selectedContact = contactStore.selectedEntity;

  const handleChangeShowInactive = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      contactStore.changeShowInactive(e.target.checked);
    },
    [contactStore],
  );

  return (
    <CustomerPortalLayout>
      <Helmet title={t('Titles.Users')} />
      <CustomerNavigation ref={navigationRef} />
      <CustomerContactQuickView
        store={contactStore}
        tableContainerRef={navigationRef}
        condition={contactStore.isOpenQuickView}
      />
      <CustomerStyles.PageContainer>
        <CustomerStyles.TitleContainer>
          <Typography variant='headerThree'>{t('Titles.Users')}</Typography>
          <Layouts.Flex>
            <Layouts.Margin right='3' top='1'>
              <Switch
                name='showInactiveCreditCards'
                value={contactStore.shouldShowInactive}
                onChange={handleChangeShowInactive}
              >
                Show Inactive
              </Switch>
            </Layouts.Margin>
            <Layouts.Flex alignItems='center'>
              <Button variant='primary' onClick={handleCreateCreditCard}>
                Add User
              </Button>
            </Layouts.Flex>
          </Layouts.Flex>
        </CustomerStyles.TitleContainer>

        <CustomerStyles.ScrollContainer>
          <Table>
            <TableHeader>
              <TableHeadCell>
                <Typography variant='headerFive' color='secondary' shade='light'>
                  Status
                </Typography>
              </TableHeadCell>
              <TableHeadCell>
                <Typography variant='headerFive' color='secondary' shade='light'>
                  Name
                </Typography>
              </TableHeadCell>
              <TableHeadCell>
                <Typography variant='headerFive' color='secondary' shade='light'>
                  Title
                </Typography>
              </TableHeadCell>
              <TableHeadCell>
                <Typography variant='headerFive' color='secondary' shade='light'>
                  Phone
                </Typography>
              </TableHeadCell>
              <TableHeadCell>
                <Typography variant='headerFive' color='secondary' shade='light'>
                  Email
                </Typography>
              </TableHeadCell>
            </TableHeader>
            <TableBody loading={contactStore.loading} cells={5} noResult={contactStore.noResult}>
              {contactStore.filteredValues.map((item, index) => {
                const mainNumber = item.phoneNumbers?.find((phone) => phone.type === 'main')
                  ?.number;

                return (
                  <React.Fragment key={item.id}>
                    <TableRow
                      onClick={() => contactStore.selectEntity(item)}
                      selected={selectedContact?.id === item.id}
                    >
                      <TableCell>
                        <StatusBadge active={item.active} />
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        {item.main && <Typography fontWeight='bold'>Main Contact</Typography>}
                        {item.main && item.jobTitle && ' ・ '}
                        {item.jobTitle ?? ''}
                      </TableCell>
                      <TableCell>{mainNumber && <Phone number={mainNumber} />}</TableCell>
                      <TableCell>{item.email}</TableCell>
                    </TableRow>
                    {!index && <Divider colSpan={7} />}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CustomerStyles.ScrollContainer>
      </CustomerStyles.PageContainer>
    </CustomerPortalLayout>
  );
};

export default observer(UserContacts);
