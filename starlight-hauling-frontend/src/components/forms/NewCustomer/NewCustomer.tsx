import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { useFormik, validateYupSchema, yupToFormErrors } from 'formik';
import { pick, pickBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography, UnsavedChangesModal } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import {
  useBusinessContext,
  useIsRecyclingFacilityBU,
  useScrollOnError,
  useStores,
} from '@root/hooks';
import { IntlConfig } from '@root/i18n/types';
import { useIntl } from '@root/i18n/useIntl';
import { CustomerGroupType } from '@root/types';

import { FormContainerLayout } from '../layout/FormContainer';
import { IForm } from '../types';

import { DuplicatedNotification } from './components';
import {
  addressTabSchema,
  emailsTabSchema,
  generalInformationCommercialTabSchema,
  generalInformationNonCommercialTabSchema,
  getValues,
  mainContactTabSchema,
  paymentAndBillingTabSchema,
} from './formikData';
import {
  AddressesTab,
  EmailsTab,
  GeneralInformationTab,
  MainContactTab,
  PaymentsAndBillingTab,
} from './tabs';
import { INewCustomerData } from './types';

const commercialNavigationItem: NavigationConfigItem[] = [
  { label: 'General Information', key: '0', index: 0 },
  { label: 'Main Contact', key: '1', index: 1 },
  { label: 'Payments and Billing', key: '2', index: 2 },
  { label: 'Emails', key: '3', index: 3 },
  { label: 'Addresses', key: '4', index: 4 },
];

const nonCommercialNavigationItem: NavigationConfigItem[] = [
  { label: 'General Information', key: '0', index: 0 },
  { label: 'Payments and Billing', key: '1', index: 1 },
  { label: 'Emails', key: '2', index: 2 },
  { label: 'Addresses', key: '3', index: 3 },
];

const commercialPanelItem = [
  GeneralInformationTab,
  MainContactTab,
  PaymentsAndBillingTab,
  EmailsTab,
  AddressesTab,
];

const nonCommercialPanelItem = [
  GeneralInformationTab,
  PaymentsAndBillingTab,
  EmailsTab,
  AddressesTab,
];

const commercialSchema = (intl: IntlConfig) => [
  generalInformationCommercialTabSchema(intl),
  mainContactTabSchema(intl),
  paymentAndBillingTabSchema,
  emailsTabSchema,
  addressTabSchema(intl),
];

const nonCommercialSchema = (intl: IntlConfig) => [
  generalInformationNonCommercialTabSchema(intl),
  paymentAndBillingTabSchema,
  emailsTabSchema,
  addressTabSchema(intl),
];

const validatedFields = [
  ['businessName', 'email', 'firstName', 'lastName', 'phoneNumbers'],
  ['mainFirstName', 'mainEmail', 'mainLastName', 'mainPhoneNumbers'],
];

