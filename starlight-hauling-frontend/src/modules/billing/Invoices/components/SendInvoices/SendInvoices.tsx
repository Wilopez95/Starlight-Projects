import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Button,
  Checkbox,
  ISelectOption,
  ISelectOptionGroup,
  Layouts,
  MultiSelect,
  Select,
} from '@starlightpro/shared-components';
import { FormikHelpers, useFormik } from 'formik';
import { groupBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Modal, Typography } from '../../../../../common';
import { Divider } from '../../../../../common/TableTools';
import { FormContainerLayout } from '../../../../../components/forms/layout/FormContainer';
import { IFormModal } from '../../../../../components/modals/types';
import { useStores } from '../../../../../hooks';

import { generateValidationSchema, getValues } from './formikData';
import { type ISendInvoicesData } from './types';

import styles from './css/styles.scss';

const attachMediaOptions: ISelectOption[] = [
  { label: 'Include weight tickets only', value: 'ATTACH_TICKET' },
  { label: 'Include all media files', value: 'ATTACH_ALL_MEDIA' },
];

const SendInvoicesModal: React.FC<IFormModal<ISendInvoicesData>> = ({
  isOpen,
  onClose,
  onFormSubmit,
}) => {
  const { invoiceStore, customerStore, contactStore } = useStores();

  const selectedInvoices = invoiceStore.checkedInvoices;
  const contacts = contactStore.values;
  const maybeCustomerId = selectedInvoices[0]?.customer?.id;
  const singleCustomer = customerStore.getById(maybeCustomerId);

  const isSingleCustomer =
    Object.keys(groupBy(selectedInvoices, invoice => invoice.customer?.id)).length === 1;

  useEffect(() => {
    if (isSingleCustomer && maybeCustomerId) {
      customerStore.requestById(maybeCustomerId);
      contactStore.requestByCustomer({ customerId: maybeCustomerId });
    } else {
      contactStore.cleanup();
    }
  }, [contactStore, customerStore, isSingleCustomer, maybeCustomerId]);

  const handleSubmit = (values: ISendInvoicesData, helpers: FormikHelpers<ISendInvoicesData>) => {
    const { customerEmails } = values;

    const customerEmailsFiltered = customerEmails.filter(x => x !== 'sendToCustomerInvoiceEmails');

    const isCustomerEmails = customerEmailsFiltered.length !== customerEmails.length;

    onFormSubmit({
      ...values,
      customerEmails: customerEmailsFiltered,
      sendToCustomerInvoiceEmails: isCustomerEmails,
    });
    helpers.resetForm();
  };

  const formik = useFormik({
    validationSchema: generateValidationSchema(isSingleCustomer),
    initialValues: getValues(selectedInvoices.map(invoice => +invoice.id)),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: handleSubmit,
    onReset: onClose,
  });

  const { values, errors, handleChange, isSubmitting, setFieldValue } = formik;

  const emailOptions: ISelectOptionGroup[] = useMemo(() => {
    if (isSingleCustomer && singleCustomer) {
      const contactEmails: ISelectOption[] = contacts
        .filter(contact => contact.email)
        .map(contact => ({
          label: contact.email!,
          value: contact.email!,
          subTitle: `${contact?.name}${contact.main ? '・Main Contact' : ''}`,
        }));

      const customerEmails = singleCustomer?.invoiceEmails?.length ?? 0;

      const singleCustomerGroups: ISelectOptionGroup[] = [
        {
          label: 'Invoice Emails',
          options: [
            {
              label: 'Customer Invoice Emails',
              value: 'sendToCustomerInvoiceEmails',
              subTitle: `${customerEmails} emails`,
            },
          ],
        },
        {
          label: 'Customer Contacts',
          options: contactEmails,
        },
      ];

      return singleCustomerGroups;
    }

    return [
      {
        options: [
          {
            label: 'Multiple Customers',
            value: 'Multiple Customers',
          },
        ],
      },
    ];
  }, [contacts, isSingleCustomer, singleCustomer]);

  const handleToggleAttachMedia = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldValue('attachMedia', e.target.checked ? 'ATTACH_ALL_MEDIA' : undefined);

      handleChange(e);
    },
    [handleChange, setFieldValue],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <FormContainerLayout formik={formik}>
        <Layouts.Flex direction="column" justifyContent="space-between">
          <Layouts.Padding top="3" right="5" left="5" bottom="2">
            <Typography variant="headerThree">Send Selected Invoices</Typography>
          </Layouts.Padding>
          <Layouts.Flex direction="column" flexGrow={1}>
            <Layouts.Padding left="5" right="5">
              {isSingleCustomer ? (
                <MultiSelect
                  label="Select Email"
                  name="customerEmails"
                  options={emailOptions}
                  value={values.customerEmails}
                  onSelectChange={setFieldValue}
                  maxMenuHeight={202}
                  error={errors.customerEmails}
                />
              ) : (
                <Select
                  disabled
                  label="Select Email"
                  name="customerEmails"
                  options={emailOptions}
                  value="Multiple Customers"
                  onSelectChange={setFieldValue}
                />
              )}
              <Layouts.Margin bottom="1">
                <Checkbox
                  id="attachMediaEnabled"
                  name="attachMediaEnabled"
                  onChange={handleToggleAttachMedia}
                  value={values.attachMediaEnabled}
                >
                  Attach media files
                </Checkbox>
              </Layouts.Margin>
              {values.attachMediaEnabled ? (
                <Select
                  nonClearable
                  name="attachMedia"
                  ariaLabel="Attach media"
                  options={attachMediaOptions}
                  value={values.attachMedia}
                  onSelectChange={setFieldValue}
                />
              ) : null}
            </Layouts.Padding>
          </Layouts.Flex>
          <Divider />
          <Layouts.Padding padding="4" left="5" right="5">
            <Layouts.Flex justifyContent="space-between">
              <Button type="reset" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="success">
                Send Invoices
              </Button>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Flex>
      </FormContainerLayout>
    </Modal>
  );
};

export default observer(SendInvoicesModal);
