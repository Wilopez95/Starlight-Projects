import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { lowerCase, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Modal, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { TaxCalculation } from '@root/consts';
import { findTaxConfigurationByBusinessLineId, formatTaxDistrictDescription } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { ILineItem, ITaxDistrict } from '@root/types';

import {
  formatLineItemsTaxes,
  formatServiceOrMaterialTax,
  FormattableLineItem,
  FormattedTax,
} from './helpers';
import { TaxesCalculationModalProps } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'components.modals.TaxesCalculation.Text.';

const shouldIncludeTax = (tax: FormattedTax | null): tax is FormattedTax =>
  tax !== null && tax.amount > 0.009;

const TaxesCalculationModal: React.FC<TaxesCalculationModalProps> = ({
  commercialTaxesUsed,
  businessLineId,
  taxDistricts,
  serviceTotal,
  service,
  lineItems,
  thresholds,
  materialName,
  serviceName,
  workOrder,
  centered,
  applySurcharges,
  isOrderCanceled = false,
  ...modalProps
}) => {
  const intl = useIntl();
  const { formatDateTime, currencySymbol, formatCurrency } = intl;
  const { t } = useTranslation();
  const materialsTaxes = taxDistricts.map(taxDistrict =>
    formatServiceOrMaterialTax(
      {
        taxDistrict,
        workOrder,
        serviceTotal,
        itemCategory: 'materials',
        itemId: service.materialId,
        itemName: materialName,
        businessLineId,
        quantity: service.billableServiceQuantity ?? 1,
        commercialTaxesUsed,
      },
      intl,
    ),
  );

  const serviceTaxes = taxDistricts.map(taxDistrict =>
    formatServiceOrMaterialTax(
      {
        taxDistrict,
        workOrder,
        serviceTotal,
        itemCategory: 'services',
        itemId: service.billableServiceId,
        itemName: serviceName,
        businessLineId,
        quantity: service.billableServiceQuantity ?? 1,
        hasAppliedSurcharges: service.hasServiceAppliedSurcharges,
        commercialTaxesUsed,
      },
      intl,
    ),
  );
  const lineItemsWithDescriptions: FormattableLineItem[] = lineItems
    .filter(lineItem => lineItem.billableLineItem)
    .map(lineItem => ({
      isThreshold: false,
      description: (lineItem.billableLineItem as ILineItem).description,
      price: lineItem.price as number,
      quantity: lineItem.quantity,
      billableLineItemId: lineItem.billableLineItem?.originalId,
      applySurcharges: lineItem.applySurcharges,
    }));
  const thresholdsWithDescriptions: FormattableLineItem[] = thresholds
    .filter(threshold => threshold.threshold)
    .map(threshold => ({
      isThreshold: true,
      description: startCase(threshold.threshold.description),
      price: threshold.price,
      quantity: threshold.quantity,
      thresholdId: threshold.threshold.originalId,
      applySurcharges: threshold.applySurcharges,
    }));

  const lineItemsAndThresholds = lineItemsWithDescriptions.concat(thresholdsWithDescriptions);

  const lineItemTaxes = taxDistricts.map(taxDistrict =>
    formatLineItemsTaxes(
      {
        taxDistrict,
        lineItems: lineItemsAndThresholds,
        businessLineId,
        quantity: service.billableServiceQuantity ?? 1,
        commercialTaxesUsed,
      },
      intl,
    ),
  );

  return (
    <Modal
      {...modalProps}
      className={styles.modal}
      overlayClassName={cx(styles.overlay, centered && styles.centered)}
    >
      <div className={styles.title}>
        <Typography variant="headerThree">{t(`${I18N_PATH}AppliedTaxes`)}</Typography>
      </div>
      <Divider />
      <Layouts.Scroll rounded overscrollBehavior="contain">
        <div className={styles.taxesSection}>
          {taxDistricts.map((district: ITaxDistrict, index: number) => {
            const serviceTax = serviceTaxes[index];
            const materialTax = materialsTaxes[index];
            const lineItemTax = lineItemTaxes[index];

            const taxDescription = district.taxDescription;

            // If there is no tax description, there are no taxes.
            if (
              (district.useGeneratedDescription && !taxDescription) ||
              (!shouldIncludeTax(serviceTax) &&
                !shouldIncludeTax(materialTax) &&
                lineItemTax.length === 0)
            ) {
              return null;
            }

            return (
              <React.Fragment key={district.id}>
                <div className={styles.description}>
                  <Typography fontWeight="medium" variant="bodyLarge">
                    {district.description}
                  </Typography>
                  {formatTaxDistrictDescription(taxDescription ?? '', ',')}
                  <br />
                  {t(`${I18N_PATH}TaxDistrictUpdatedOn`, {
                    date: formatDateTime(district.updatedAt as Date).date,
                  })}
                </div>
                <table className={styles.calculationTable}>
                  <thead>
                    <tr>
                      <th>
                        <Typography color="secondary">{t(`${I18N_PATH}AppliedTaxes`)}</Typography>
                      </th>
                      <th>
                        <Typography color="secondary">
                          {t(`${I18N_PATH}TaxCalculations`)}
                        </Typography>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isOrderCanceled && shouldIncludeTax(serviceTax) ? (
                      <tr>
                        <td>
                          <Typography fontWeight="bold">{serviceTax.description}</Typography>
                          {serviceTax.basedOn ? (
                            <>
                              <Typography fontWeight="bold" color="secondary" as="span">
                                {serviceName}:{' '}
                              </Typography>
                              {applySurcharges && serviceTax.hasAppliedSurcharges ? (
                                <Typography color="secondary" as="span">
                                  {` (${lowerCase(t(`${I18N_PATH}IncludingSurcharges`))})`}
                                </Typography>
                              ) : null}
                              :{' '}
                              <Typography color="secondary" as="span">
                                {serviceTax.basedOn}
                              </Typography>
                            </>
                          ) : null}
                        </td>
                        <td>{serviceTax.calculation}</td>
                      </tr>
                    ) : null}
                    {!isOrderCanceled && shouldIncludeTax(materialTax) ? (
                      <tr>
                        <td>
                          <Typography variant="headerFive" fontWeight="bold">
                            {materialTax.description}
                          </Typography>
                          {materialTax.basedOn ? (
                            <>
                              <Typography fontWeight="bold" color="secondary" as="span">
                                {serviceName} ({materialName}):{' '}
                              </Typography>
                              <Typography color="secondary" as="span">
                                {materialTax.basedOn}
                              </Typography>
                            </>
                          ) : null}
                        </td>
                        <td>{materialTax.calculation}</td>
                      </tr>
                    ) : null}
                    {lineItemTax.map(
                      tax =>
                        shouldIncludeTax(tax) && (
                          <tr
                            key={`${district.id}-${String(
                              tax.lineItem.billableLineItemId ?? tax.lineItem.thresholdId,
                            )}`}
                          >
                            <td>
                              <Typography fontWeight="bold">{tax.description}</Typography>
                              {tax.basedOn && tax.lineItem ? (
                                <>
                                  <Typography fontWeight="bold" color="secondary" as="span">
                                    {tax.lineItem.description}
                                  </Typography>
                                  {applySurcharges && tax.lineItem.applySurcharges ? (
                                    <Typography color="secondary" as="span">
                                      {` (${lowerCase(t(`${I18N_PATH}IncludingSurcharges`))})`}
                                    </Typography>
                                  ) : null}
                                  :{' '}
                                  <Typography color="secondary" as="span">
                                    {tax.basedOn}
                                  </Typography>
                                </>
                              ) : null}
                            </td>
                            <td>{tax.calculation}</td>
                          </tr>
                        ),
                    )}
                  </tbody>
                </table>
              </React.Fragment>
            );
          })}
        </div>
        <Divider />
        <div className={styles.taxesSection}>
          <Typography fontWeight="medium" variant="bodyLarge">
            {t(`${I18N_PATH}Summary`)}
          </Typography>
          <table className={styles.summaryTable}>
            <thead>
              <tr>
                <th>
                  <Typography color="secondary">{t(`${I18N_PATH}TaxDistrict`)}</Typography>
                </th>
                <th>
                  <Typography color="secondary">{t(`${I18N_PATH}BillableItem`)}</Typography>
                </th>
                <th>
                  <Typography color="secondary">{t('Text.Material')}</Typography>
                </th>
                <th>
                  <Typography color="secondary">{t(`${I18N_PATH}TaxType`)}</Typography>
                </th>
                <th>
                  <Typography color="secondary">{t(`${I18N_PATH}Amount`)}</Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {taxDistricts.map((district, index) => {
                const serviceTax = serviceTaxes[index];
                const materialTax = materialsTaxes[index];
                const lineItemTax = lineItemTaxes[index];
                const taxData = findTaxConfigurationByBusinessLineId(district, businessLineId);

                return (
                  <React.Fragment key={district.id}>
                    {!isOrderCanceled && shouldIncludeTax(serviceTax) ? (
                      <tr>
                        <td>{district.description}</td>
                        <td>{serviceName}</td>
                        <td />
                        <td>
                          {taxData?.[
                            commercialTaxesUsed ? 'commercialServices' : 'nonCommercialServices'
                          ].calculation === TaxCalculation.Flat
                            ? t(`${I18N_PATH}Flat`, { currencySymbol })
                            : t(`${I18N_PATH}Percentage`)}
                        </td>
                        <td>{formatCurrency(serviceTax.amount)}</td>
                      </tr>
                    ) : null}
                    {!isOrderCanceled && shouldIncludeTax(materialTax) ? (
                      <tr>
                        <td>{district.description}</td>
                        <td>{serviceName}</td>
                        <td>{materialName}</td>
                        <td>
                          {taxData?.[
                            commercialTaxesUsed ? 'commercialMaterials' : 'nonCommercialMaterials'
                          ].calculation === TaxCalculation.Flat
                            ? t(`${I18N_PATH}Flat`, { currencySymbol })
                            : t(`${I18N_PATH}Percentage`)}
                        </td>
                        <td>{formatCurrency(materialTax.amount)}</td>
                      </tr>
                    ) : null}
                    {lineItemTax.map(
                      tax =>
                        shouldIncludeTax(tax) && (
                          <tr
                            key={`${district.id}-${String(
                              tax.lineItem.billableLineItemId ?? tax.lineItem.thresholdId,
                            )}`}
                          >
                            <td>{district.description}</td>
                            <td>
                              {tax.shouldDisplayLineItem
                                ? tax.lineItem.description
                                : t(`${I18N_PATH}AllLineItems`)}
                            </td>
                            <td />
                            <td>
                              {taxData?.[
                                commercialTaxesUsed
                                  ? 'commercialLineItems'
                                  : 'nonCommercialLineItems'
                              ].calculation === TaxCalculation.Flat
                                ? t(`${I18N_PATH}Flat`, { currencySymbol })
                                : t(`${I18N_PATH}Percentage`)}
                            </td>
                            <td>{formatCurrency(tax.amount)}</td>
                          </tr>
                        ),
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Layouts.Scroll>
      <Divider />
      <div className={styles.controls}>
        <Button variant="primary" onClick={modalProps.onClose}>
          {t(`Text.Close`)}
        </Button>
      </div>
    </Modal>
  );
};

export default observer(TaxesCalculationModal);
