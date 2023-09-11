/* eslint-disable no-negated-condition */
/* eslint-disable complexity */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop, omit, startCase } from 'lodash-es';

import { IInvoicesUnion, InvoicingData, InvoicingType, OrderService } from '@root/api';
import { CancelAltIcon, HelpIcon } from '@root/assets';
import { Tooltip, Typography } from '@root/common';
import { FormContainer } from '@root/components';
import { ConfirmModal, PopUpNoteModal } from '@root/components/modals';
import { handleEnterOrSpaceKeyDown, hasDataAttribute } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { type ICompany, type IOverlimitOrder, type IOverpaidOrder } from '@root/types';
import { useBoolean, usePrevious } from '@hooks';

import { areAllOrdersResolved, countInvoices, mapCustomerToNavItem } from '../../helpers';
import { ContentGrid, ContentWrapper, ScrollableFormWrapper } from '../../styles';
import {
  type FormikCustomerWithInvoiceDrafts,
  type FormikSubscriptionInvoiceDraft,
  type FormikOrderInvoiceDraft,
  GenerateInvoicingMode,
} from '../../types';
import { ActionButtonContainer } from '../ActionButtonContainer/ActionButtonContainer';
import { CreatePayment } from '../CreatePayment';
import { CreateRefund } from '../CreateRefund';
import {
  InvoiceDraftPanel,
  OverlimitPanel,
  OverpaidPanel,
  SubscriptionPanel,
  UnFinalizedOrdersPanel,
} from '../Panels';
import InvoicingSidebar from '../Sidebar/InvoicingSidebar';
import { type ExpandedOption } from '../types';

import { useOrderConfig } from './hooks/navigationConfig';
import { getValues } from './formikData';
import { CustomerSectionWrapper } from './styles';

import styles from './css/styles.scss';

type InvoiceListProps = {
  invoicingData: InvoicingData;
  currentCompany: ICompany;
  mode: GenerateInvoicingMode;
  onSave(customers: FormikCustomerWithInvoiceDrafts[], withOverride: boolean): void;
  onClose(): void;
  onCancelInvoicing(): void;
};

const I18NPath = 'pages.Invoices.RunInvoicingMenu.';

