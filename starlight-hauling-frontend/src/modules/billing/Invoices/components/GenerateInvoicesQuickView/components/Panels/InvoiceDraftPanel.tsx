import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';

import { InvoicingType } from '@root/api';
import { useIntl } from '@root/i18n/useIntl';

import { useToggle } from '@root/hooks';
import { CancelAltIcon, InvoicePreview } from '../../../../../../../assets';
import { Typography } from '../../../../../../../common';
import { addressFormatShort, handleEnterOrSpaceKeyDown } from '../../../../../../../helpers';
import { FormikInvoicingData, FormikOrderInvoiceDraft } from '../../types';
import InvoicePreviewModal from '../InvoicePreviewModal/InvoicePreviewModal';
import { DraftOrderTable } from '../OrderTables';

import { Content, Panel } from './styles';
import { IInvoiceDraftPanel } from './types';

const I18NPath = 'pages.Invoices.RunInvoicingMenu.';

const InvoiceDraftPanel: React.FC<IInvoiceDraftPanel<FormikOrderInvoiceDraft>> = ({
  expanded,
  currentCustomer,
  currentCompany,
  path,
  draft,
  index,
  onToggle,
  onDraftRemove,
}) => {
  const [isInvoicePreviewOpen, toggleInvoicePreview] = useToggle();
  const { values, handleChange } = useFormikContext<FormikInvoicingData>();
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onDraftRemove(draft, index, InvoicingType.Orders);
      }
    },
    [draft, index, onDraftRemove],
  );

  const hasOverlimitOrders = draft.orders.some(order => currentCustomer.overlimitOrders[order.id]);
  const hasOverpaidOrders = draft.orders.some(order => currentCustomer.overpaidOrders[order.id]);

  if (hasOverlimitOrders || hasOverpaidOrders) {
    return null;
  }

  const address =
    currentCustomer.invoiceConstruction === 'byCustomer'
      ? currentCustomer.billingAddress
      : draft.orders[0].jobSite.address;

  const orderTableProps = {
    currentCustomer,
    orders: draft.orders,
  };

  return (
    <Layouts.Margin bottom="2">
      <InvoicePreviewModal
        currentCustomer={currentCustomer}
        currentCompany={currentCompany}
        invoiceOrderDraft={draft}
        invoiceSubscriptionDraft={null}
        isOpen={isInvoicePreviewOpen}
        onClose={toggleInvoicePreview}
      />
      <Panel expanded={expanded} onClick={e => onToggle(e, expanded, index)}>
        <Layouts.Flex justifyContent="space-between">
          <Checkbox
            name={`${path}.attachTicketPref`}
            value={getIn(values, `${path}.attachTicketPref`)}
            onChange={handleChange}
          >
            {t(`${I18NPath}AttachWeightTicket`)}
          </Checkbox>
          <Checkbox
            name={`${path}.attachMediaPref`}
            value={getIn(values, `${path}.attachMediaPref`)}
            onChange={handleChange}
          >
            {t(`${I18NPath}AttachMediaFiles`)}
          </Checkbox>
          <Layouts.Flex justifyContent="space-between">
            <div data-skip-event onClick={toggleInvoicePreview}>
              <Layouts.Margin left="2">
                <Typography color="information" cursor="pointer">
                  <Layouts.Flex justifyContent="space-between">
                    <InvoicePreview />
                    <Layouts.Margin left="1">{t(`${I18NPath}PreviewInvoice`)}</Layouts.Margin>
                  </Layouts.Flex>
                </Typography>
              </Layouts.Margin>
            </div>
            <div data-skip-event onClick={() => onDraftRemove(draft, index, InvoicingType.Orders)}>
              <Layouts.Margin left="2">
                <Typography color="information" cursor="pointer">
                  <Layouts.Flex justifyContent="space-between">
                    <CancelAltIcon
                      role="button"
                      tabIndex={0}
                      aria-label={`${t('Text.Remove')} Draft`}
                      onKeyDown={handleKeyDown}
                    />
                    <Layouts.Margin left="1">{t(`${I18NPath}RemoveDraft`)}</Layouts.Margin>
                  </Layouts.Flex>
                </Typography>
              </Layouts.Margin>
            </div>
          </Layouts.Flex>
        </Layouts.Flex>
        <Layouts.Margin top="2" bottom="1">
          <Layouts.Flex justifyContent="space-between">
            <Typography fontWeight="bold" variant="bodyLarge">
              {addressFormatShort(address)}
            </Typography>
            <Typography fontWeight="bold" variant="bodyLarge">
              {formatCurrency(draft.invoicesTotal)}
            </Typography>
          </Layouts.Flex>
        </Layouts.Margin>
        <Layouts.Flex justifyContent="space-between">
          <Typography color="secondary">{`${address.city}, ${address.state}, ${address.zip}`}</Typography>
          <Typography color="secondary">{t(`${I18NPath}InvoicesTotal`)}</Typography>
        </Layouts.Flex>
      </Panel>
      {expanded ? (
        <Content>
          <DraftOrderTable {...orderTableProps} />
        </Content>
      ) : null}
    </Layouts.Margin>
  );
};

export default InvoiceDraftPanel;
