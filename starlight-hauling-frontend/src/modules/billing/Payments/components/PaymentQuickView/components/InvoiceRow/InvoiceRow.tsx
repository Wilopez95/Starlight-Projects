import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput, Tooltip } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';

import { Typography } from '@root/common';
import { TableCell, TableCheckboxCell, TableRow } from '@root/common/TableTools';
import { Paths, Routes } from '@root/consts';
import { getInvoiceStatus, pathToUrl } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { NewUnappliedPayment } from '@root/modules/billing/types';

import { getBadgeByStatus } from '../../../../../Invoices/helpers/getBadgeByStatus';

import { IInvoiceRow } from './types';

const I18N_PATH = 'modules.billing.Payments.components.PaymentQuickView.Text.';

export const InvoiceRow: React.FC<IInvoiceRow> = ({
  disabled,
  invoice,
  value,
  isEditable,
  isPrepay,
  businessUnitId,
  fieldName,
  newBalance = 0,
  isWriteOff = false,
}) => {
  const { formatDateTime, formatCurrency } = useIntl();
  const status = getInvoiceStatus(invoice);
  const badge = getBadgeByStatus(status);
  const { t } = useTranslation();
  const { errors, values, setFieldValue } = useFormikContext<NewUnappliedPayment>();

  const invoiceUrl = pathToUrl(Paths.BillingModule.Invoices, {
    businessUnit: businessUnitId,
    id: invoice.dueDate ? invoice.id : invoice.financeChargeId,
    subPath: invoice.dueDate ? Routes.Invoices : Routes.FinanceCharges,
  });

  const handleCheckBoxChange = useCallback(
    e => {
      const { name, checked } = e.target;

      const invoiceAmount = getIn(values, `${fieldName}.balance`);
      const appliedAmount =
        values.unappliedAmount && invoiceAmount <= values.unappliedAmount
          ? invoiceAmount
          : Number(values.unappliedAmount);
      const amount = isWriteOff ? invoiceAmount : appliedAmount;

      setFieldValue(name as string, checked);
      setFieldValue(`${fieldName}.amount`, checked ? amount : undefined);
    },
    [fieldName, isWriteOff, setFieldValue, values],
  );

  const handleAmountChange = useCallback(
    e => {
      const { name, value: ValueData } = e.target;

      const prevInvoiceAmount = getIn(values, name as string);
      const unappliedAmount = Number(values.unappliedAmount ?? 0) + Number(prevInvoiceAmount);
      const newValue = Number(ValueData) > unappliedAmount ? unappliedAmount : Number(ValueData);

      setFieldValue(name as string, newValue);

      setFieldValue('unappliedAmount', unappliedAmount - newValue);
    },
    [setFieldValue, values],
  );

  const input = (
    <FormInput
      type="number"
      ariaLabel={t(`${I18N_PATH}Amount`)}
      name={`${fieldName}.amount`}
      onChange={handleAmountChange}
      value={getIn(values, `${fieldName}.amount`)}
      disabled={!value || (disabled && !isEditable) || isWriteOff}
      noError
    />
  );

  return (
    <>
      <TableRow>
        <TableCheckboxCell
          onChange={handleCheckBoxChange}
          name={`${fieldName}.checked`}
          disabled={disabled}
          value={value}
          label={t(`${I18N_PATH}SelectInvoice`, {
            id: invoice.id,
          })}
        />
        <TableCell>{invoice.dueDate ? formatDateTime(invoice.dueDate).date : null}</TableCell>
        <TableCell to={invoiceUrl}>
          <Typography cursor="pointer" color="information">
            {invoice.dueDate ? invoice.id : invoice.financeChargeId}
          </Typography>
        </TableCell>
        <TableCell>{badge}</TableCell>
        <TableCell>{formatCurrency(invoice.total)}</TableCell>
        <TableCell>{formatCurrency(invoice.balance)}</TableCell>
        <TableCell>
          {/* Could be undefined on payment creation  */}
          {disabled && isEditable === false ? (
            <Tooltip
              position="top"
              text={t(
                `${I18N_PATH}${isPrepay ? 'PrepaymentWarning' : 'PrintedOntoStatementWarning'}`,
              )}
            >
              {input}
            </Tooltip>
          ) : (
            input
          )}
        </TableCell>
        <TableCell right>{formatCurrency(newBalance)}</TableCell>
      </TableRow>
      {getIn(errors, `${fieldName}.amount`) ? (
        <TableRow>
          <TableCell colSpan={8}>
            <Typography variant="bodySmall" color="alert">
              {getIn(errors, `${fieldName}.amount`)}
            </Typography>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
};