const NewCustomerForm: React.FC<IForm<INewCustomerData>> = ({ onSubmit, onClose }) => {
  const { customerGroupStore, customerStore } = useStores();
  const { businessUnitId } = useBusinessContext();

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem>(commercialNavigationItem[0]);
  const [isLoading, setLoading] = useState(false);
  const intlConfig = useIntl();

  const handleSubmit = useCallback(
    (values: INewCustomerData, itemsThree: NavigationConfigItem[], index: number) => {
      if (index === itemsThree.length - 1) {
        const customerGroupType =
          customerGroupStore.getById(values.customerGroupId)?.type ?? CustomerGroupType.commercial;

        const commercial = customerGroupType === CustomerGroupType.commercial;

        const { purchaseOrders, defaultPurchaseOrders, ...data } = values;

        onSubmit({
          ...data,
          purchaseOrders: purchaseOrders?.length
            ? purchaseOrders.map(purchaseOrder => ({
                ...purchaseOrder,
                id: 0,
                isDefaultByCustomer: defaultPurchaseOrders?.some(id => id === purchaseOrder.id),
              }))
            : null,
          businessUnitId: Number(businessUnitId),
          commercial,
        });
      } else {
        setCurrentTab(itemsThree[index + 1]);
      }
    },
    [customerGroupStore, businessUnitId, onSubmit],
  );

  const handleReset = useCallback(
    (values: INewCustomerData | undefined) => {
      if (currentTab.index === 0) {
        onClose(values);
      } else {
        setCurrentTab({
          ...currentTab,
          index: currentTab.index - 1,
        });
      }
    },
    [currentTab, onClose],
  );

  useEffect(() => {
    customerGroupStore.request({
      activeOnly: true,
    });
  }, [customerGroupStore]);

  const formik = useFormik({
    validateOnChange: false,
    initialValues: getValues(),
    onSubmit: handleSubmit as never, // the functions types does not fit with the format type
    onReset: handleReset,
  });

  const { values, errors, isSubmitting, setErrors, isValidating, setFieldError } = formik;

  useScrollOnError(errors, !isValidating);

  const customerGroupType =
    customerGroupStore.getById(values.customerGroupId)?.type ?? CustomerGroupType.commercial;

  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  const commercial = isRecyclingFacilityBU || customerGroupType === CustomerGroupType.commercial;

  const navItems = commercial ? commercialNavigationItem : nonCommercialNavigationItem;
  const panelItems = commercial ? commercialPanelItem : nonCommercialPanelItem;
  const Component = panelItems[currentTab.index];

  const validateTab = useCallback(
    async (action: 'reset' | 'submit', index?: number) => {
      const currentIndex = index ?? currentTab.index;
      const schema = commercial ? commercialSchema(intlConfig) : nonCommercialSchema(intlConfig);

      try {
        if (action === 'submit') {
          setLoading(true);
          ['phoneNumber', 'mainPhoneNumbers'].forEach(field => setFieldError(field, ''));
          await validateYupSchema(values, schema[currentIndex]);

          const duplicateValidatedFields = pickBy(pick(values, validatedFields[currentIndex]));
          const duplicateValues = await customerStore.checkDuplicate({
            businessUnitId: +businessUnitId,
            ...duplicateValidatedFields,
          });

          if (duplicateValues) {
            const { duplicatedFields, duplicatedFieldName } = duplicateValues;

            Object.keys(duplicatedFields).forEach(field => {
              const formatFields = field === 'phoneNumbers' ? 'phoneNumber' : field;

              // ' ' - for highlight duplicated fields without any messages
              setFieldError(formatFields, ' ');
            });

            NotificationHelper.custom(
              'warn',
              <DuplicatedNotification duplicatedFields={duplicatedFieldName} />,
            );
          }
          handleSubmit(values, navItems, currentIndex);
        } else {
          handleReset(values);
        }
      } catch (error: unknown) {
        setErrors(yupToFormErrors(error));
      } finally {
        setLoading(false);
      }
    },
    [
      currentTab.index,
      commercial,
      intlConfig,
      values,
      customerStore,
      handleSubmit,
      navItems,
      setFieldError,
      handleReset,
      setErrors,
      businessUnitId,
    ],
  );

  const handleNavigationChange = useCallback(
    (tab: NavigationConfigItem) => {
      const index = tab.index;

      if (currentTab.index === index || index === navItems.length - 1) {
        return;
      }

      if (tab.index > currentTab.index) {
        validateTab('submit', currentTab.index);
      } else {
        validateTab('reset', currentTab.index);
      }
    },
    [currentTab.index, navItems.length, validateTab],
  );

  const validNavigationItems = useMemo(() => {
    return navItems.map(navItem => ({
      ...navItem,
      disabled: navItem.index > currentTab.index || currentTab.index - navItem.index > 1,
    }));
  }, [currentTab.index, navItems]);

  return (
    <FormContainerLayout formik={formik}>
      <UnsavedChangesModal dirty={formik.dirty} onSubmit={() => validateTab('submit')} />
      <Layouts.Flex direction="column">
        <Layouts.Padding top="3" bottom="3" right="5" left="5">
          <Typography variant="headerThree">Create New Customer</Typography>
        </Layouts.Padding>
        <Layouts.Padding left="5" right="5">
          <Navigation
            activeTab={currentTab}
            configs={validNavigationItems}
            onChange={handleNavigationChange}
            progressBar
            border
            withEmpty
          />
        </Layouts.Padding>
        <Layouts.Scroll maxHeight={685}>
          <Component commercial={commercial} />
        </Layouts.Scroll>
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button disabled={isSubmitting} onClick={() => validateTab('reset')}>
              {currentTab.index === 0 ? 'Cancel' : '← Back'}
            </Button>
            <Button
              onClick={() => validateTab('submit')}
              // TODO: fix it later, just adding submit type broke new customer creation flow
              // type='submit'
              loading={isSubmitting || customerStore.loading}
              variant="primary"
              disabled={isLoading}
            >
              {currentTab.index + 1 === navItems.length
                ? 'Create New Customer'
                : `${navItems[currentTab.index + 1].label as string} →`}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default observer(NewCustomerForm);
