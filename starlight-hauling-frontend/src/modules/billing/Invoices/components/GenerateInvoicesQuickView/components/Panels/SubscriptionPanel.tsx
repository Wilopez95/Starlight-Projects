import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';

import { InvoicingType } from '@root/api';
import { useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { CancelAltIcon, InvoicePreview } from '../../../../../../../assets';
import { Typography } from '../../../../../../../common';
import { addressFormatShort } from '../../../../../../../helpers';
import { FormikInvoicingData, FormikSubscriptionInvoiceDraft } from '../../types';
import { DraftSubscriptionTable } from '../OrderTables';
import InvoicePreviewModal from '../InvoicePreviewModal/InvoicePreviewModal';

import { Content, Panel } from './styles';
import { IInvoiceDraftPanel, ISubscriptionAddress } from './types';

const I18NPath = 'pages.Invoices.RunInvoicingMenu.';

const SubscriptionPanel: React.FC<IInvoiceDraftPanel<FormikSubscriptionInvoiceDraft>> = ({
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
  const { i18nStore } = useStores();

  const address: ISubscriptionAddress =
    currentCustomer.invoiceConstruction === 'byCustomer'
      ? {
          addressLine1: currentCustomer.billingAddress.addressLine1 ?? '',
          addressLine2: currentCustomer.billingAddress.addressLine2 ?? '',
          state: currentCustomer.billingAddress.state ?? '',
          city: currentCustomer.billingAddress.city ?? '',
          zip: currentCustomer.billingAddress.zip ?? '',
          region: i18nStore.region,
        }
      : draft.subscriptions[0].jobSiteAddress;

  const subscriptionTableProps = {
    currentCustomer,
    subscriptions: draft.subscriptions,
  };

  return (
    <Layouts.Margin bottom="2">
      <InvoicePreviewModal
        currentCustomer={currentCustomer}
        currentCompany={currentCompany}
        invoiceOrderDraft={null}
        invoiceSubscriptionDraft={draft}
        isOpen={isInvoicePreviewOpen}
        onClose={toggleInvoicePreview}
      />
      <Panel expanded={expanded} onClick={e => onToggle(e, expanded, index)}>
        <Layouts.Flex justifyContent="space-between">
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
            <div
              data-skip-event
              onClick={() => onDraftRemove(draft, index, InvoicingType.Subscriptions)}
            >
              <Layouts.Margin left="2">
                <Typography color="information" cursor="pointer">
                  <Layouts.Flex justifyContent="space-between">
                    <CancelAltIcon />
                    <Layouts.Margin left="1">{t(`${I18NPath}RemoveDraft`)}</Layouts.Margin>
                  </Layouts.Flex>
                </Typography>
              </Layouts.Margin>
            </div>
          </Layouts.Flex>
        </Layouts.Flex>
        <Layouts.Margin bottom="1" top="2">
          <Layouts.Flex justifyContent="space-between">
            <Typography fontWeight="bold" variant="bodyLarge">
              {addressFormatShort(address)}
            </Typography>
            <Typography fontWeight="bold" variant="bodyLarge">
              {formatCurrency(draft.invoicesTotal)}
            </Typography>
          </Layouts.Flex>
        </Layouts.Margin>
        <Layouts.Flex as={Layouts.Margin} bottom="2" justifyContent="space-between">
          <Typography color="secondary">{`${address.city}, ${address.state}, ${address.zip}`}</Typography>
          <Typography color="secondary">{t(`${I18NPath}InvoicesTotal`)}</Typography>
        </Layouts.Flex>
      </Panel>
      {expanded ? (
        <Content>
          <DraftSubscriptionTable {...subscriptionTableProps} />
        </Content>
      ) : null}
    </Layouts.Margin>
  );
};

export default SubscriptionPanel;
