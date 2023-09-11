/* eslint-disable complexity */ // disabled because it will need a huge refactor
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Checkbox,
  IAutocompleteConfig,
  ISelectOption,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import { FieldArray, FormikHelpers, getIn, useFormik } from 'formik';
import { noop, omit } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import * as Yup from 'yup';

import { GlobalService } from '@root/api';
import {
  AutocompleteTemplates,
  FormInput,
  MultiInput,
  QuickViewConfirmModal,
  QuickViewContent,
  Typography,
  useQuickViewContext,
} from '@root/common';
import { Divider } from '@root/common/TableTools';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { FormContainer, PhoneNumber, PhoneNumberAdd, PurchaseOrderSelect } from '@root/components';
// TODO: remove it after TextInput refactoring
import customerStyles from '@root/components/forms/NewCustomer/css/styles.scss';
import {
  addressTabShape,
  emailsTabShape,
  generalInformationCommercialTabShape,
  generalInformationNonCommercialTabShape,
  getValues,
  mainContactTabShape,
  paymentAndBillingTabShape,
} from '@root/components/forms/NewCustomer/formikData';
import GeneralInformationName from '@root/components/forms/NewCustomer/tabs/GeneralInformation/Name';
import { INewCustomerData } from '@root/components/forms/NewCustomer/types';
import { AutopayEnum, autopayOptions, billingCyclesOptions } from '@root/consts';
import { DEFAULT_ADDRESS } from '@root/consts/address';
import {
  aprTypeOptions,
  invoiceConstructionOptions,
  paymentTermsOptions,
} from '@root/consts/customer';
import { isCore } from '@root/consts/env';
import { formatCreditCard, normalizeOptions } from '@root/helpers';
import {
  useBusinessContext,
  useCrudPermissions,
  useFetchAndCreatePONumbers,
  useIsRecyclingFacilityBU,
  usePermission,
  useScrollOnError,
  useStores,
} from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import { CustomerGroupType } from '@root/types';
import { AddressSuggestion } from '@root/types/responseEntities';

const I18N_PATH = 'pages.CustomerSubscriptionDetails.components.Summary.Summary.Text.';

const MAX_PHONE_NUMBERS_COUNT = 5;

