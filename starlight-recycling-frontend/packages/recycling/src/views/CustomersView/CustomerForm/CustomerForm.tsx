import React, { FC, useCallback, useMemo, useState } from 'react';
import { Decorator } from 'final-form';
import { omit } from 'lodash-es';
import { AnyObject, validateFormValues, CloseConfirmationFormTracker } from '@starlightpro/common';
import { Trans, useTranslation } from '../../../i18n';
import cs from 'classnames';
import SwipeableViews from 'react-swipeable-views';
import createDecorator from 'final-form-calculate';

import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { AddressOption } from '../../../components/mapbox';
import SidebarForm from '../../../components/FinalForm/SidebarForm';
import TabPanel from '../../../components/TabPanel';

import { GeneralInfoForm, generalInfoSchema } from './GeneralInfoForm';
import { MainContactForm, mainContactSchema } from './MainContactForm';
import { PaymentsAndBillingForm, PaymentsAndBillingSchema } from './PaymentsAndBillingForm';
import { CustomerNotesForm, CustomerNotesSchema } from './CustomerNotesForm';
import { CustomerAddressesForm, CustomerAddressesSchema } from './CustomerAddressesForm';

import CustomerFormFooter from './CustomerFormFooter';
import { useRegion } from '../../../hooks/useRegion';
import { HaulingCustomerInput } from '../../../graphql/api';

export interface ValidationErrors extends AnyObject {}

const useStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      width: 740,
      minHeight: 800,
    },
    tabRoot: {
      minWidth: '115px',
    },
    progressTabs: {
      borderBottom: 'none',
    },
    paper: {
      padding: theme.spacing(3, 2, 3, 3),
    },
    tabsRoot: {
      paddingBottom: 2,
    },
    tab: {
      position: 'relative',
      opacity: 1,
      '&::after': {
        content: "''",
        width: '100%',
        display: 'block',
        position: 'absolute',
        bottom: 0,
        height: 2,
        backgroundColor: theme.palette.primary.main,
      },
    },
    content: {
      width: '100%',
    },
  }),
  { name: 'CustomerForm' },
);

const footerActionTabProps = [
  {
    cancelText: <Trans>Cancel</Trans>,
    submitText: <Trans>Main Contact</Trans>,
    showSubmitIcon: true,
  },
  {
    submitText: <Trans>Payments and Billing</Trans>,
    showSubmitIcon: true,
    showBackIcon: true,
  },
  {
    submitText: <Trans>Addresses</Trans>,
    showSubmitIcon: true,
    showBackIcon: true,
  },
  {
    submitText: <Trans>Customer Notes</Trans>,
    showSubmitIcon: true,
    showBackIcon: true,
  },
  {
    showBackIcon: true,
  },
];

export const customerFieldsDecorator = createDecorator(
  {
    field: 'sameAsMainContact', // when changes
    updates: {
      emailForInvoices: (sameAsMainContact: boolean, values): string | null | undefined => {
        const { mainContact, emailForInvoices } = values as HaulingCustomerInput;

        if (sameAsMainContact) {
          return mainContact.email;
        }

        return emailForInvoices;
      },
    },
  },
  {
    field: 'mailingAddressSearch', // when changes
    updates: {
      mailingAddress: (addressSearch: AddressOption, allValues: any) => {
        if (!addressSearch) {
          return allValues.mailingAddress;
        }

        return {
          addressLine1: addressSearch?.address,
          addressLine2: addressSearch?.address2,
          city: addressSearch?.city,
          state: addressSearch?.state,
          zip: addressSearch?.postcode,
        };
      },
    },
  },
  {
    field: 'billingAddressSearch', // when changes
    updates: {
      billingAddress: (addressSearch: AddressOption, allValues: any, prevValues: any) => {
        if (!prevValues?.billingAddressSearch && Object.keys(allValues.billingAddress).length > 0) {
          return allValues.billingAddress;
        }

        return {
          addressLine1: addressSearch?.address,
          addressLine2: addressSearch?.address2,
          city: addressSearch?.city,
          state: addressSearch?.state,
          zip: addressSearch?.postcode,
        };
      },
    },
  },
  {
    field: 'mainContact.email', // when changes
    updates: {
      emailForInvoices: (contactEmail: string, values): string | null | undefined => {
        const { emailForInvoices, sameAsMainContact } = values as any;

        if (sameAsMainContact) {
          return contactEmail;
        }

        return emailForInvoices;
      },
    },
  },
  {
    field: 'billingSameAsMailing',
    updates: {
      billingAddress: (billingSameAsMailing, values: any) => {
        if (billingSameAsMailing) {
          return values.mailingAddress;
        }

        return values.billingAddress;
      },
    },
  },
  {
    field: 'requireGrading',
    updates: {
      gradingNotification: (requireGrading, allValues: any) => {
        if (requireGrading) {
          return true;
        }

        return allValues.gradingNotification;
      },
    },
  },
) as Decorator<HaulingCustomerInput>;

