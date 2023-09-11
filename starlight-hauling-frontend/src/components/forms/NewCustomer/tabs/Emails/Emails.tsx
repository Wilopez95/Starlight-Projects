import React, { useCallback } from 'react';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { MultiInput, Typography } from '@root/common';

import { INewCustomerData } from '../../types';

const EmailsTab: React.FC = () => {
  const { values, errors, handleChange, setFieldValue, setFormikState } =
    useFormikContext<INewCustomerData>();

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

  return (
    <Layouts.Flex flexGrow={1} direction="column">
      <Layouts.Padding left="5" right="5">
        <Layouts.Padding top="3" bottom="1">
          <Typography variant="headerThree">Invoices email</Typography>
        </Layouts.Padding>
        <Layouts.Margin bottom="1">
          <MultiInput
            id="invoiceEmails"
            name="invoiceEmails"
            label="Invoices Email*"
            values={values.invoiceEmails}
            error={errors.invoiceEmails}
            onChange={setFieldValue}
          />
          <Layouts.Flex>
            <Layouts.Column>
              <Layouts.Padding bottom="2">
                <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                  Attachments for invoices
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
                    Weight ticket
                  </Checkbox>
                </Layouts.Column>
                <Layouts.Column>
                  <Checkbox
                    id="attachMediaPref"
                    name="attachMediaPref"
                    value={values.attachMediaPref}
                    onChange={handleChange}
                  >
                    Media files
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
            Same as invoices email
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
          <Typography variant="headerThree">Notifications</Typography>
        </Layouts.Padding>
        <Layouts.Flex as={Layouts.Box} height="60px">
          <Checkbox
            id="notificationSameAsInvoiceEmails"
            name="notificationSameAsInvoiceEmails"
            value={values.notificationSameAsInvoiceEmails}
            onChange={handleNotificationSameAsInvoicesChange}
          >
            Same as invoices email
          </Checkbox>
        </Layouts.Flex>
        {!values.notificationSameAsInvoiceEmails ? (
          <MultiInput
            id="notificationEmails"
            name="notificationEmails"
            label="Notifications Email"
            values={values.notificationEmails}
            error={errors.notificationEmails}
            onChange={setFieldValue}
          />
        ) : null}
      </Layouts.Padding>
    </Layouts.Flex>
  );
};

export default EmailsTab;