const InvoicesList: React.FC<InvoiceListProps> = ({
  invoicingData,
  currentCompany,
  onSave,
  mode,
  onClose,
  onCancelInvoicing,
}) => {
  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: getValues(invoicingData),
    onSubmit: noop,
  });
  const { values, setValues, setFieldValue } = formik;
  const { t } = useTranslation();

  const scrollableFormWrapper = useRef<HTMLDivElement>(null);

  const ignoreUnresolvedText = useMemo(
    () =>
      t(`${I18NPath}IgnoreUnresolvedText`, {
        entity: t(
          `${I18NPath}${
            mode === GenerateInvoicingMode.Orders ? 'Orders' : 'OrdersAndSubscriptions'
          }`,
        ),
      }),
    [mode, t],
  );

  const [currentCustomerNav, setCurrentCustomerNav] = useState<
    ReturnType<typeof mapCustomerToNavItem> | undefined
  >(() => mapCustomerToNavItem(values.onAccount[0] ?? values.prepaid[0], 0));
  const { formatCurrency } = useIntl();
  const navigationAnchor = useRef<HTMLDivElement>(null);

  const [expandedDraft, setExpandedDraft] = useState<ExpandedOption>(() => {
    if (Object.keys(currentCustomerNav?.customer.overlimitOrders ?? {}).length > 0) {
      return 'overlimit';
    } else if (Object.keys(currentCustomerNav?.customer.overpaidOrders ?? {}).length > 0) {
      return 'overpaid';
    } else if ((currentCustomerNav?.customer.unfinalizedOrders ?? []).length > 0) {
      return 'unFinalized';
    }

    return 0;
  });
  const [isCustomerPopupNoteOpen, showCustomerPopupNote, hideCustomerPopupNote] = useBoolean();

  const customer = currentCustomerNav?.customer;
  const prevCustomerId = usePrevious(customer?.id);
  const paymentMethod = customer?.onAccount ? 'onAccount' : 'prepaid';
  const orderQuickViewNavigationConfigs = useOrderConfig(
    customer?.drafts.orders.length ?? 0,
    customer?.drafts.subscriptions.length ?? 0,
    !isEmpty(customer?.unfinalizedOrders),
    !isEmpty(customer?.overpaidOrders) || !isEmpty(customer?.overlimitOrders),
  );

  const availableTab = useMemo(() => {
    return orderQuickViewNavigationConfigs[customer?.drafts.orders.length === 0 ? 1 : 0];
  }, [customer, orderQuickViewNavigationConfigs]);
  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<InvoicingType>>(availableTab);
  const [isConfirmUnresolvedModalOpen, openConfirmUnresolvedModal, closeConfirmUnresolvedModal] =
    useBoolean(false);

  // extend to array in case of new invoices types
  const unActiveTabKey: InvoicingType = useMemo(() => {
    return currentTab.key === InvoicingType.Orders
      ? InvoicingType.Subscriptions
      : InvoicingType.Orders;
  }, [currentTab.key]);

  const handleSaveInvoices = useCallback(() => {
    const allCustomers = values.prepaid.concat(values.onAccount);

    if (!areAllOrdersResolved(allCustomers)) {
      openConfirmUnresolvedModal();

      return;
    }

    onSave(allCustomers, false);
  }, [onSave, values.prepaid, values.onAccount, openConfirmUnresolvedModal]);

  const handleSaveWithOverride = useCallback(() => {
    closeConfirmUnresolvedModal();

    onSave(values.prepaid.concat(values.onAccount), true);
  }, [onSave, values.prepaid, values.onAccount, closeConfirmUnresolvedModal]);

  const isSendDisabled = countInvoices(values.prepaid) + countInvoices(values.onAccount) === 0;

  useEffect(() => {
    if (
      currentCustomerNav?.customer?.billingNote &&
      mode === GenerateInvoicingMode.OrdersAndSubscriptions
    ) {
      showCustomerPopupNote();
    }
  }, [showCustomerPopupNote, currentCustomerNav?.customer?.billingNote, mode]);
  const [isCreatingPayment, openCreatePaymentForm, closeCreatePaymentForm] = useBoolean(false);
  const [isCreatingRefund, openCreateRefundForm, closeCreateRefundForm] = useBoolean(false);

  const subscriptionTabIsActive: boolean = useMemo(() => {
    return currentTab.key === InvoicingType.Subscriptions;
  }, [currentTab]);

  const resetExpandedDraftOnSubscriptionsTab = useCallback(
    (customerNav: ReturnType<typeof mapCustomerToNavItem>) => {
      if (!isEmpty(customerNav?.customer.unfinalizedOrders)) {
        setExpandedDraft('unFinalized');
      } else {
        setExpandedDraft(0);
      }
    },
    [],
  );

  const resetExpandedDraftOnOrdersTab = useCallback(
    (customerNav: ReturnType<typeof mapCustomerToNavItem>) => {
      if (!isEmpty(customerNav.customer.overlimitOrders)) {
        setExpandedDraft('overlimit');
      } else if (!isEmpty(customerNav.customer.overpaidOrders)) {
        setExpandedDraft('overpaid');
      } else {
        setExpandedDraft(0);
      }
    },
    [],
  );

  const resetExpandedDraft = useCallback(
    (customerNav: ReturnType<typeof mapCustomerToNavItem>) => {
      if (!isEmpty(customerNav.customer.drafts.orders)) {
        resetExpandedDraftOnOrdersTab(customerNav);
      } else {
        resetExpandedDraftOnSubscriptionsTab(customerNav);
      }
    },
    [resetExpandedDraftOnOrdersTab, resetExpandedDraftOnSubscriptionsTab],
  );

  const onTabChange = useCallback(
    (tab: NavigationConfigItem<InvoicingType>) => {
      setCurrentTab(tab);
      if (currentCustomerNav) {
        if (tab.key === InvoicingType.Subscriptions) {
          resetExpandedDraftOnSubscriptionsTab(currentCustomerNav);
        } else {
          resetExpandedDraftOnOrdersTab(currentCustomerNav);
        }
      }
      if (scrollableFormWrapper?.current?.scrollTop) {
        scrollableFormWrapper.current.scrollTop = 0;
      }
    },
    [currentCustomerNav, resetExpandedDraftOnOrdersTab, resetExpandedDraftOnSubscriptionsTab],
  );

  const onCustomerChange = useCallback(
    (customerNav: ReturnType<typeof mapCustomerToNavItem>) => {
      closeCreatePaymentForm();
      closeCreateRefundForm();
      setCurrentCustomerNav(customerNav);
      resetExpandedDraft(customerNav);
      closeCreatePaymentForm();
    },
    [closeCreatePaymentForm, closeCreateRefundForm, resetExpandedDraft],
  );

  const handleRemoveCustomer = () => {
    setExpandedDraft(0);
    closeCreatePaymentForm();

    const allCustomersCount = values.onAccount.length + values.prepaid.length;

    if (customer && currentCustomerNav && allCustomersCount > 1) {
      const customers = [...values[paymentMethod]];
      const currentIndex = currentCustomerNav.index;

      customers.splice(currentIndex, 1);

      const nextCustomer = customers[currentCustomerNav.index];

      setCurrentCustomerNav(
        nextCustomer ? mapCustomerToNavItem(nextCustomer, currentIndex) : undefined,
      );

      setValues({
        ...values,
        [paymentMethod]: customers,
        invoicesTotal: values.invoicesTotal - customer.invoicesTotal,
        generatedInvoices: values.generatedInvoices - customer.invoicesCount,
        customersCount: values.customersCount - 1,
        processedOrders:
          values.processedOrders -
          customer.drafts.orders.reduce(
            (acc: number, draft: FormikOrderInvoiceDraft) => acc + draft.orders.length,
            0,
          ),
      });

      if (mode === GenerateInvoicingMode.OrdersAndSubscriptions) {
        setFieldValue(
          'processedSubscriptions',
          values.processedSubscriptions -
            customer.drafts.subscriptions.reduce(
              (acc: number, draft: FormikSubscriptionInvoiceDraft) =>
                acc + draft.subscriptions.length,
              0,
            ),
        );
      }
    }
  };

  const handleRemoveDraft = (
    draft: FormikOrderInvoiceDraft | FormikSubscriptionInvoiceDraft,
    index: number,
    entityKey: keyof IInvoicesUnion<unknown, unknown>,
  ) => {
    if (customer && currentCustomerNav) {
      const drafts = [...values[paymentMethod][currentCustomerNav.index].drafts[entityKey]];

      drafts.splice(index, 1);

      const noMoreDrafts =
        drafts.length === 0 &&
        values[paymentMethod][currentCustomerNav.index].drafts[unActiveTabKey].length === 0;

      if (noMoreDrafts) {
        handleRemoveCustomer();

        return;
      }

      const customers = [...values[paymentMethod]];
      const newValues = { ...values };

      const updatedCustomer = {
        ...customer,
        invoicesCount: customer.invoicesCount - 1,
        invoicesTotal: customer.invoicesTotal - draft.invoicesTotal,
      };

      customers[currentCustomerNav.index] = updatedCustomer;

      newValues[paymentMethod] = customers;
      newValues.generatedInvoices = newValues.generatedInvoices - 1;
      newValues.invoicesTotal = newValues.invoicesTotal - draft.invoicesTotal;
      if (entityKey === InvoicingType.Orders) {
        newValues.processedOrders =
          newValues.processedOrders - (draft as FormikOrderInvoiceDraft).orders.length;
      } else {
        newValues.processedSubscriptions =
          newValues.processedSubscriptions -
          (draft as FormikSubscriptionInvoiceDraft).subscriptions.length;
      }

      customers[currentCustomerNav.index].drafts = {
        ...customer.drafts,
        [entityKey]: drafts,
      };

      setValues(newValues);
      setCurrentCustomerNav({ ...currentCustomerNav, customer: updatedCustomer });

      if (index === expandedDraft) {
        setExpandedDraft(0);
      }
    }
  };

  const invoiceConstruction = useMemo(() => {
    return customer?.invoiceConstruction === 'byAddress'
      ? t(`${I18NPath}ByJobSite`)
      : // todo: remove after implementing `ByOrderAndSubscription` on backend
      mode === GenerateInvoicingMode.OrdersAndSubscriptions &&
        customer?.invoiceConstruction === 'byOrder'
      ? t(`${I18NPath}ByOrderAndSubscription`)
      : startCase(customer?.invoiceConstruction);
  }, [customer?.invoiceConstruction, mode, t]);

  const handleDraftToggle = (
    e: React.MouseEvent<HTMLElement>,
    expanded: boolean,
    identifier: ExpandedOption,
  ) => {
    if (hasDataAttribute(e, 'skipEvent')) {
      return;
    }

    if (!expanded) {
      setExpandedDraft(identifier);
    }
  };

  const handlePaymentCreated = (orderIds: number[]) => {
    if (!customer || !currentCustomerNav) {
      return;
    }

    const newCustomer = {
      ...values[paymentMethod][currentCustomerNav.index],
      overlimitOrders: omit(customer.overlimitOrders, orderIds) as Record<string, IOverlimitOrder>,
    };
    const newValues = {
      ...values,
      [paymentMethod]: values[paymentMethod].map(cust =>
        cust.id !== newCustomer.id ? cust : newCustomer,
      ),
    };

    setCurrentCustomerNav(mapCustomerToNavItem(newCustomer, currentCustomerNav.index));
    setValues(newValues);
    closeCreatePaymentForm();
  };

  const handleIgnoreUnFinalizedOrder = () => {
    if (!currentCustomerNav || !customer) {
      return;
    }

    const customers = [...values[paymentMethod]];

    const updatedCustomer: FormikCustomerWithInvoiceDrafts = {
      ...customer,
      unfinalizedOrders: [],
    };

    customers[currentCustomerNav.index] = updatedCustomer;

    setFieldValue(paymentMethod, customers);

    const customerNav = { ...currentCustomerNav, customer: updatedCustomer };

    setCurrentCustomerNav(customerNav);
    setExpandedDraft(0);
  };

  const handlePutOnAccount = async (overrideCreditLimit: boolean) => {
    if (!customer || !currentCustomerNav) {
      return;
    }

    await OrderService.putOrdersOnAccount(
      Object.keys(customer.overlimitOrders).map(key => Number(key)),
      overrideCreditLimit,
    );

    const newCustomer = {
      ...values[paymentMethod][currentCustomerNav.index],
      overlimitOrders: {},
    };
    const newValues = {
      ...values,
      [paymentMethod]: values[paymentMethod].map(cust =>
        cust.id !== newCustomer.id ? cust : newCustomer,
      ),
    };

    setCurrentCustomerNav(mapCustomerToNavItem(newCustomer, currentCustomerNav.index));
    setValues(newValues);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      handleRemoveCustomer();
    }
  };

  const handleRefundCreated = (orderId: number, paymentId: number, amount: number) => {
    if (!customer || !currentCustomerNav) {
      return;
    }

    // close before removing overpaid data
    closeCreateRefundForm();

    const order = customer.overpaidOrders[orderId];

    const newCustomer = {
      ...values[paymentMethod][currentCustomerNav.index],
    };

    if (amount < order.overpaidAmount) {
      newCustomer.overpaidOrders[orderId].refundedAmount = +(
        newCustomer.overpaidOrders[orderId].refundedAmount + amount
      ).toFixed(2);

      newCustomer.overpaidOrders[orderId].overpaidAmount = +(
        newCustomer.overpaidOrders[orderId].overpaidAmount - amount
      ).toFixed(2);

      const paymentIndex = newCustomer.overpaidOrders[orderId].payments.findIndex(
        payment => payment.id === paymentId,
      );

      if (paymentIndex > -1) {
        newCustomer.overpaidOrders[orderId].payments[paymentIndex].refundedAmount = +(
          Number(newCustomer.overpaidOrders[orderId].payments[paymentIndex].refundedAmount ?? 0) +
          amount
        ).toFixed(2);

        newCustomer.overpaidOrders[orderId].payments[paymentIndex].amount = +(
          newCustomer.overpaidOrders[orderId].payments[paymentIndex].amount - amount
        ).toFixed(2);
      }
    } else if (amount === order.overpaidAmount) {
      newCustomer.overpaidOrders = omit(newCustomer.overpaidOrders, orderId) as Record<
        string,
        IOverpaidOrder
      >;
    }

    const newValues = {
      ...values,
      [paymentMethod]: values[paymentMethod].map(cust =>
        cust.id !== newCustomer.id ? cust : newCustomer,
      ),
    };

    setCurrentCustomerNav(mapCustomerToNavItem(newCustomer, currentCustomerNav.index));
    setValues(newValues);
  };

  useEffect(() => {
    if (customer?.drafts[currentTab.key].length === 0 || prevCustomerId !== customer?.id) {
      onTabChange(availableTab);
    }
  }, [
    availableTab,
    currentTab.key,
    customer?.drafts,
    customer?.id,
    onTabChange,
    prevCustomerId,
    unActiveTabKey,
  ]);

  const hasTabsLayout: boolean = useMemo(
    () => mode === GenerateInvoicingMode.OrdersAndSubscriptions,
    [mode],
  );
  let component: React.ReactElement | null = null;

  const subscriptionListComponent: React.ReactElement = (
    <>
      {currentCustomerNav && customer ? (
        <UnFinalizedOrdersPanel
          currentCustomer={customer}
          expanded={expandedDraft === 'unFinalized'}
          onIgnore={handleIgnoreUnFinalizedOrder}
          onToggle={handleDraftToggle}
        />
      ) : null}
      {customer?.drafts.subscriptions.map((draft, index) => (
        <SubscriptionPanel
          key={index}
          currentCustomer={customer}
          currentCompany={currentCompany}
          expanded={index === expandedDraft}
          draft={draft}
          path={`${paymentMethod}[${
            currentCustomerNav?.index ?? 0
          }].drafts.subscriptions[${index}]`}
          index={index}
          onToggle={handleDraftToggle}
          onDraftRemove={handleRemoveDraft}
        />
      ))}
    </>
  );

  const orderListComponent: React.ReactElement = (
    <>
      {currentCustomerNav && customer ? (
        <>
          <OverlimitPanel
            currentCustomer={customer}
            expanded={expandedDraft === 'overlimit'}
            onCreatePayment={openCreatePaymentForm}
            onPutOnAccount={handlePutOnAccount}
            onToggle={handleDraftToggle}
          />
          <OverpaidPanel
            currentCustomer={customer}
            onCreateRefund={openCreateRefundForm}
            expanded={expandedDraft === 'overpaid'}
            onToggle={handleDraftToggle}
          />
        </>
      ) : null}
      {customer?.drafts.orders.map((draft, index) => {
        return (
          <InvoiceDraftPanel
            key={index}
            currentCustomer={customer}
            currentCompany={currentCompany}
            expanded={index === expandedDraft}
            draft={draft}
            path={`${paymentMethod}[${currentCustomerNav?.index ?? 0}].drafts.orders[${index}]`}
            index={index}
            onToggle={handleDraftToggle}
            onDraftRemove={handleRemoveDraft}
          />
        );
      })}
    </>
  );

  if (
    (hasTabsLayout && currentTab.key === InvoicingType.Orders) ||
    (!hasTabsLayout && customer && customer.drafts.orders.length > 0)
  ) {
    component = orderListComponent;
  } else {
    component = subscriptionListComponent;
  }

  let content: React.ReactNode = null;

  if (isCreatingPayment && customer) {
    content = (
      <CreatePayment
        currentCustomer={customer}
        onPaymentCreated={handlePaymentCreated}
        onPaymentCanceled={closeCreatePaymentForm}
      />
    );
  } else if (isCreatingRefund && customer) {
    content = (
      <CreateRefund
        currentCustomer={customer}
        onRefundCreated={handleRefundCreated}
        onRefundCanceled={closeCreateRefundForm}
      />
    );
  } else if (customer) {
    content = (
      <>
        <Layouts.Flex justifyContent="space-between">
          <Typography color="secondary">
            {customer.customerGroup.description} - ID {customer.id}
          </Typography>
          <Typography color="information" as="span" cursor="pointer" onClick={handleRemoveCustomer}>
            <Layouts.Flex justifyContent="space-between">
              <CancelAltIcon
                role="button"
                tabIndex={0}
                aria-label={t('Text.Remove')}
                onKeyDown={handleKeyDown}
                className={styles.cancelIcon}
              />
              {t(`${I18NPath}RemoveCustomer`)}
            </Layouts.Flex>
          </Typography>
        </Layouts.Flex>
        <Layouts.Flex justifyContent="space-between" className={styles.header}>
          <h2 className={styles.heading}>{customer?.name ?? ''}</h2>
          <h2 className={styles.heading}>{formatCurrency(customer.invoicesTotal)}</h2>
        </Layouts.Flex>
        <Layouts.Flex justifyContent="space-between">
          <Layouts.Flex className={styles.customerPreferences} alignItems="center">
            <Typography color="secondary" variant="headerFive" className={styles.preference}>
              {customer.onAccount ? t(`${I18NPath}OnAccount`) : t(`${I18NPath}Prepaid`)}
            </Typography>
            <Typography color="secondary" variant="headerFive" className={styles.preference}>
              {invoiceConstruction}
            </Typography>
            {customer.autopayType ? (
              <Typography color="secondary" variant="headerFive" className={styles.preference}>
                {t(`${I18NPath}Autopay`)}
              </Typography>
            ) : null}
            {customer.billingCycle ? (
              <>
                <Typography color="secondary" variant="headerFive" className={styles.preference}>
                  {startCase(customer?.billingCycle)}
                </Typography>

                {subscriptionTabIsActive ? (
                  <Tooltip position="top" text={t(`${I18NPath}HelpText`)}>
                    <HelpIcon aria-label="help" width="16" height="16" />
                  </Tooltip>
                ) : null}
              </>
            ) : null}
          </Layouts.Flex>
          <Typography color="secondary">{t(`${I18NPath}InvoicesTotal`)}</Typography>
        </Layouts.Flex>
        <Typography color="secondary" className={styles.warningText} ref={navigationAnchor}>
          {mode === GenerateInvoicingMode.OrdersAndSubscriptions
            ? t(`${I18NPath}WarningTextOrdersAndSubscriptions`)
            : t(`${I18NPath}WarningText`)}
        </Typography>
        {currentCustomerNav && customer ? (
          <>
            {hasTabsLayout ? (
              <Layouts.Margin bottom="2">
                <Navigation
                  activeTab={currentTab}
                  configs={orderQuickViewNavigationConfigs}
                  onChange={onTabChange}
                  border
                  withEmpty
                />
              </Layouts.Margin>
            ) : null}
            <ScrollableFormWrapper ref={scrollableFormWrapper}>{component}</ScrollableFormWrapper>
          </>
        ) : null}
      </>
    );
  }

  const closeHandler = useMemo(() => {
    if (isCreatingPayment) {
      return closeCreatePaymentForm;
    } else if (isCreatingRefund) {
      return closeCreateRefundForm;
    }

    return onClose;
  }, [closeCreatePaymentForm, closeCreateRefundForm, isCreatingPayment, isCreatingRefund, onClose]);

  return (
    <FormContainer fullHeight formik={formik}>
      <ConfirmModal
        isOpen={isConfirmUnresolvedModalOpen}
        title={t(`${I18NPath}UnresolvedOrders`)}
        cancelButton={t(`${I18NPath}BackToDrafts`)}
        submitButton={t(`${I18NPath}IgnoreAndSendInvoices`)}
        subTitle={ignoreUnresolvedText}
        onCancel={closeConfirmUnresolvedModal}
        onSubmit={handleSaveWithOverride}
      />
      <PopUpNoteModal
        isOpen={isCustomerPopupNoteOpen}
        onClose={hideCustomerPopupNote}
        billingPopupNote={currentCustomerNav?.customer?.billingNote}
      />
      <ContentWrapper>
        <ContentGrid columns="1fr 3fr">
          <InvoicingSidebar
            currentCustomer={currentCustomerNav}
            onCustomerChange={onCustomerChange}
            onClose={closeHandler}
            mode={mode}
            backText={isCreatingPayment || isCreatingRefund ? 'Back to Invoicing' : undefined}
            {...values}
          />
          <CustomerSectionWrapper>{content}</CustomerSectionWrapper>
        </ContentGrid>
      </ContentWrapper>
      {!isCreatingPayment && !isCreatingRefund ? (
        <ActionButtonContainer>
          <Button onClick={onCancelInvoicing}>Cancel</Button>
          <Button onClick={handleSaveInvoices} variant="primary" disabled={isSendDisabled}>
            {t(`${I18NPath}SaveAndSend`)}
          </Button>
        </ActionButtonContainer>
      ) : null}
    </FormContainer>
  );
};

export default InvoicesList;
