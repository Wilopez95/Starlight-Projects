import React, { useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Button, Checkbox, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected, Typography } from '@root/common';
import { Table } from '@root/common/TableTools';
import {
  ConfirmModal,
  ResumeCustomerModal,
  SubscriptionOnHoldModal,
} from '@root/components/modals';
import { CustomerStatus, Paths } from '@root/consts';
import {
  useBoolean,
  useBusinessContext,
  useCrudPermissions,
  useIsRecyclingFacilityBU,
  usePermission,
  useStores,
  useToggle,
  useUserContext,
} from '@root/hooks';
import { CustomerExemptionsQuickView, CustomerProfileQuickView } from '@root/quickViews';
import { CustomerGroupType, ISubscriptionOnHoldDetails } from '@root/types';

import { CustomerNavigation } from '../Customer';
import { CustomerActions } from '../Customer/CustomerActions/CustomerActions';
import { ICustomerPageParams } from '../Customer/types';

import { pathToUrl } from '../../helpers';
import {
  AccountSection,
  AdditionalPreferencesSection,
  BalanceSection,
  CommentsSection,
  CustomerNotesSection,
  GeneralInformationSection,
  MainContactSection,
} from './sections';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.CustomerProfile.Profile.';

const CustomerProfilePage: React.FC = () => {
  const { businessUnitId } = useBusinessContext();
  const { customerStore, customerCommentStore, userStore, subscriptionStore, creditCardStore } =
    useStores();

  const { currentUser } = useUserContext();

  const [isExemptionsViewOpen, toggleExemptionsView] = useToggle();
  const [
    isNotifyMainContactAboutHold,
    toggleNotifyMainContactAboutHold,
    setNotifyMainContactAboutHold,
  ] = useToggle(true);
  const [isNotifySalesRepAboutHold, toggleNotifySalesRepAboutHold, setNotifySalesRepAboutHold] =
    useToggle(true);
  const [customerHasSubscription, toggleCustomerHasSubscription] = useToggle();
  const [isHoldCustomerModalOpen, openHoldCustomerModal, closeHoldCustomerModal] = useBoolean();
  const [isDeactivateCustomerModalOpen, openDeactivateCustomerModal, closeDeactivateCustomerModal] =
    useBoolean();
  const [isActivateCustomerModalOpen, openActivateCustomerModal, closeActivateCustomerModal] =
    useBoolean();
  const [isDeactivateFailureModalOpen, openDeactivateFailureModal, closeDeactivateFailureModal] =
    useBoolean();
  const { customerId } = useParams<ICustomerPageParams>();

  const { t } = useTranslation();
  const [isResumeCustomerModalOpen, openResumeCustomerModal, closeResumeCustomerModal] =
    useBoolean();

  const [canViewTaxDistricts] = useCrudPermissions('configuration', 'tax-districts');
  const canManageTaxExemptions = usePermission('customers:tax-exempts:perform');

  const canOpenExempts = canViewTaxDistricts && canManageTaxExemptions;

  const customer = customerStore.selectedEntity;
  const isCommercialCustomerGroup = customer?.customerGroup?.type === CustomerGroupType.commercial;

  useEffect(() => {
    customerStore.requestById(+customerId);
    if (!customerStore.isOpenEditQuickView) {
      creditCardStore.request({ customerId: +customerId, isAutopay: true });
    }
  }, [customerId, customerStore, creditCardStore, customerStore.isOpenEditQuickView]);
  useEffect(() => {
    if (customer) {
      (async () => {
        if (!currentUser?.id) {
          return;
        }

        userStore.requestSalesRepsByBU(+businessUnitId);
        await customerCommentStore.request(customer.id);

        const userIds = customerCommentStore.sortedValues
          .map(comment => comment.authorId)
          .concat(currentUser.id);

        userStore.requestByIds(userIds);
      })();
    }
  }, [businessUnitId, currentUser?.id, customer, customerCommentStore, userStore]);

  const handleEditCustomer = useCallback(() => {
    customerStore.toggleEditQuickView(true);
  }, [customerStore]);

  const handlePutOnHold = useCallback(async () => {
    if (customer) {
      await subscriptionStore.requestCustomerCount({
        businessUnitId,
        customerId: customer?.id.toString(),
      });
      if (subscriptionStore.allCustomerCounts?.active) {
        toggleCustomerHasSubscription();
      } else {
        customerStore.changeStatus({ id: customer.id, status: CustomerStatus.onHold });
        closeHoldCustomerModal();
      }
    }
  }, [
    customerStore,
    closeHoldCustomerModal,
    customer,
    toggleCustomerHasSubscription,
    subscriptionStore,
    businessUnitId,
  ]);

  const handleDeactivate = useCallback(async () => {
    if (customer) {
      await customerStore.changeStatus({ id: customer.id, status: CustomerStatus.inactive });
      closeDeactivateCustomerModal();

      if (customerStore.deactivateCustomerError) {
        openDeactivateFailureModal();
        customerStore.cleanDeactivateCustomerError();
      }
    }
  }, [customer, customerStore, closeDeactivateCustomerModal, openDeactivateFailureModal]);

  const handleCloseOnHold = () => {
    setNotifyMainContactAboutHold(true);
    setNotifySalesRepAboutHold(true);
    toggleCustomerHasSubscription();
    closeHoldCustomerModal();
  };

  const handleSubscriptionOnHold = (values: ISubscriptionOnHoldDetails) => {
    if (customer) {
      customerStore.changeStatus({
        id: customer.id,
        status: CustomerStatus.onHold,
        reason: values.reason,
        reasonDescription: values.reasonDescription,
        holdSubscriptionUntil: values.holdSubscriptionUntil,
        onHoldNotifySalesRep: isNotifySalesRepAboutHold,
        ...(isCommercialCustomerGroup && { onHoldNotifyMainContact: isNotifyMainContactAboutHold }),
      });
      handleCloseOnHold();
    }
  };

  const handleResume = useCallback(
    (shouldUnholdTemplates?: boolean) => {
      if (customer) {
        customerStore.changeStatus({
          id: customer.id,
          status: CustomerStatus.active,
          shouldUnholdTemplates,
        });
      }
      closeResumeCustomerModal();
      closeActivateCustomerModal();
    },
    [closeResumeCustomerModal, closeActivateCustomerModal, customer, customerStore],
  );

  const handleCloseConfirmModal = useCallback(() => {
    setNotifyMainContactAboutHold(true);
    setNotifySalesRepAboutHold(true);
    closeHoldCustomerModal();
  }, [setNotifyMainContactAboutHold, setNotifySalesRepAboutHold, closeHoldCustomerModal]);

  const customerPhone = customer?.phoneNumbers.find(phone => phone.type === 'main');

  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  if (!customer) {
    return null;
  }

  const isWalkUpCustomer = !!customer.walkup;

  const content = (
    <Layouts.Padding top="3">
      <Layouts.Grid columns={isCommercialCustomerGroup ? 2 : 1}>
        {isCommercialCustomerGroup ? (
          <Layouts.Cell>
            <Checkbox
              name="isNotifyMainContactAboutHold"
              onChange={toggleNotifyMainContactAboutHold}
              value={isNotifyMainContactAboutHold}
            >
              <Typography>{t(`${I18N_PATH}NotifyMainContact`)}</Typography>
            </Checkbox>
          </Layouts.Cell>
        ) : null}
        <Layouts.Cell>
          <Checkbox
            name="isNotifySalesRepAboutHold"
            onChange={toggleNotifySalesRepAboutHold}
            value={isNotifySalesRepAboutHold}
          >
            <Typography>{t(`${I18N_PATH}NotifySaleRep`)}</Typography>
          </Checkbox>
        </Layouts.Cell>
      </Layouts.Grid>
    </Layouts.Padding>
  );

  return (
    <>
      <Helmet title={t('Titles.CustomerProfile', { customerName: customer?.name ?? '' })} />
      <ConfirmModal
        isOpen={isDeactivateFailureModalOpen}
        cancelButton={t('Text.Close')}
        title={t(`${I18N_PATH}DeactivateCustomerFailure`)}
        subTitle={t(`${I18N_PATH}DeactivateCustomerFailureMessage`)}
        onCancel={closeDeactivateFailureModal}
      />
      <ConfirmModal
        isOpen={isDeactivateCustomerModalOpen}
        cancelButton={t('Text.Cancel')}
        submitButton={t(`${I18N_PATH}Deactivate`)}
        title={t(`${I18N_PATH}DeactivateCustomer`)}
        subTitle={t(`${I18N_PATH}DeactivateCustomerMessage`)}
        onCancel={closeDeactivateCustomerModal}
        onSubmit={handleDeactivate}
      />
      <ConfirmModal
        isOpen={isHoldCustomerModalOpen}
        cancelButton={t('Text.Cancel')}
        submitButton={t(`${I18N_PATH}PutOnHold`)}
        title={t(`${I18N_PATH}OnHoldCustomer`)}
        subTitle={t(`${I18N_PATH}OnHoldMessage`)}
        onCancel={handleCloseConfirmModal}
        onSubmit={handlePutOnHold}
        content={content}
      />
      <ConfirmModal
        isOpen={isActivateCustomerModalOpen}
        cancelButton={t('Text.Cancel')}
        submitButton={t(`${I18N_PATH}ActivateCustomer`)}
        title={t(`${I18N_PATH}ActivateCustomer`)}
        subTitle={t(`${I18N_PATH}ActivateMessage`)}
        onCancel={closeActivateCustomerModal}
        onSubmit={() => handleResume()}
      />
      <ResumeCustomerModal
        isOpen={isResumeCustomerModalOpen}
        onCancel={closeResumeCustomerModal}
        onSubmit={handleResume}
      />
      <SubscriptionOnHoldModal
        isOpen={customerHasSubscription}
        onClose={handleCloseOnHold}
        onFormSubmit={handleSubscriptionOnHold}
      />
      <CustomerProfileQuickView isOpen={customerStore.isOpenEditQuickView} />
      <CustomerExemptionsQuickView isOpen={isExemptionsViewOpen} onClose={toggleExemptionsView} />
      <CustomerNavigation />
      <Layouts.Scroll>
        <Layouts.Box backgroundColor="white">
          <div className={styles.profileWrapper}>
            <Layouts.Flex justifyContent="space-between" alignItems="center">
              <h2 className={styles.heading}>{t(`${I18N_PATH}CustomerProfile`)}</h2>
              <Protected permissions="orders:new-order:perform">
                <Button
                  variant="primary"
                  to={pathToUrl(`${Paths.RequestModule.Request}?customerId=${customerId}`, {
                    businessUnit: businessUnitId,
                  })}
                >
                  {t(`${I18N_PATH}CreateNewOrder`)}
                </Button>
              </Protected>
            </Layouts.Flex>
            <Layouts.Margin top="1">
              <Layouts.Grid columns="3fr 1fr">
                <Layouts.Cell area="1 / 2 / 5 / 3">
                  {!isWalkUpCustomer ? <BalanceSection /> : null}
                  <CommentsSection />
                </Layouts.Cell>
                <Layouts.Cell area="1 / 1 / 5 / 2">
                  <Typography
                    className={styles.sectionHeading}
                    variant="bodyLarge"
                    fontWeight="bold"
                  >
                    {t(`${I18N_PATH}GeneralInformation`)}
                  </Typography>
                  <Table className={styles.profileInfoTable}>
                    <tbody>
                      <GeneralInformationSection
                        name={customer.name}
                        email={customer.email}
                        phone={customerPhone?.number ?? ''}
                        customerGroup={customer.customerGroup?.description ?? ''}
                        poRequired={customer.poRequired}
                        signatureRequired={customer.signatureRequired}
                        billingAddress={customer.billingAddress}
                        mailingAddress={customer.mailingAddress}
                        isWalkUpCustomer={isWalkUpCustomer}
                        owner={customer.owner?.name}
                        salesRep={customer.salesRep?.fullName}
                        showSignatureRequired={!isRecyclingFacilityBU}
                        purchaseOrders={customer.purchaseOrders ?? []}
                        spUsed={customer.spUsed}
                      />
                      {customer.customerGroup?.type === CustomerGroupType.commercial ? (
                        <MainContactSection
                          name={customer.contactPerson ?? ''}
                          email={customer?.mainEmail}
                          phone={customer?.mainPhoneNumbers?.[0]?.number}
                        />
                      ) : null}
                      {!isWalkUpCustomer ? (
                        <AccountSection
                          onAccount={customer.onAccount}
                          billingCycle={customer.billingCycle}
                          paymentTerms={customer.paymentTerms}
                          invoiceConstruction={customer.invoiceConstruction}
                          financeCharge={customer.financeCharge}
                          invoiceEmails={customer.invoiceEmails}
                          statementEmails={customer.statementEmails}
                          notificationEmails={customer.notificationEmails}
                          sendInvoicesByPost={customer.sendInvoicesByPost}
                          sendInvoicesByEmail={customer.sendInvoicesByEmail}
                          autopayType={customer.autopayType}
                        />
                      ) : null}
                      {isRecyclingFacilityBU ? (
                        <AdditionalPreferencesSection
                          isWalkUpCustomer={isWalkUpCustomer}
                          workOrderRequired={customer.workOrderRequired}
                          jobSiteRequired={customer.jobSiteRequired}
                          canTareWeightRequired={customer.canTareWeightRequired}
                          gradingRequired={customer.gradingRequired}
                          gradingNotification={customer.gradingNotification}
                          selfServiceOrderAllowed={customer.selfServiceOrderAllowed}
                        />
                      ) : null}
                    </tbody>
                  </Table>
                  <CustomerNotesSection
                    isWalkUpCustomer={isWalkUpCustomer}
                    generalNote={customer.generalNote}
                    popupNote={customer.popupNote}
                    billingNote={customer.billingNote}
                    workOrderNote={customer.workOrderNote}
                  />
                </Layouts.Cell>
              </Layouts.Grid>
            </Layouts.Margin>
          </div>
        </Layouts.Box>
      </Layouts.Scroll>
      <CustomerActions>
        <Layouts.Flex justifyContent="flex-end">
          <Protected permissions="customers:hold:perform">
            <Button
              onClick={
                customer.status !== CustomerStatus.inactive
                  ? openDeactivateCustomerModal
                  : openActivateCustomerModal
              }
              variant={
                customer.status !== CustomerStatus.inactive ? 'converseAlert' : 'conversePrimary'
              }
            >
              {t(
                `${I18N_PATH}${
                  customer.status !== CustomerStatus.inactive ? 'Deactivate' : 'Activate'
                }`,
              )}
            </Button>
          </Protected>
          <Layouts.Margin left="2">
            <Protected permissions="customers:hold:perform">
              <Button
                onClick={
                  customer.status === CustomerStatus.onHold
                    ? openResumeCustomerModal
                    : openHoldCustomerModal
                }
                variant={
                  customer.status === CustomerStatus.onHold ? 'conversePrimary' : 'converseAlert'
                }
              >
                {t(
                  `${I18N_PATH}${
                    customer.status === CustomerStatus.onHold ? 'ResumeCustomer' : 'PutOnHold'
                  }`,
                )}
              </Button>
            </Protected>
          </Layouts.Margin>
          {canOpenExempts ? (
            <Layouts.Margin left="2">
              <Button onClick={toggleExemptionsView}>{t(`${I18N_PATH}TaxInfo`)}</Button>
            </Layouts.Margin>
          ) : null}
          <Protected permissions="customers:edit:perform">
            <Layouts.Margin left="2">
              <Button variant="primary" onClick={handleEditCustomer}>
                {t(`${I18N_PATH}EditCustomer`)}
              </Button>
            </Layouts.Margin>
          </Protected>
        </Layouts.Flex>
      </CustomerActions>
    </>
  );
};

export default observer(CustomerProfilePage);