const CustomerProfileQuickViewContent: React.FC = () => {
  const { customerGroupStore, brokerStore, customerStore, userStore, creditCardStore, i18nStore } =
    useStores();
  const [canViewBrokers] = useCrudPermissions('configuration', 'brokers');
  const canSetCreditLimit = usePermission('customers:set-credit-limit:perform');
  const { t } = useTranslation();
  const { forceCloseQuickView, closeQuickView } = useQuickViewContext();
  const { businessUnitId } = useBusinessContext();
  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();
  const intl = useIntl();

  const customer = customerStore.selectedEntity;
  const customerGroups = customerGroupStore.sortedValues;
  const brokers = brokerStore.sortedValues;
  const isWalkUpCustomer = customer?.walkup;
  const creditCardValue = creditCardStore.values.find(elem => elem.isAutopay);
  const selectedCustomerCommercial = useMemo(() => customerStore.isCommercial, [customerStore]);

  const [commercialSchema, nonCommercialSchema] = useMemo(
    () => [
      Yup.object().shape({
        ...generalInformationCommercialTabShape(intl),
        ...mainContactTabShape(intl),
        ...paymentAndBillingTabShape,
        ...emailsTabShape,
        ...addressTabShape(intl),
      }),
      Yup.object().shape({
        ...generalInformationNonCommercialTabShape(intl),
        ...paymentAndBillingTabShape,
        ...emailsTabShape,
        ...addressTabShape(intl),
      }),
    ],
    [intl],
  );

  const [isCommercial, setIsCommercial] = useState<boolean>(true);

  const salesOptions = useMemo(
    () =>
      userStore.sortedValues
        .filter(user =>
          user.salesRepresentatives.some(salesRep => salesRep.businessUnitId === +businessUnitId),
        )
        .map(user => ({
          label: user.fullName,
          value: user.id,
        })),
    [businessUnitId, userStore.sortedValues],
  );

  const ownerOptions: ISelectOption[] = brokers.map(broker => ({
    label: broker.name,
    value: broker.id,
  }));

  useEffect(() => {
    userStore.cleanup();

    if (canViewBrokers && customer) {
      brokerStore.request({ activeOnly: true });
      creditCardStore.request({ customerId: customer.id, activeOnly: true });
    }

    userStore.requestSalesRepsByBU(+businessUnitId);
  }, [brokerStore, businessUnitId, canViewBrokers, userStore, creditCardStore, customer]);

  const customerGroupOptions: ISelectOption[] = customerGroups
    .filter(customerGroup => {
      if (isRecyclingFacilityBU) {
        return customerGroup.type === CustomerGroupType.commercial;
      }

      return !isWalkUpCustomer ? customerGroup.type !== CustomerGroupType.walkUp : true;
    })
    .map(customerGroup => ({
      label: customerGroup.description,
      value: customerGroup.id,
    }));

  const { purchaseOrderOptions, handleCreatePurchaseOrder } = useFetchAndCreatePONumbers({
    customerId: customer?.id,
    selectedPurchaseOrders: customer?.purchaseOrders ?? [],
  });

  useEffect(() => () => customerStore.toggleEditQuickView(false), [customerStore]);

  const creditCardOptions: ISelectOption[] = creditCardStore.values.map(creditCard => ({
    label: formatCreditCard(creditCard),
    value: creditCard.id,
  }));

  const handleFormikSubmitCallback = useCallback(
    async (values: INewCustomerData, formikHelpers: FormikHelpers<INewCustomerData>) => {
      const editedCustomer = {
        ...omit(values, 'purchaseOrders'),
        commercial: isCommercial,
        creditLimit: values.creditLimit ?? 0,
        defaultPurchaseOrders: values.defaultPurchaseOrders?.length
          ? values.defaultPurchaseOrders
          : null,
        billingAddress: values.billingAddress.billingAddressSameAsMailing
          ? values.mailingAddress
          : values.billingAddress,
        statementEmails: values.statementSameAsInvoiceEmails
          ? values.invoiceEmails
          : values.statementEmails,
        notificationEmails: values.notificationSameAsInvoiceEmails
          ? values.invoiceEmails
          : values.notificationEmails,
        workOrderNote: values.workOrderNote,
      };

      const phoneNumbers = selectedCustomerCommercial
        ? customer?.mainPhoneNumbers ?? []
        : customer?.phoneNumbers ?? values.phoneNumbers;
      const mainPhoneNumbers = selectedCustomerCommercial
        ? customer?.mainPhoneNumbers ?? []
        : values.phoneNumbers.filter(phoneNumber => phoneNumber.type === 'main');

      editedCustomer.mainPhoneNumbers = mainPhoneNumbers;
      editedCustomer.phoneNumbers = phoneNumbers;

      await customerStore.update(editedCustomer);

      if (customerStore.isPreconditionFailed && customerStore.selectedEntity) {
        formikHelpers.setValues(getValues(customerStore.selectedEntity));
      } else {
        forceCloseQuickView();
      }
    },
    [
      isCommercial,
      selectedCustomerCommercial,
      customer?.mainPhoneNumbers,
      customer?.phoneNumbers,
      customerStore,
      forceCloseQuickView,
    ],
  );

  const formik = useFormik({
    validationSchema: isCommercial ? commercialSchema : nonCommercialSchema,
    initialValues: getValues(customer ?? undefined),
    validateOnChange: false,
    initialErrors: {},
    onSubmit: handleFormikSubmitCallback,
    onReset: forceCloseQuickView,
  });

  const {
    values,
    errors,
    handleChange,
    setFieldValue,
    setFieldError,
    setFormikState,
    isValidating,
  } = formik;

  const phones = useMemo(() => {
    const result = values.phoneNumbers.slice();

    // main first
    result.sort(phone => (phone.type === 'main' ? -1 : 0));

    return result;
  }, [values.phoneNumbers]);

  const mainPhones = useMemo(() => {
    const result = values.mainPhoneNumbers?.slice() ?? [];

    // main first
    result.sort(phone => (phone.type === 'main' ? -1 : 0));

    return result;
  }, [values.mainPhoneNumbers]);

  useScrollOnError(errors, !isValidating);

  useEffect(() => {
    const { customerGroupId } = values;
    customerStore
      .checkCustomerGroupType(customerGroupId)
      .then(isCommercialFlag => setIsCommercial(isCommercialFlag));
  }, [customerStore, values]);

  useEffect(() => {
    if (isCore) {
      return;
    }
    if (values.isAutopayExist) {
      setFieldValue('autopayType', values.autopayType ?? AutopayEnum.invoiceDue);
    } else {
      setFieldValue('autopayType', undefined);
      setFieldValue('autopayCreditCardId', undefined);
      setFieldError('autopayType', undefined);
      setFieldError('autopayCreditCardId', undefined);
    }
  }, [values.isAutopayExist, setFieldValue, setFieldError, values.autopayType]);

  useEffect(() => {
    if (isCore) {
      return;
    }
    if (creditCardValue && values.isAutopayExist) {
      setFieldValue('autopayCreditCardId', creditCardValue.id);
    }
  }, [creditCardValue, setFieldValue, values.isAutopayExist]);

  const handleAprChange = useCallback(
    (name: string, value: string) => {
      setFieldValue('financeCharge', null);
      setFieldValue(name, value);
      setFieldError('financeCharge', undefined);
    },
    [setFieldError, setFieldValue],
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const field = e.target?.name ?? '';

      if (field === 'onAccount') {
        setFieldError('creditLimit', undefined);
        setFieldValue('creditLimit', undefined);
      } else if (field === 'isAutopayExist') {
        setFieldValue('autopayType', AutopayEnum.invoiceDue);
        setFieldError('creditLimit', undefined);
      } else {
        setFieldError('financeCharge', undefined);
        setFieldValue('aprType', aprTypeOptions[0]);
      }
      handleChange(e);
    },
    [handleChange, setFieldError, setFieldValue],
  );

  const handleStatementsSameAsInvoicesChange = useCallback(() => {
    setFormikState(state => ({
      ...state,
      errors: {
        ...state.errors,
        statementEmails: undefined,
      },
      values: {
        ...state.values,
        statementSameAsInvoiceEmails: !state.values.statementSameAsInvoiceEmails,
        statementEmails: [],
      },
    }));
  }, [setFormikState]);

  const handleNotificationSameAsInvoicesChange = useCallback(() => {
    setFormikState(state => ({
      ...state,
      errors: {
        ...state.errors,
        notificationEmails: undefined,
      },
      values: {
        ...state.values,
        notificationSameAsInvoiceEmails: !state.values.notificationSameAsInvoiceEmails,
        notificationEmails: [],
      },
    }));
  }, [setFormikState]);

  const handleBillingAddressSameAsMailingChange = useCallback(() => {
    setFormikState(state => ({
      ...state,
      values: {
        ...state.values,
        billingAddress: {
          ...DEFAULT_ADDRESS,
          billingAddressSameAsMailing: !state.values.billingAddress.billingAddressSameAsMailing,
          region: i18nStore.region,
        },
      },
    }));
  }, [i18nStore.region, setFormikState]);

  const handleAutocompleteSelect = useCallback(
    (suggestion: AddressSuggestion) => {
      setFormikState(state => ({
        ...state,
        values: {
          ...state.values,
          mailingAddress: {
            id: suggestion.id,
            addressLine1: suggestion.address ?? '',
            addressLine2: '',
            city: suggestion.city ?? '',
            zip: suggestion.zip ?? '',
            state: suggestion.state ?? '',
            region: i18nStore.region,
          },
        },
      }));
    },
    [i18nStore.region, setFormikState],
  );

  const addressAutocompleteConfigs: IAutocompleteConfig[] = useMemo(
    () => [
      {
        name: 'addresses',
        onSelect: handleAutocompleteSelect,
        template: <AutocompleteTemplates.Address />,
      },
    ],
    [handleAutocompleteSelect],
  );

  const handleGradingRequiredChange = useCallback(
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      setFieldValue('gradingRequired', checked);
      if (checked) {
        setFieldValue('gradingNotification', true);
      }
    },
    [setFieldValue],
  );

  if (!customer) {
    return null;
  }

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={
          <>
            <Layouts.Padding padding="3">
              <div className={tableQuickViewStyles.quickViewTitle}>{customer?.name}</div>
              <div className={tableQuickViewStyles.quickViewDescription}>
                {customer?.customerGroup?.description}・ID {customer?.id}
              </div>
            </Layouts.Padding>
            <Divider />
            <Layouts.Scroll>
              <Layouts.Padding padding="3">
                <Layouts.Padding bottom="3">
                  <Typography variant="headerThree">General Information</Typography>
                </Layouts.Padding>
                <Layouts.Flex>
                  <Layouts.Column>
                    <Select
                      disabled={isWalkUpCustomer}
                      label={`${t(`${I18N_PATH}CustomerGroup`)}*`}
                      name="customerGroupId"
                      options={customerGroupOptions}
                      value={values.customerGroupId}
                      error={errors.customerGroupId}
                      onSelectChange={setFieldValue}
                    />
                    <GeneralInformationName commercial={isCommercial} />
                    {!isWalkUpCustomer ? (
                      <>
                        <Select
                          label={t(`${I18N_PATH}Broker`)}
                          name="ownerId"
                          options={ownerOptions}
                          value={values.ownerId}
                          error={errors.ownerId}
                          onSelectChange={setFieldValue}
                        />
                        <FormInput
                          label={t(`${I18N_PATH}Email`)}
                          name="email"
                          type="email"
                          value={values.email}
                          error={errors.email}
                          onChange={handleChange}
                          disabled={!isCommercial ? values.customerPortalUser : undefined}
                        />
                      </>
                    ) : null}
                  </Layouts.Column>
                  {!isWalkUpCustomer ? (
                    <Layouts.Column>
                      <Layouts.Flex as={Layouts.Box} minHeight="88px" alignItems="center">
                        {!isRecyclingFacilityBU ? (
                          <Layouts.Column>
                            <Checkbox
                              id="signatureRequired"
                              name="signatureRequired"
                              value={values.signatureRequired}
                              error={errors.signatureRequired}
                              onChange={handleChange}
                            >
                              {t(`${I18N_PATH}RequireSignature`)}
                            </Checkbox>
                          </Layouts.Column>
                        ) : null}
                        <Layouts.Column>
                          <Checkbox
                            id="poRequired"
                            name="poRequired"
                            value={values.poRequired}
                            error={errors.poRequired}
                            onChange={handleChange}
                          >
                            {t(`${I18N_PATH}RequirePONumber`)}
                          </Checkbox>
                        </Layouts.Column>
                      </Layouts.Flex>
                      <PurchaseOrderSelect
                        isMulti
                        fullSizeModal
                        label={t(`${I18N_PATH}PONumber`)}
                        placeholder={t('Text.Select')}
                        name="defaultPurchaseOrders"
                        options={purchaseOrderOptions}
                        value={values.defaultPurchaseOrders ?? []}
                        error={errors.defaultPurchaseOrders}
                        onSelectChange={setFieldValue}
                        onCreatePurchaseOrder={handleCreatePurchaseOrder}
                      />
                      <FormInput
                        label={t(`${I18N_PATH}AlternateID`)}
                        name="alternateId"
                        value={values.alternateId ?? ''}
                        error={errors.alternateId}
                        onChange={handleChange}
                      />
                      <Select
                        label={t(`${I18N_PATH}SalesRep`)}
                        name="salesId"
                        options={salesOptions}
                        value={values.salesId}
                        error={errors.salesId}
                        onSelectChange={setFieldValue}
                      />
                    </Layouts.Column>
                  ) : null}
                </Layouts.Flex>
                {!isWalkUpCustomer ? (
                  <FieldArray name="phoneNumbers">
                    {({ push, remove }) => (
                      <>
                        {phones.map((phoneNumber, index) => (
                          <PhoneNumber
                            index={index}
                            key={index}
                            phoneNumber={phoneNumber}
                            parentFieldName="phoneNumbers"
                            errors={getIn(errors, 'phoneNumbers')}
                            onRemove={remove}
                            onChange={handleChange}
                            onNumberChange={setFieldValue}
                            showTextOnly
                          />
                        ))}
                        <Layouts.Padding top="1" bottom="3">
                          <Layouts.Flex>
                            {values.phoneNumbers.length < MAX_PHONE_NUMBERS_COUNT ? (
                              <PhoneNumberAdd index={values.phoneNumbers.length} push={push} />
                            ) : null}
                          </Layouts.Flex>
                        </Layouts.Padding>
                      </>
                    )}
                  </FieldArray>
                ) : null}
                <FormInput
                  label={t(`${I18N_PATH}GeneralNote`)}
                  placeholder={t(`${I18N_PATH}AddSomeNotesHere`)}
                  name="generalNote"
                  value={values.generalNote}
                  error={errors.generalNote}
                  onChange={handleChange}
                  className={customerStyles.textArea}
                  area
                />
                <FormInput
                  label={t(`${I18N_PATH}PopUpNote`)}
                  placeholder={t(`${I18N_PATH}AddSomeNotesHere`)}
                  name="popupNote"
                  value={values.popupNote}
                  error={errors.popupNote}
                  onChange={handleChange}
                  className={customerStyles.textArea}
                  area
                />
                {!isWalkUpCustomer ? (
                  <FormInput
                    label={t(`${I18N_PATH}BillingNote`)}
                    placeholder={t(`${I18N_PATH}AddSomeNotesHere`)}
                    name="billingNote"
                    value={values.billingNote}
                    error={errors.billingNote}
                    onChange={handleChange}
                    className={customerStyles.textArea}
                    area
                  />
                ) : null}
                <FormInput
                  label={t(`${I18N_PATH}WorkOrderNote`)}
                  placeholder={t(`${I18N_PATH}AddSomeNotesHere`)}
                  name="workOrderNote"
                  value={values.workOrderNote}
                  error={errors.workOrderNote}
                  onChange={handleChange}
                  className={customerStyles.textArea}
                  area
                />

                {isRecyclingFacilityBU ? (
                  <>
                    <Layouts.Padding bottom="3" top="1">
                      <Typography variant="headerThree">
                        {t(`${I18N_PATH}AdditionalPreferences`)}
                      </Typography>
                    </Layouts.Padding>
                    <Layouts.Flex>
                      <Layouts.Column>
                        {!isWalkUpCustomer ? (
                          <Layouts.Box minHeight="44px">
                            <Checkbox
                              id="workOrderRequired"
                              name="workOrderRequired"
                              value={values.workOrderRequired}
                              onChange={handleChange}
                            >
                              {t(`${I18N_PATH}WorkOrderRequired`)}
                            </Checkbox>
                          </Layouts.Box>
                        ) : null}
                        <Layouts.Box minHeight="44px">
                          <Checkbox
                            id="gradingRequired"
                            name="gradingRequired"
                            value={values.gradingRequired}
                            onChange={handleGradingRequiredChange}
                          >
                            {t(`${I18N_PATH}GradingRequired`)}
                          </Checkbox>
                        </Layouts.Box>
                        <Checkbox
                          id="gradingNotification"
                          name="gradingNotification"
                          value={values.gradingNotification}
                          onChange={handleChange}
                          disabled={values.gradingRequired}
                        >
                          {t(`${I18N_PATH}GradingNotification`)}
                        </Checkbox>
                      </Layouts.Column>
                      {!isWalkUpCustomer ? (
                        <Layouts.Column>
                          <Layouts.Box minHeight="44px">
                            <Checkbox
                              id="canTareWeightRequired"
                              name="canTareWeightRequired"
                              value={values.canTareWeightRequired}
                              onChange={handleChange}
                            >
                              {t(`${I18N_PATH}CanTareWeightRequired`)}
                            </Checkbox>
                          </Layouts.Box>
                          <Layouts.Box minHeight="44px">
                            <Checkbox
                              id="selfServiceOrderAllowed"
                              name="selfServiceOrderAllowed"
                              value={values.selfServiceOrderAllowed}
                              onChange={handleChange}
                            >
                              {t(`${I18N_PATH}SelfServiceOrderAllowed`)}
                            </Checkbox>
                          </Layouts.Box>
                          <Checkbox
                            id="jobSiteRequired"
                            name="jobSiteRequired"
                            value={values.jobSiteRequired}
                            onChange={handleChange}
                          >
                            {t(`${I18N_PATH}JobSiteRequired`)}
                          </Checkbox>
                        </Layouts.Column>
                      ) : null}
                    </Layouts.Flex>
                  </>
                ) : null}

                <Divider both />

                {!isWalkUpCustomer && isCommercial ? (
                  <>
                    <Layouts.Padding bottom="3" top="1">
                      <Typography variant="headerThree">Main contact</Typography>
                    </Layouts.Padding>
                    <Layouts.Flex>
                      <Layouts.Column>
                        <FormInput
                          label={`${t(`${I18N_PATH}FirstName`)}*`}
                          name="mainFirstName"
                          value={values.mainFirstName}
                          error={errors.mainFirstName}
                          onChange={handleChange}
                        />
                        <FormInput
                          label={`${t(`${I18N_PATH}LastName`)}*`}
                          name="mainLastName"
                          value={values.mainLastName}
                          error={errors.mainLastName}
                          onChange={handleChange}
                        />
                      </Layouts.Column>
                      <Layouts.Column>
                        <FormInput
                          label={t('Text.Title')}
                          name="mainJobTitle"
                          value={values.mainJobTitle ?? ''}
                          error={errors.mainJobTitle}
                          onChange={handleChange}
                        />

                        <FormInput
                          label={t(`Text.Email`)}
                          type="email"
                          name="mainEmail"
                          value={values.mainEmail}
                          error={errors.mainEmail}
                          disabled={!!customer.mainEmail}
                          onChange={handleChange}
                        />
                      </Layouts.Column>
                    </Layouts.Flex>
                    <FieldArray name="mainPhoneNumbers">
                      {({ push, remove }) => (
                        <>
                          {mainPhones.map((phoneNumber, index) => (
                            <PhoneNumber
                              index={index}
                              key={index}
                              phoneNumber={phoneNumber}
                              parentFieldName="mainPhoneNumbers"
                              errors={getIn(errors, 'mainPhoneNumbers')}
                              onRemove={remove}
                              onChange={handleChange}
                              onNumberChange={setFieldValue}
                              showTextOnly
                            />
                          ))}
                          <Layouts.Padding top="1" bottom="1">
                            <Layouts.Flex>
                              {values.mainPhoneNumbers &&
                              values.mainPhoneNumbers.length < MAX_PHONE_NUMBERS_COUNT ? (
                                <PhoneNumberAdd index={values.phoneNumbers.length} push={push} />
                              ) : null}
                            </Layouts.Flex>
                          </Layouts.Padding>
                        </>
                      )}
                    </FieldArray>
                    <Divider both />
                  </>
                ) : null}
                {!isWalkUpCustomer ? (
                  <>
                    <Layouts.Padding bottom="3" top="1">
                      <Typography variant="headerThree">Payments and Billing</Typography>
                    </Layouts.Padding>

                    <Typography variant="headerFour">Invoice</Typography>
                    <Layouts.Flex>
                      <Layouts.Column>
                        <Select
                          label="Invoice construction"
                          name="invoiceConstruction"
                          options={invoiceConstructionOptions}
                          value={values.invoiceConstruction}
                          error={errors.invoiceConstruction}
                          onSelectChange={setFieldValue}
                        />
                      </Layouts.Column>
                      <Layouts.Column>
                        <Layouts.Padding top="1" bottom="1">
                          <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                            Send Invoices and Statements by
                          </Typography>
                        </Layouts.Padding>
                        <Layouts.Flex>
                          <Layouts.Box height="40px">
                            <Layouts.Margin right="3">
                              <Checkbox
                                id="sendInvoicesByEmail"
                                name="sendInvoicesByEmail"
                                value={values.sendInvoicesByEmail}
                                error={errors.sendInvoicesByEmail}
                                onChange={handleCheckboxChange}
                              >
                                Email
                              </Checkbox>
                            </Layouts.Margin>
                          </Layouts.Box>
                          <Layouts.Box height="40px">
                            <Layouts.Margin right="3">
                              <Checkbox
                                id="sendInvoicesByPost"
                                name="sendInvoicesByPost"
                                value={values.sendInvoicesByPost}
                                error={errors.sendInvoicesByPost}
                                onChange={handleCheckboxChange}
                              >
                                {t(`${I18N_PATH}Mail`)}
                              </Checkbox>
                            </Layouts.Margin>
                          </Layouts.Box>
                        </Layouts.Flex>
                      </Layouts.Column>
                    </Layouts.Flex>
                    <Typography variant="headerFour">Payment</Typography>
                    <Layouts.Flex>
                      <Layouts.Column>
                        <Select
                          name="billingCycle"
                          label={t(`${I18N_PATH}DefaultBillingCycle`)}
                          options={normalizeOptions(billingCyclesOptions)}
                          value={values.billingCycle}
                          error={errors.billingCycle}
                          onSelectChange={setFieldValue}
                        />
                      </Layouts.Column>
                      <Layouts.Column />
                    </Layouts.Flex>
                    {!isCore ? (
                      <>
                        <Layouts.Box height="40px" width="175px">
                          <Checkbox
                            id="isAutopayExist"
                            name="isAutopayExist"
                            value={values.isAutopayExist}
                            onChange={handleChange}
                          >
                            {t(`${I18N_PATH}Autopay`)}
                          </Checkbox>
                        </Layouts.Box>
                        <Layouts.Flex>
                          <Layouts.Column>
                            <Select
                              name="autopayType"
                              label={t(`${I18N_PATH}AutopayType`)}
                              options={autopayOptions}
                              value={values.autopayType}
                              error={errors.autopayType}
                              disabled={!values.isAutopayExist}
                              onSelectChange={setFieldValue}
                            />
                          </Layouts.Column>
                          <Layouts.Column>
                            <Select
                              name="autopayCreditCardId"
                              label={t(`${I18N_PATH}AutopayCreditCard`)}
                              options={creditCardOptions}
                              value={values.autopayCreditCardId}
                              error={errors.autopayCreditCardId}
                              disabled={!values.isAutopayExist}
                              onSelectChange={setFieldValue}
                            />
                          </Layouts.Column>
                        </Layouts.Flex>
                      </>
                    ) : null}
                    <Layouts.Box height="40px" width="175px">
                      <Checkbox
                        id="onAccount"
                        name="onAccount"
                        value={values.onAccount}
                        error={errors.onAccount}
                        onChange={handleCheckboxChange}
                      >
                        {t(`${I18N_PATH}OnAccount`)}
                      </Checkbox>
                    </Layouts.Box>

                    <Layouts.Flex>
                      <Layouts.Column>
                        <Layouts.Flex>
                          <Layouts.Margin right="1">
                            <FormInput
                              label={t(`${I18N_PATH}CreditLimit`)}
                              readOnly={!values.onAccount}
                              name="creditLimit"
                              disabled={!canSetCreditLimit}
                              value={values.creditLimit}
                              error={errors.creditLimit}
                              onChange={handleChange}
                            />
                          </Layouts.Margin>
                          <Select
                            name="paymentTerms"
                            label={`${t(`${I18N_PATH}PaymentTerms`)}*`}
                            disabled={!values.onAccount}
                            options={paymentTermsOptions}
                            value={values.paymentTerms}
                            error={errors.paymentTerms}
                            onSelectChange={setFieldValue}
                          />
                        </Layouts.Flex>
                      </Layouts.Column>
                    </Layouts.Flex>
                    <Layouts.Box height="40px" width="175px">
                      <Checkbox
                        id="addFinanceCharges"
                        name="addFinanceCharges"
                        value={values.addFinanceCharges}
                        error={errors.addFinanceCharges}
                        onChange={handleCheckboxChange}
                      >
                        {t(`${I18N_PATH}AddFinanceCharges`)}
                      </Checkbox>
                    </Layouts.Box>
                    <Layouts.Flex>
                      {values.addFinanceCharges ? (
                        <>
                          <Layouts.Column>
                            <Layouts.Flex>
                              <Layouts.Column>
                                <Select
                                  name="aprType"
                                  label="APR*"
                                  disabled={!values.addFinanceCharges}
                                  options={normalizeOptions(aprTypeOptions)}
                                  value={values.aprType}
                                  error={errors.aprType}
                                  onSelectChange={handleAprChange}
                                />
                              </Layouts.Column>
                              <Layouts.Column>
                                {values.aprType === 'custom' ? (
                                  <FormInput
                                    label="Charge %*"
                                    name="financeCharge"
                                    readOnly={!values.addFinanceCharges}
                                    value={values.financeCharge ?? ''}
                                    error={errors.financeCharge}
                                    onChange={handleChange}
                                  />
                                ) : null}
                              </Layouts.Column>
                            </Layouts.Flex>
                          </Layouts.Column>
                          <Layouts.Column />
                        </>
                      ) : null}
                    </Layouts.Flex>
                    <Divider both />
                  </>
                ) : null}
                {!isWalkUpCustomer ? (
                  <>
                    <Layouts.Padding bottom="3" top="1">
                      <Typography variant="headerThree">Emails</Typography>
                    </Layouts.Padding>
                    <Typography variant="headerFour">Invoices email</Typography>
                    <Layouts.Margin bottom="1">
                      <MultiInput
                        id="invoiceEmails"
                        name="invoiceEmails"
                        label={t(`${I18N_PATH}InvoicesEmail`)}
                        values={values.invoiceEmails}
                        error={errors.invoiceEmails}
                        onChange={setFieldValue}
                      />
                      <Layouts.Flex>
                        <Layouts.Column>
                          <Layouts.Padding bottom="2">
                            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                              {t(`${I18N_PATH}AttachmentsForInvoices`)}
                            </Typography>
                          </Layouts.Padding>
                          <Layouts.Flex>
                            <Layouts.Column>
                              <Checkbox
                                id="attachTicketPref"
                                name="attachTicketPref"
                                value={values.attachTicketPref}
                                onChange={handleChange}
                              >
                                {t(`${I18N_PATH}WeightTicket`)}
                              </Checkbox>
                            </Layouts.Column>
                            <Layouts.Column>
                              <Checkbox
                                id="attachMediaPref"
                                name="attachMediaPref"
                                value={values.attachMediaPref}
                                onChange={handleChange}
                              >
                                {t(`${I18N_PATH}MediaFiles`)}
                              </Checkbox>
                            </Layouts.Column>
                          </Layouts.Flex>
                        </Layouts.Column>
                        <Layouts.Column />
                      </Layouts.Flex>
                    </Layouts.Margin>
                    <Layouts.Padding top="3" bottom="1">
                      <Typography variant="headerThree">Statements</Typography>
                    </Layouts.Padding>
                    <Layouts.Flex as={Layouts.Box} height="60px">
                      <Checkbox
                        id="statementSameAsInvoiceEmails"
                        name="statementSameAsInvoiceEmails"
                        value={values.statementSameAsInvoiceEmails}
                        onChange={handleStatementsSameAsInvoicesChange}
                      >
                        {t(`${I18N_PATH}SameAsInvoicesEmail`)}
                      </Checkbox>
                    </Layouts.Flex>
                    {!values.statementSameAsInvoiceEmails ? (
                      <MultiInput
                        id="statementEmails"
                        name="statementEmails"
                        label="Statements Email"
                        values={values.statementEmails}
                        error={errors.statementEmails}
                        onChange={setFieldValue}
                      />
                    ) : null}
                    <Layouts.Padding top="3" bottom="1">
                      <Typography variant="headerThree">
                        {t(`${I18N_PATH}Notifications`)}
                      </Typography>
                    </Layouts.Padding>
                    <Layouts.Flex as={Layouts.Box} height="60px">
                      <Checkbox
                        id="notificationSameAsInvoiceEmails"
                        name="notificationSameAsInvoiceEmails"
                        value={values.notificationSameAsInvoiceEmails}
                        onChange={handleNotificationSameAsInvoicesChange}
                      >
                        {t(`${I18N_PATH}SameAsInvoicesEmail`)}
                      </Checkbox>
                    </Layouts.Flex>
                    {!values.notificationSameAsInvoiceEmails ? (
                      <MultiInput
                        id="notificationEmails"
                        name="notificationEmails"
                        label={t(`${I18N_PATH}NotificationsEmail`)}
                        values={values.notificationEmails}
                        error={errors.notificationEmails}
                        onChange={setFieldValue}
                      />
                    ) : null}
                    <Divider both />
                  </>
                ) : null}
                {!isWalkUpCustomer ? (
                  <>
                    <Layouts.Padding bottom="3" top="1">
                      <Typography variant="headerThree">{t(`${I18N_PATH}Addresses`)}</Typography>
                    </Layouts.Padding>
                    <Typography variant="headerFour">{t(`${I18N_PATH}MailingAddress`)}</Typography>
                    <Layouts.Margin bottom="3">
                      <Autocomplete
                        label={t(`${I18N_PATH}SearchAddress`)}
                        name="searchString"
                        placeholder={t(`${I18N_PATH}EnterAddress`)}
                        search={values.searchString}
                        onSearchChange={setFieldValue}
                        onRequest={query =>
                          GlobalService.addressSuggestions(query, Number(businessUnitId))
                        }
                        configs={addressAutocompleteConfigs}
                        noErrorMessage
                      />
                    </Layouts.Margin>
                    <Layouts.Flex>
                      <Layouts.Column>
                        <FormInput
                          label={`${t(`Form.AddressLine`, { line: 1 })}*`}
                          name="mailingAddress.addressLine1"
                          value={values.mailingAddress.addressLine1}
                          error={errors.mailingAddress?.addressLine1}
                          onChange={handleChange}
                        />
                        <FormInput
                          label={`${t(`Form.City`)}*`}
                          name="mailingAddress.city"
                          value={values.mailingAddress.city}
                          error={errors.mailingAddress?.city}
                          onChange={handleChange}
                        />
                      </Layouts.Column>
                      <Layouts.Column>
                        <FormInput
                          label={t(`Form.AddressLine`, { line: 2 })}
                          name="mailingAddress.addressLine2"
                          value={values.mailingAddress.addressLine2 ?? ''}
                          error={errors.mailingAddress?.addressLine2}
                          onChange={handleChange}
                        />
                        <Layouts.Flex>
                          <Layouts.Column>
                            <FormInput
                              label={`${t(`Form.State`)}*`}
                              name="mailingAddress.state"
                              value={values.mailingAddress.state}
                              error={errors.mailingAddress?.state}
                              onChange={handleChange}
                            />
                          </Layouts.Column>
                          <Layouts.Column>
                            <FormInput
                              label={`${t(`Form.Zip`)}*`}
                              name="mailingAddress.zip"
                              value={values.mailingAddress.zip}
                              error={errors.mailingAddress?.zip}
                              onChange={handleChange}
                            />
                          </Layouts.Column>
                        </Layouts.Flex>
                      </Layouts.Column>
                    </Layouts.Flex>
                    <Typography variant="headerFour">{t(`${I18N_PATH}BillingAddress`)}</Typography>
                    <Layouts.Flex as={Layouts.Box} height="60px">
                      <Checkbox
                        id="billingAddressSameAsMailing"
                        name="billingAddress.billingAddressSameAsMailing"
                        value={values.billingAddress.billingAddressSameAsMailing}
                        error={errors.billingAddress?.billingAddressSameAsMailing}
                        onChange={handleBillingAddressSameAsMailingChange}
                      >
                        {t(`${I18N_PATH}BillingAddressTheSame`)}
                      </Checkbox>
                    </Layouts.Flex>
                    {!values.billingAddress.billingAddressSameAsMailing ? (
                      <Layouts.Flex>
                        <Layouts.Column>
                          <FormInput
                            label={`${t(`Form.AddressLine`, { line: 1 })}*`}
                            name="billingAddress.addressLine1"
                            value={values.billingAddress.addressLine1}
                            error={errors.billingAddress?.addressLine1}
                            onChange={handleChange}
                          />
                          <FormInput
                            label={`${t(`Form.City`)}*`}
                            name="billingAddress.city"
                            value={values.billingAddress.city}
                            error={errors.billingAddress?.city}
                            onChange={handleChange}
                          />
                        </Layouts.Column>
                        <Layouts.Column>
                          <FormInput
                            label={t(`Form.AddressLine`, { line: 2 })}
                            name="billingAddress.addressLine2"
                            value={values.billingAddress.addressLine2 ?? ''}
                            error={errors.billingAddress?.addressLine2}
                            onChange={handleChange}
                          />
                          <Layouts.Flex>
                            <Layouts.Column>
                              <FormInput
                                label={`${t(`Form.State`)}*`}
                                name="billingAddress.state"
                                value={values.billingAddress.state}
                                error={errors.billingAddress?.state}
                                onChange={handleChange}
                              />
                            </Layouts.Column>
                            <Layouts.Column>
                              <FormInput
                                label={`${t(`Form.Zip`)}*`}
                                name="billingAddress.zip"
                                value={values.billingAddress.zip}
                                error={errors.billingAddress?.zip}
                                onChange={handleChange}
                              />
                            </Layouts.Column>
                          </Layouts.Flex>
                        </Layouts.Column>
                      </Layouts.Flex>
                    ) : null}
                  </>
                ) : null}
              </Layouts.Padding>
            </Layouts.Scroll>
          </>
        }
        actionsElement={
          <ButtonContainer submitButtonType="submit" onCancel={closeQuickView} onSave={noop} />
        }
      />
    </FormContainer>
  );
};

export default observer(CustomerProfileQuickViewContent);
