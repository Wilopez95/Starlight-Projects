import React, { FC } from 'react';
import { gql } from '@apollo/client';
import { omit, isString } from 'lodash-es';

import {
  InvoiceConstruction,
  AprType,
  BillingCycle,
  PaymentTerm,
  CustomerContactInput,
  ContactPhoneType,
  useCreateHaulingCustomerMutation,
  HaulingCustomerInput,
  HaulingCustomer,
} from '../../../graphql/api';

import { CustomerForm } from './CustomerForm';
import omitTypename from '../../../utils/omitTypename';
import { showError, showSuccess } from '@starlightpro/common';
import { Trans } from '../../../i18n';

const defaultValues = {
  active: true,
  businessName: '',
  groupId: 0,
  requirePONumber: false,
  requireWONumber: false,
  requireGrading: true,
  requireCanTareWeight: true,
  requireJobSite: false,
  allowSelfServiceOrders: false,
  gradingNotification: false,
  sendInvoiceByEmail: true,
  sendInvoiceByPost: false,
  phones: [
    {
      number: '',
      extension: '',
      type: ContactPhoneType.Main,
    },
  ],
  alternateID: '',
  onAccount: false,
  creditLimit: 0,
  billingCycle: BillingCycle.None,
  paymentTerm: PaymentTerm.None,
  apr: AprType.Standard,
  aprCharge: 0,
  invoiceConstruction: InvoiceConstruction.ByAddress,
  emailForInvoices: null,
  addFinancialCharges: true,
  generalNotes: '',
  popupNotes: '',
  billingSameAsMailing: true,
  billingAddress: {},
  mailingAddress: {},
  mainContact: {},
  taxExemptions: [],
};

export const mainContactInitial = {
  active: false,
  isMain: false,
  firstName: '',
  lastName: '',
  phones: [
    {
      number: '',
      extension: '',
      type: ContactPhoneType.Main,
    },
  ],
};

const initialValues = { ...defaultValues, mainContact: mainContactInitial };

export type TaxExemptionFormInput = {
  id?: number;
  selected?: boolean;
  taxDistrictId: number;
  auth: string;
  fileUrl?: string | null;
  customerJobSiteId?: number;
  customer?: HaulingCustomer;
};

export const ADD_CUSTOMER = gql`
  mutation AddCustomer($data: HaulingCustomerInput!) {
    createHaulingCustomer(data: $data) {
      id
    }
  }
`;

gql`
  mutation CreateHaulingCustomer($data: HaulingCustomerInput!) {
    createHaulingCustomer(data: $data) {
      id
    }
  }
`;

interface NewCustomerViewProps {
  onCancel: () => void;
  onSubmitted?: (values?: any, result?: any) => void;
}

export const NewCustomerFormView: FC<NewCustomerViewProps> = ({ onSubmitted, onCancel }) => {
  const [createHaulingCustomer] = useCreateHaulingCustomerMutation();

  const handleSubmit = async (customerInput: HaulingCustomerInput) => {
    const { email, creditLimit, aprCharge, mainContact, ...values } = omitTypename(customerInput);

    const customerData = {
      ...omit(values, 'taxExemptions'),
      email: email || null,
      creditLimit: isString(creditLimit) ? parseFloat(creditLimit) : creditLimit,
      aprCharge: isString(aprCharge) ? parseFloat(aprCharge) : aprCharge,
    };

    const mainContactData = {
      ...mainContact,
      active: true,
      isMain: true,
    };

    try {
      const { data } = await createHaulingCustomer({
        variables: {
          data: {
            ...customerData,
            mainContact: mainContactData as CustomerContactInput,
          } as HaulingCustomerInput,
        },
      });

      showSuccess(<Trans>Customer created successfully!</Trans>);

      return { ...customerData, id: data?.createHaulingCustomer.id };
    } catch (e) {
      showError(<Trans>Could not create Customer.</Trans>);
      throw e;
    }
  };

  return (
    <CustomerForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      onSubmitted={onSubmitted}
    />
  );
};

export default NewCustomerFormView;