export interface CustomerFormProps {
  initialValues: HaulingCustomerInput;
  onSubmitted?(): void;
  onSubmit(customerInput: HaulingCustomerInput): Promise<any>;
  onCancel(): void;
}

export const CustomerForm: FC<CustomerFormProps> = ({
  onSubmit,
  onSubmitted,
  onCancel,
  initialValues,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [t] = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const region = useRegion();
  const tabsSchemas = useMemo(
    () => [
      generalInfoSchema(region),
      mainContactSchema(region),
      PaymentsAndBillingSchema,
      CustomerAddressesSchema,
      CustomerNotesSchema,
    ],
    [region],
  );

  const onFormValidate = useCallback(
    async (values: HaulingCustomerInput): Promise<ValidationErrors> => {
      const schema = tabsSchemas[activeTab];

      return validateFormValues(values, schema);
    },
    [activeTab, tabsSchemas],
  );
  const onFormSubmit = useCallback(
    async (values: HaulingCustomerInput) => {
      if (activeTab !== tabsSchemas.length - 1) {
        // is not last page
        setActiveTab(activeTab + 1);

        return false; // submit is not final
      }

      return onSubmit(
        omit(
          // remove inner form fields
          values,
          ['sameAsMainContact', 'billingAddressSearch', 'mailingAddressSearch'],
        ) as HaulingCustomerInput,
      );
    },
    [activeTab, onSubmit, tabsSchemas.length],
  );
  const onTabsChange = useCallback((_, tab) => setActiveTab(tab), [setActiveTab]);
  const onBack = useCallback(() => setActiveTab(activeTab - 1), [activeTab]);

  const footerActions = useMemo(
    () => (
      <CustomerFormFooter
        onCancel={activeTab === 0 ? onCancel : onBack}
        {...footerActionTabProps[activeTab]}
      />
    ),
    [activeTab, onBack, onCancel],
  );

  return (
    <SidebarForm
      classes={{ paper: classes.root }}
      initialValues={initialValues}
      noHeaderDivider
      validate={onFormValidate as any}
      onSubmit={onFormSubmit}
      onSubmitted={onSubmitted}
      onCancel={onCancel}
      subscription={{}}
      decorators={[customerFieldsDecorator] as any}
      noActions
      title={t('Create New Customer')}
      footerActions={footerActions}
    >
      <CloseConfirmationFormTracker />
      <Tabs
        indicatorColor="primary"
        value={activeTab}
        onChange={onTabsChange}
        aria-label="tabs"
        classes={{ root: classes.tabsRoot, flexContainer: classes.progressTabs }}
      >
        <Tab
          classes={{ root: classes.tabRoot }}
          className={cs({ [classes.tab]: activeTab >= 0 })}
          label={t('General Information')}
          id="general-tab"
        />
        <Tab
          classes={{ root: classes.tabRoot }}
          className={cs({ [classes.tab]: activeTab >= 1 })}
          label={t('Main Contact')}
          id="main-contact-tab"
          disabled={activeTab < 1}
        />
        <Tab
          classes={{ root: classes.tabRoot }}
          className={cs({ [classes.tab]: activeTab >= 2 })}
          label={t('Payments and Billing')}
          id="payments-and-billing-tab"
          disabled={activeTab < 2}
        />
        <Tab
          classes={{ root: classes.tabRoot }}
          className={cs({ [classes.tab]: activeTab >= 3 })}
          label={t('Addresses')}
          id="addresses-tab"
          disabled={activeTab < 3}
        />
        <Tab
          classes={{ root: classes.tabRoot }}
          className={cs({ [classes.tab]: activeTab >= 4 })}
          label={t('Customer Notes')}
          id="customer-notes-tab"
          disabled={activeTab < 4}
        />
      </Tabs>

      <SwipeableViews
        className={classes.content}
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={activeTab}
        onChangeIndex={setActiveTab}
      >
        <TabPanel value={activeTab} index={0} dir={theme.direction}>
          <GeneralInfoForm create />
        </TabPanel>
        <TabPanel value={activeTab} index={1} dir={theme.direction}>
          <MainContactForm />
        </TabPanel>
        <TabPanel value={activeTab} index={2} dir={theme.direction}>
          <PaymentsAndBillingForm />
        </TabPanel>
        <TabPanel value={activeTab} index={3} dir={theme.direction}>
          <CustomerAddressesForm />
        </TabPanel>
        <TabPanel value={activeTab} index={4} dir={theme.direction}>
          <CustomerNotesForm />
        </TabPanel>
      </SwipeableViews>
    </SidebarForm>
  );
};
