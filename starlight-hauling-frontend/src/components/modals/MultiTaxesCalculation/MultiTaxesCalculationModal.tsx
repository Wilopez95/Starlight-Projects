import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { lowerCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Modal, Typography } from '@root/common';
import { IModal } from '@root/common/Modal/types';
import { TaxCalculation } from '@root/consts';
import {
  calcNewOrderSurcharges,
  findTaxConfigurationByBusinessLineId,
  formatTaxDistrictDescription,
} from '@root/helpers';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { INewOrders } from '@root/pages/NewRequest/NewRequestForm/forms/Order/types';

import {
  formatLineItemsTaxes,
  formatServiceOrMaterialTax,
  FormattableLineItem,
  FormattedTax,
} from '../TaxesCalculation/helpers';

import styles from '../TaxesCalculation/css/styles.scss';

const I18N_PATH = 'components.modals.MultiTaxesCalculation.Text.';

const shouldIncludeTax = (tax: FormattedTax | null): tax is FormattedTax =>
  tax !== null && tax.amount > 0.009;

const MultiTaxesCalculationModal: React.FC<
  IModal & {
    centered?: boolean;
    commercialTaxesUsed?: boolean;
  }
> = ({ commercialTaxesUsed = true, ...modalProps }) => {
  const { values } = useFormikContext<INewOrders>();

  const { lineItemStore, materialStore, billableServiceStore, surchargeStore } = useStores();
  const intl = useIntl();
  const { formatDateTime, currencySymbol, formatCurrency } = intl;
  const { t } = useTranslation();

  useEffect(() => {
    if (lineItemStore.loaded) {
      return;
    }

    const shouldLoadLineItems = values.orders.some(order =>
      order.lineItems.some(lineItem => lineItemStore.getById(lineItem.billableLineItemId) == null),
    );

    if (shouldLoadLineItems) {
      lineItemStore.request({ businessLineId: values.businessLineId });
    }
  }, [lineItemStore, values.businessLineId, values.orders]);

  const taxDistricts = values.taxDistricts;

  if (!taxDistricts) {
    return null;
  }

  if (values.type === 'RecurrentOrder') {
    values.orders = [];
    const tmp = values;

    if (tmp.final) {
      values.orders.push(tmp.final);
    }
    if (tmp.recurrentTemplateData) {
      values.orders.push(tmp.recurrentTemplateData);
    }
    if (tmp.delivery) {
      values.orders.push(tmp.delivery);
    }
  }

  return (
    <Modal {...modalProps} className={styles.modal} overlayClassName={styles.overlay}>
      <Layouts.Padding padding="3" right="4" left="4">
        <Typography variant="headerThree">Applied Taxes</Typography>
      </Layouts.Padding>

      <Layouts.Scroll rounded overscrollBehavior="contain">
        {values.orders.map((order, orderIndex) => {
          const lineItemsWithDescriptions: FormattableLineItem[] = [];

          const materialName = materialStore.getById(order.materialId)?.description;
          const serviceName = billableServiceStore.getById(order.billableServiceId)?.description;

          const serviceTotal = Number(order.billableServicePrice) || 0;

          let lineItemsWithSurcharges = order.lineItems;
          let serviceTotalWithSurcharges = serviceTotal;

          const hasAppliedSurcharges = order.billableServiceApplySurcharges;

          if (values.applySurcharges) {
            ({ lineItemsWithSurcharges, serviceTotalWithSurcharges } = calcNewOrderSurcharges({
              newOrder: order,
              surcharges: surchargeStore.values,
            }));
          }

          lineItemsWithSurcharges?.forEach(lineItem => {
            const description = lineItemStore.getById(lineItem.billableLineItemId)?.description;

            if (!description) {
              return;
            }

            lineItemsWithDescriptions.push({
              description,
              isThreshold: false,
              billableLineItemId: lineItem.billableLineItemId,
              quantity: lineItem.quantity,
              price: lineItem.price,
              applySurcharges: lineItem.applySurcharges,
            });
          });

          const lineItemTaxes = taxDistricts.map(taxDistrict =>
            formatLineItemsTaxes(
              {
                taxDistrict,
                lineItems: lineItemsWithDescriptions,
                businessLineId: values.businessLineId,
                quantity: order.billableServiceQuantity ?? 1,
                commercialTaxesUsed,
              },
              intl,
            ),
          );

          const materialsTaxes = taxDistricts.map(taxDistrict =>
            formatServiceOrMaterialTax(
              {
                taxDistrict,
                serviceTotal: serviceTotalWithSurcharges,
                itemCategory: 'materials',
                itemId: order.materialId,
                itemName: materialName,
                businessLineId: values.businessLineId,
                quantity: order.billableServiceQuantity ?? 1,
                commercialTaxesUsed,
              },
              intl,
            ),
          );

          const serviceTaxes = taxDistricts.map(taxDistrict =>
            formatServiceOrMaterialTax(
              {
                taxDistrict,
                serviceTotal: serviceTotalWithSurcharges,
                itemCategory: 'services',
                itemId: order.billableServiceId,
                itemName: serviceName,
                businessLineId: values.businessLineId,
                quantity: order.billableServiceQuantity ?? 1,
                commercialTaxesUsed,
              },
              intl,
            ),
          );

          return (
            <React.Fragment key={orderIndex}>
              <Layouts.Padding padding="4" top="1" bottom="1">
                <Typography variant="headerFour">
                  {t(`${I18N_PATH}OrderN`, { orderIndex: orderIndex + 1 })}
                </Typography>
              </Layouts.Padding>
              <div className={styles.taxesSection}>
                {taxDistricts.map((district, index) => {
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
                    <React.Fragment key={`order-${orderIndex}`}>
                      <div className={styles.description}>
                        <Typography fontWeight="medium" variant="bodyLarge">
                          {district.description}
                        </Typography>
                        {formatTaxDistrictDescription(taxDescription ?? '', ',')}
                        <br />
                        {t(`${I18N_PATH}TaxDistrictUpdated`, {
                          date: formatDateTime(district.updatedAt as Date).date,
                        })}
                      </div>
                      <table className={styles.calculationTable}>
                        <thead>
                          <tr>
                            <th>
                              <Typography color="secondary">Applied taxes</Typography>
                            </th>
                            <th>
                              <Typography color="secondary">Tax calculations</Typography>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {shouldIncludeTax(serviceTax) ? (
                            <tr>
                              <td>
                                <Typography fontWeight="bold">{serviceTax.description}</Typography>
                                {serviceTax.basedOn ? (
                                  <>
                                    <Typography fontWeight="bold" color="secondary" as="span">
                                      {serviceName}
                                    </Typography>
                                    {values.applySurcharges && hasAppliedSurcharges ? (
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
                          {shouldIncludeTax(materialTax) ? (
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
                            (tax, taxIndex) =>
                              shouldIncludeTax(tax) && (
                                <tr
                                  key={`order-${orderIndex}-district-${district.id}-${
                                    tax.lineItem.isThreshold ? 'threshold' : 'lineItem'
                                  }-${String(
                                    tax.lineItem.billableLineItemId ?? tax.lineItem.thresholdId,
                                  )}-tax-${taxIndex}`}
                                >
                                  <td>
                                    <Typography fontWeight="bold">{tax.description}</Typography>
                                    {tax.basedOn && tax.lineItem ? (
                                      <>
                                        <Typography fontWeight="bold" color="secondary" as="span">
                                          {tax.lineItem.description}
                                        </Typography>
                                        {values.applySurcharges && tax.lineItem.applySurcharges ? (
                                          <Typography color="secondary" as="span">
                                            {` (${lowerCase(
                                              t(`${I18N_PATH}IncludingSurcharges`),
                                            )})`}
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
                        <Typography color="secondary">{t(`${I18N_PATH}Material`)}</Typography>
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
                    {taxDistricts.map((district, taxDistrictsIndex) => {
                      const serviceTax = serviceTaxes[taxDistrictsIndex];
                      const materialTax = materialsTaxes[taxDistrictsIndex];
                      const lineItemTax = lineItemTaxes[taxDistrictsIndex];
                      const taxData = findTaxConfigurationByBusinessLineId(
                        district,
                        values.businessLineId,
                      );

                      return (
                        <React.Fragment
                          key={`order-${orderIndex}-district-${district.id}-${taxDistrictsIndex}`}
                        >
                          {shouldIncludeTax(serviceTax) ? (
                            <tr>
                              <td>{district.description}</td>
                              <td>{serviceName}</td>
                              <td />
                              <td>
                                {taxData?.[
                                  commercialTaxesUsed
                                    ? 'commercialServices'
                                    : 'nonCommercialServices'
                                ].calculation === TaxCalculation.Flat
                                  ? t(`${I18N_PATH}Flat`, { currencySymbol })
                                  : t(`${I18N_PATH}Percentage`)}
                              </td>
                              <td>{formatCurrency(serviceTax.amount)}</td>
                            </tr>
                          ) : null}
                          {shouldIncludeTax(materialTax) ? (
                            <tr>
                              <td>{district.description}</td>
                              <td>{serviceName}</td>
                              <td>{materialName}</td>
                              <td>
                                {taxData?.[
                                  commercialTaxesUsed
                                    ? 'commercialMaterials'
                                    : 'nonCommercialMaterials'
                                ].calculation === TaxCalculation.Flat
                                  ? t(`${I18N_PATH}Flat`, { currencySymbol })
                                  : t(`${I18N_PATH}Percentage`)}
                              </td>
                              <td>{formatCurrency(materialTax.amount)}</td>
                            </tr>
                          ) : null}
                          {lineItemTax.map(
                            (tax, taxIndex) =>
                              shouldIncludeTax(tax) && (
                                <tr
                                  key={`order-${orderIndex}-district-${
                                    district.id
                                  }-${taxDistrictsIndex}-${
                                    tax.lineItem.isThreshold ? 'threshold' : 'lineItem'
                                  }-${String(
                                    tax.lineItem.billableLineItemId ?? tax.lineItem.thresholdId,
                                  )}-tax-${taxIndex}`}
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
            </React.Fragment>
          );
        })}
      </Layouts.Scroll>
      <div className={styles.controls}>
        <Button variant="primary" onClick={modalProps.onClose}>
          {t(`Text.Close`)}
        </Button>
      </div>
    </Modal>
  );
};

export default observer(MultiTaxesCalculationModal);
