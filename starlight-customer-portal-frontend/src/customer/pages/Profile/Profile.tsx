import React, { useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/auth/components/Protected/Protected';
import { useStores } from '@root/core/hooks';
import { CustomerGroupType } from '@root/core/types';
import { CustomerPortalLayout } from '@root/customer/layouts';
import { CustomerNavigation } from '@root/customer/layouts/CustomerNavigation';
import {
  BalanceSection,
  GeneralInformationSection,
  MainContactSection,
} from '@root/customer/pages/Profile/sections';
import { CustomerProfileQuickView } from '@root/customer/quickViews';

const I18N_PATH = 'pages.Profile.';

const ProfilePage: React.FC = () => {
  const { customerStore } = useStores();
  const { t } = useTranslation();
  const handleEditCustomer = useCallback(() => {
    customerStore.toggleEditQuickView(true);
  }, [customerStore]);

  const customer = customerStore.selectedEntity;

  const navigationRef = useRef<HTMLDivElement>(null);

  const customerPhone =
    customer?.phoneNumbers.find((phone: { type: string }) => phone.type === 'main') ?? [];

  return (
    <CustomerPortalLayout>
      <CustomerNavigation ref={navigationRef} />
      <Helmet title={t('Titles.Profile')} />
      {customer && (
        <>
          <CustomerProfileQuickView
            store={customerStore}
            tableContainerRef={navigationRef}
            condition={customerStore.isOpenEditQuickView}
            shouldDeselect={false}
          />
          <Layouts.Scroll as={Typography} shade='dark'>
            <Layouts.Box backgroundColor='white' position='relative'>
              <Layouts.Padding padding='3'>
                <Layouts.Flex justifyContent='space-between'>
                  <Typography variant='headerThree' shade='dark'>
                    {t(`${I18N_PATH}title`)}
                  </Typography>
                  <Protected permissions='customer-portal:profile:update'>
                    <Button variant='primary' onClick={handleEditCustomer}>
                      {t(`${I18N_PATH}EditDetails`)}
                    </Button>
                  </Protected>
                </Layouts.Flex>
                <Layouts.Margin top='3'>
                  <Layouts.Grid columns='3fr 1fr'>
                    <Layouts.Cell area='1 / 2 / 5 / 3'>
                      <BalanceSection />
                    </Layouts.Cell>
                    <Layouts.Cell area='1 / 1 / 5 / 2'>
                      <Layouts.Padding right='3'>
                        <Layouts.Grid columns='150px auto'>
                          <GeneralInformationSection
                            name={customer.name}
                            email={customer.email}
                            phone={customerPhone?.number ?? ''}
                            billingAddress={customer.billingAddress}
                            mailingAddress={customer.mailingAddress}
                          />
                          <Layouts.Cell area='7 / 1 / 7 / 3'>
                            <Layouts.Margin top='3' bottom='3'>
                              <Layouts.Box borderColor='grey' borderShade='dark' />
                            </Layouts.Margin>
                          </Layouts.Cell>
                          {customer.customerGroup?.type === CustomerGroupType.commercial && (
                            <MainContactSection
                              name={customer.contactPerson ?? ''}
                              email={customer?.mainEmail}
                              phone={customer?.mainPhoneNumbers?.[0]?.number}
                            />
                          )}
                        </Layouts.Grid>
                      </Layouts.Padding>
                    </Layouts.Cell>
                  </Layouts.Grid>
                </Layouts.Margin>
              </Layouts.Padding>
            </Layouts.Box>
          </Layouts.Scroll>
        </>
      )}
    </CustomerPortalLayout>
  );
};

export default observer(ProfilePage);
