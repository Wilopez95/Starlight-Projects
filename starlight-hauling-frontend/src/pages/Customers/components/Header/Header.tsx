import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { PlusIcon } from '@root/assets';
import { Protected, Typography } from '@root/common';
import { IJobSiteData } from '@root/components/forms/JobSite/types';
import { INewCustomerData } from '@root/components/forms/NewCustomer/types';
import {
  CustomersOnHold,
  CustomersResume,
  JobSiteModal,
  NewCustomerModal,
} from '@root/components/modals';
import { CustomerStatus } from '@root/consts';
import { US_CENTROID } from '@root/consts/address';
import { ICustomersOnHold, ICustomersResume } from '@root/types';
import { useBoolean, useCrudPermissions, useStores, useToggle } from '@hooks';

import { ICustomerPageHeader } from '../../types';

import styles from '../../css/styles.scss';

const I18N_PATH = 'pages.Customers.CustomersPage.';

const CustomersHeader: React.FC<ICustomerPageHeader> = ({ businessUnitId, customerGroupId }) => {
  const { customerStore, jobSiteStore, commonStore } = useStores();
  const { t } = useTranslation();
  const [isBulkUpdateModalOpen, openBulkUpdateModal, closeBulkUpdateModal] = useBoolean(false);
  const [isCustomersResumeModalOpen, openCustomersResumeModal, closeCustomersResumeModal] =
    useBoolean(false);
  const [isJobSiteModalOpen, openJobSiteModal, closeJobSiteModal] = useBoolean();
  const [isNewCustomerModalOpen, toggleNewCustomerModalOpen] = useToggle();
  const [customerData, setCustomerData] = useState<INewCustomerData>();
  const [canViewCustomerGroups] = useCrudPermissions('configuration', 'customer-groups');

  const customer = customerStore.selectedEntity;
  const checkedCustomers = customerStore.checkedCustomers;
  const checkedCustomersCount = checkedCustomers.length;

  const handleUnCheckAll = useCallback(() => {
    customerStore.checkAll(false);
  }, [customerStore]);

  const handleNewCustomerFormSubmit = useCallback(
    async (data: INewCustomerData) => {
      const isCreated = await customerStore.create({
        ...data,
        creditLimit: data.creditLimit ?? 0,
        businessUnitId: +businessUnitId,
      });

      if (isCreated) {
        toggleNewCustomerModalOpen();
      }

      setCustomerData(data);
    },
    [customerStore, businessUnitId, toggleNewCustomerModalOpen],
  );

  const handleJobSiteFormSubmit = useCallback(
    (jobSite: IJobSiteData) => {
      if (customer) {
        jobSiteStore.create({ data: jobSite, linkTo: customer?.id }, false);
      }
      setCustomerData(undefined);
      closeJobSiteModal();
    },
    [closeJobSiteModal, customer, jobSiteStore],
  );

  const handleJobSiteModalCancel = useCallback(() => {
    setCustomerData(undefined);
    closeJobSiteModal();
  }, [closeJobSiteModal]);

  const handleCustomersBulkOnHoldFormSubmit = useCallback(
    async (data: ICustomersOnHold) => {
      const ids = checkedCustomers
        .filter(customerInfo => customerInfo.status === CustomerStatus.active)
        .map(({ id }) => id);

      closeBulkUpdateModal();
      handleUnCheckAll();
      await customerStore.bulkOnHold(ids, data);

      commonStore.clearLoadedForBusinessUnitId();
      await commonStore.requestNavigationCounts(businessUnitId, {
        withCustomerGroups: canViewCustomerGroups,
      });
    },
    [
      customerStore,
      commonStore,
      checkedCustomers,
      closeBulkUpdateModal,
      handleUnCheckAll,
      canViewCustomerGroups,
      businessUnitId,
    ],
  );

  const handleCustomersBulkResumeFormSubmit = useCallback(
    async (data: ICustomersResume) => {
      const ids = checkedCustomers
        .filter(customerInfo => customerInfo.status === CustomerStatus.onHold)
        .map(({ id }) => id);

      closeCustomersResumeModal();
      handleUnCheckAll();
      await customerStore.bulkResume(ids, data);
      commonStore.clearLoadedForBusinessUnitId();
      await commonStore.requestNavigationCounts(businessUnitId, {
        withCustomerGroups: canViewCustomerGroups,
      });
    },
    [
      customerStore,
      commonStore,
      checkedCustomers,
      closeCustomersResumeModal,
      handleUnCheckAll,
      canViewCustomerGroups,
      businessUnitId,
    ],
  );

  useEffect(() => {
    if (customer && customerData?.createAndLinkJobSite) {
      openJobSiteModal();
    }
  }, [customer, customerData?.createAndLinkJobSite, openJobSiteModal]);

  return (
    <>
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onFormSubmit={handleNewCustomerFormSubmit}
        onClose={toggleNewCustomerModalOpen}
        overlayClassName={styles.modalOverlay}
      />
      <JobSiteModal
        isOpen={isJobSiteModalOpen}
        onFormSubmit={handleJobSiteFormSubmit}
        onClose={handleJobSiteModalCancel}
        overlayClassName={styles.modalOverlay}
        jobSite={
          customerData
            ? {
                address: customerData.mailingAddress,
                searchString: customerData.searchString,
                location: customerData.location ?? US_CENTROID,
                alleyPlacement: false,
                cabOver: false,
              }
            : undefined
        }
      />
      <CustomersOnHold
        onFormSubmit={handleCustomersBulkOnHoldFormSubmit}
        onClose={closeBulkUpdateModal}
        isOpen={isBulkUpdateModalOpen}
      />
      <CustomersResume
        onFormSubmit={handleCustomersBulkResumeFormSubmit}
        onClose={closeCustomersResumeModal}
        isOpen={isCustomersResumeModalOpen}
      />
      <Layouts.Margin bottom="2">
        {checkedCustomersCount === 0 ? (
          <Layouts.Flex alignItems="center">
            <Typography as="h1" className={styles.headerTitle} variant="headerTwo">
              {t(`${I18N_PATH}AllCustomers`)}
            </Typography>
            {!customerStore.loading ? (
              <Typography variant="bodyMedium">
                {customerStore.values.length} of {customerStore.getSelectedTabSize(customerGroupId)}
              </Typography>
            ) : null}
            <Layouts.Margin left="auto">
              <Protected permissions="customers:create:perform">
                <Button variant="primary" onClick={toggleNewCustomerModalOpen} iconLeft={PlusIcon}>
                  {t(`${I18N_PATH}NewCustomer`)}
                </Button>
              </Protected>
            </Layouts.Margin>
          </Layouts.Flex>
        ) : (
          <Layouts.Flex alignItems="center">
            <Typography variant="headerTwo">
              {checkedCustomersCount} {t(`${I18N_PATH}CustomersSelected`)}
            </Typography>
            <Layouts.Margin left="auto">
              <Layouts.Flex alignItems="center">
                <Layouts.Margin left="2">
                  <Protected permissions="customers:hold:perform">
                    <Button
                      onClick={openCustomersResumeModal}
                      disabled={customerStore.disabledBulkUpdateButton(CustomerStatus.onHold)}
                    >
                      {t(`${I18N_PATH}ResumeSelected`)}
                    </Button>
                  </Protected>
                </Layouts.Margin>
                <Layouts.Margin left="2">
                  <Protected permissions="customers:hold:perform">
                    <Button
                      variant="primary"
                      onClick={openBulkUpdateModal}
                      disabled={customerStore.disabledBulkUpdateButton(CustomerStatus.active)}
                    >
                      {t(`${I18N_PATH}PutSelectedOnHold`)}
                    </Button>
                  </Protected>
                </Layouts.Margin>
              </Layouts.Flex>
            </Layouts.Margin>
          </Layouts.Flex>
        )}
      </Layouts.Margin>
    </>
  );
};

export default observer(CustomersHeader);
