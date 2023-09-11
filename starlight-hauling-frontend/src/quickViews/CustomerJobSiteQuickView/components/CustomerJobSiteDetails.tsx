import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { DescriptiveTooltip, FormInput, MultiInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { PurchaseOrderSelect } from '@root/components';
import { useFetchAndCreatePONumbers, useIsRecyclingFacilityBU, useStores } from '@root/hooks';

import { ICustomerJobSiteSettings } from '../formikData';

const I18N_PATH = 'quickViews.CustomerJobSiteQuickView.components.CustomerJobSiteDetails.Text.';

const CustomerJobSiteDetails: React.FC = () => {
  const { values, errors, handleChange, setFieldValue } =
    useFormikContext<ICustomerJobSiteSettings>();
  const { t } = useTranslation();

  const { customerStore, jobSiteStore } = useStores();
  const selectedCustomer = customerStore.selectedEntity;
  const selectedJobSite = jobSiteStore.selectedEntity;

  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  const { purchaseOrderOptions, handleCreatePurchaseOrder } = useFetchAndCreatePONumbers({
    customerId: selectedCustomer?.id,
    selectedPurchaseOrders: values.details?.purchaseOrders ?? undefined,
  });

  return (
    <>
      <Layouts.Flex as={Layouts.Box} alignItems="center" width="30%" justifyContent="space-between">
        <Typography color="secondary" as="label" shade="desaturated" variant="bodyMedium">
          {t('Text.Status')}{' '}
          <DescriptiveTooltip text={t(`${I18N_PATH}DescriptiveTooltip`)} position="top" />
        </Typography>

        <Checkbox
          id="activeCheckbox"
          name="details.active"
          value={values.details?.active}
          onChange={handleChange}
        >
          {t('Text.Active')}
        </Checkbox>
      </Layouts.Flex>
      <Divider both />

      <Layouts.Padding top="1" bottom="2">
        <Typography variant="headerFour">{t(`${I18N_PATH}CustomerJobSiteDetails`)}</Typography>
      </Layouts.Padding>

      <FormInput
        label={t(`${I18N_PATH}PopUpNote`)}
        name="details.popupNote"
        key="popupNote"
        value={values.details?.popupNote ?? ''}
        error={getIn(errors, 'details.popupNote')}
        onChange={handleChange}
        area
      />

      <FormInput
        label={t(`${I18N_PATH}WorkOrderNotes`)}
        name="details.workOrderNotes"
        key="workOrderNotes"
        value={values.details?.workOrderNotes ?? ''}
        error={getIn(errors, 'details.workOrderNotes')}
        onChange={handleChange}
        area
      />

      <Layouts.Flex>
        <Layouts.Column>
          {!isRecyclingFacilityBU ? (
            <>
              <Layouts.Margin bottom="1">
                <Checkbox
                  id="permitRequired"
                  name="details.permitRequired"
                  value={values.details?.permitRequired ?? false}
                  error={getIn(errors, 'details.permitRequired')}
                  onChange={handleChange}
                >
                  {t(`${I18N_PATH}PermitRequired`)}
                </Checkbox>
              </Layouts.Margin>
              <Layouts.Margin bottom="1">
                <Checkbox
                  id="signatureRequired"
                  name="details.signatureRequired"
                  value={values.details?.signatureRequired ?? false}
                  error={getIn(errors, 'details.signatureRequired')}
                  onChange={selectedCustomer?.signatureRequired ? noop : handleChange}
                  disabled={!!selectedCustomer?.signatureRequired}
                >
                  {t(`${I18N_PATH}SignatureRequired`)}
                </Checkbox>
              </Layouts.Margin>
            </>
          ) : null}
          <Layouts.Margin bottom="1">
            <Checkbox
              id="poRequired"
              name="details.poRequired"
              value={values.details?.poRequired ?? false}
              error={getIn(errors, 'details.poRequired')}
              onChange={selectedCustomer?.poRequired ? noop : handleChange}
              disabled={!!selectedCustomer?.poRequired}
            >
              {t(`${I18N_PATH}PoNumberRequired`)}
            </Checkbox>
          </Layouts.Margin>
        </Layouts.Column>
        {!isRecyclingFacilityBU ? (
          <Layouts.Column>
            <Layouts.Margin bottom="1">
              <Checkbox
                id="details.alleyPlacement"
                name="details.alleyPlacement"
                value={values.details?.alleyPlacement ?? false}
                error={getIn(errors, 'details.alleyPlacement')}
                onChange={selectedJobSite?.alleyPlacement ? noop : handleChange}
                disabled={!!selectedJobSite?.alleyPlacement}
              >
                {t(`${I18N_PATH}AlleyPlacement`)}
              </Checkbox>
            </Layouts.Margin>
            <Layouts.Margin bottom="1">
              <Checkbox
                id="details.cabOver"
                name="details.cabOver"
                value={values.details?.cabOver ?? false}
                error={getIn(errors, 'details.cabOver')}
                onChange={selectedJobSite?.cabOver ? noop : handleChange}
                disabled={!!selectedJobSite?.cabOver}
              >
                {t(`${I18N_PATH}CabOver`)}
              </Checkbox>
            </Layouts.Margin>
          </Layouts.Column>
        ) : null}
      </Layouts.Flex>
      <Layouts.Margin top="1.5">
        <Layouts.Box maxWidth="50%">
          <PurchaseOrderSelect
            isMulti
            fullSizeModal
            label={t(`${I18N_PATH}PONumber`)}
            placeholder={t('Text.Select')}
            name="details.defaultPurchaseOrders"
            options={purchaseOrderOptions}
            value={values.details?.defaultPurchaseOrders ?? ''}
            error={getIn(errors, 'details.defaultPurchaseOrders')}
            onSelectChange={setFieldValue}
            onCreatePurchaseOrder={handleCreatePurchaseOrder}
          />
        </Layouts.Box>
      </Layouts.Margin>

      {!isRecyclingFacilityBU ? (
        <>
          <Layouts.Padding top="4" bottom="2">
            <Typography variant="headerFour">{t(`${I18N_PATH}JobSiteInvoices`)}</Typography>
          </Layouts.Padding>

          <Layouts.Margin bottom="1">
            <Checkbox
              id="sendInvoicesToCustomer"
              name="sendInvoicesToCustomer"
              value={selectedCustomer?.sendInvoicesByEmail}
              onChange={noop}
              disabled
            >
              {t(`${I18N_PATH}CustomerInvoiceEmail`)}
            </Checkbox>
          </Layouts.Margin>
          <Layouts.Margin bottom="1">
            <Checkbox
              id="details.sendInvoicesToJobSite"
              name="details.sendInvoicesToJobSite"
              value={values.details?.sendInvoicesToJobSite ?? false}
              error={getIn(errors, 'details.sendInvoicesToJobSite')}
              onChange={handleChange}
            >
              {t(`${I18N_PATH}JobSiteAssignedEmail`)}
            </Checkbox>
          </Layouts.Margin>
          {values.details?.sendInvoicesToJobSite ? (
            <MultiInput
              id="details.invoiceEmails"
              name="details.invoiceEmails"
              ariaLabel={t(`${I18N_PATH}InvoiceEmails`)}
              values={values.details?.invoiceEmails ?? []}
              error={getIn(errors, 'details.invoiceEmails')}
              onChange={setFieldValue}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
};

export default observer(CustomerJobSiteDetails);
