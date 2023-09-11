import React, { FC, useEffect, useMemo } from 'react';
import cs from 'classnames';
import { gql } from '@apollo/client';
import {
  Box,
  Button,
  Divider,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { Trans, useTranslation } from '../../../../i18n';

import CloseIcon from '@material-ui/icons/Close';
import { closeModal } from '../../../../components/Modals';
import { capitalize, isEmpty, isNil, keyBy } from 'lodash-es';
import {
  HaulingBillableItemUnit,
  OrderBillableItem,
  OrderType,
  TaxCalculation,
  TaxDistrictForOrderFragment,
  useGetTaxDistrictsForOrderQuery,
} from '../../../../graphql/api';
import {
  findTaxConfigurationByBusinessLineId,
  formatLineItemsTaxes,
  formatServiceOrMaterialTax,
  FormattableLineItem,
  formatTaxDistrictDescription,
  shouldIncludeTax,
} from './helpers';
import {
  isFeeOrderBillableItem,
  isMaterialOrderBillableItem,
  isOrderBillableItemMaterialOrFee,
} from '../../helpers/formatBillableItems';
import { useCompanySettings } from '../../../../hooks/useCompanySettings';
import { Skeleton } from '@material-ui/lab';
import { showError } from '@starlightpro/common';
import { TaxDescription } from './TaxDescription';
import { TaxCalculation as TaxCalculationComponent } from './TaxCalculation';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';
import { toLower } from 'lodash/fp';
import { billableItemUnitTransMapping } from '../../constants';

interface TaxesInfoModalProps {
  orderBillableItems: OrderBillableItem[];
  commercialTaxesUsed: boolean;
  customerId?: number;
  jobSiteId?: number | null;
  originDistrictId?: number | null;
  billableServiceId?: number | null;
  type: OrderType;
  taxDistricts?: TaxDistrictForOrderFragment[] | null;
}

gql`
  fragment TaxConfiguration on Tax {
    group
    application
    calculation
    exclusions
    nonGroup {
      id
      value
    }
    value
  }
  fragment TaxLineItemConfiguration on LineItemTax {
    group
    application
    calculation
    exclusions {
      thresholds
      lineItems
    }
    nonGroup {
      thresholds {
        id
        value
      }
      lineItems {
        id
        value
      }
    }
    value
  }
  fragment TaxDistrictForOrder on HaulingTaxDistrict {
    id
    description
    taxDescription
    districtType
    includeNationalInTaxableAmount
    businessConfiguration {
      id
      businessLineId
      commercialLineItems {
        ...TaxLineItemConfiguration
      }
      commercialMaterials {
        ...TaxConfiguration
      }
      commercialServices {
        ...TaxConfiguration
      }
      nonCommercialLineItems {
        ...TaxLineItemConfiguration
      }
      nonCommercialMaterials {
        ...TaxConfiguration
      }
      nonCommercialServices {
        ...TaxConfiguration
      }
    }
    useGeneratedDescription
    updatedAt
  }
  query getTaxDistrictsForOrder($filter: TaxDistrictFilter!) {
    taxDistrictsForOrder(filter: $filter) {
      ...TaxDistrictForOrder
    }
  }
`;

const useStyles = makeStyles(
  ({ palette, spacing }) => ({
    root: {
      width: '742px',
      maxWidth: '90vw',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '90vh',
    },
    modalHeader: {
      padding: spacing(4, 2, 3, 5),
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalFooter: {
      padding: spacing(4, 4, 3, 5),
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    modalContent: {
      overflowX: 'hidden',
      overflowY: 'auto',
    },
    contentWrapper: {
      padding: spacing(3, 4, 3, 5),
    },
    appliedTaxesWrapper: {
      padding: spacing(2, 4, 0, 5),
    },
    taxHeader: {
      color: palette.grey['600'],
    },
    taxRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      padding: spacing(1, 0),
    },
    taxTitle: {
      fontWeight: 500,
    },
    taxSummaryTable: {},
    taxSummaryTableWrapper: {
      padding: spacing(2, 4, 2, 5),
      background: palette.background.default,
    },
    summaryTableRoot: {
      background: palette.background.default,
    },
    summaryTableHeadRow: {
      boxShadow: 'none',
    },
    summaryTableRow: {
      '& > *:first-child': {
        paddingLeft: 0,
      },
      '& > *:last-child': {
        paddingRight: 0,
      },
    },
  }),
  { name: 'TaxesInfoModal' },
);

const eachUnit = toLower(billableItemUnitTransMapping[HaulingBillableItemUnit.Each]);

export const TaxesModalContainer: FC<{ children: React.ReactNode }> = ({ children }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.modalHeader}>
        <Typography variant="h5">
          <Trans>Applied Taxes</Trans>
        </Typography>
        <IconButton onClick={closeModal}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box className={classes.modalContent}>{children}</Box>
      <Divider />
      <Box className={classes.modalFooter}>
        <Button onClick={closeModal} variant="contained" color="primary">
          <Trans>Close</Trans>
        </Button>
      </Box>
    </Box>
  );
};

export const TaxesInfoModal: FC<TaxesInfoModalProps> = ({
  taxDistricts: taxDistrictsProp,
  orderBillableItems,
  commercialTaxesUsed,
  customerId,
  jobSiteId,
  originDistrictId,
  billableServiceId,
  type,
}) => {
  const companySettings = useCompanySettings();
  const { massTranslation } = useCompanyMeasurementUnits();
  const { data: taxDistrictsData, loading, error } = useGetTaxDistrictsForOrderQuery({
    variables: {
      filter: {
        customerId: customerId as number,
        originDistrictId: originDistrictId || null,
        jobSiteId: jobSiteId || (originDistrictId ? null : companySettings.jobSiteId),
      },
    },
    skip:
      !!taxDistrictsProp ||
      !customerId ||
      (isNil(jobSiteId || companySettings.jobSiteId) && isNil(originDistrictId)),
    fetchPolicy: 'no-cache',
  });
  const [t] = useTranslation();
  const businessLineId = companySettings.businessLineId || 0;
  const taxDistricts = taxDistrictsProp || taxDistrictsData?.taxDistrictsForOrder || [];
  const classes = useStyles();

  const billableServiceItem = orderBillableItems.find(isFeeOrderBillableItem);
  const materialBillableItem = orderBillableItems.find(isMaterialOrderBillableItem);
  const lineItems = orderBillableItems.filter((obi) => !isOrderBillableItemMaterialOrFee(obi));
  const serviceName = capitalize(type);
  const serviceTotal = (billableServiceItem?.price ?? 0) * (billableServiceItem?.quantity ?? 0);
  const materialName = billableServiceItem?.material?.description;
  const thresholdDescription = type === OrderType.Dump ? 'Disposal by Ton' : 'Material by Ton';

  useEffect(() => {
    if (error) {
      showError(<Trans>Failed to load taxes</Trans>);
    }
  }, [error]);

  const orderBillableItemsByUUID = useMemo(() => keyBy(orderBillableItems, 'uuid'), [
    orderBillableItems,
  ]);

  if (loading) {
    return (
      <TaxesModalContainer>
        <Box className={classes.contentWrapper}>
          <Box mb={2}>
            <Box pb={1}>
              <Typography variant="body1" className={classes.taxTitle}>
                <Skeleton variant="text" width={150} />
              </Typography>
            </Box>
            <Box pb={1}>
              <Typography variant="body2">
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="100%" />
              </Typography>
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" className={classes.taxHeader}>
              <Skeleton variant="text" width={90} />
            </Typography>
            <Typography variant="body2" className={classes.taxHeader}>
              <Skeleton variant="text" width={90} />
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" pt={1} pb={1}>
            <Skeleton variant="text" width={190} />
            <Skeleton variant="text" width={150} />
          </Box>
        </Box>
      </TaxesModalContainer>
    );
  }

  const materialsTaxes = taxDistricts.map((taxDistrict) =>
    formatServiceOrMaterialTax({
      taxDistrict,
      serviceTotal,
      itemCategory: 'materials',
      itemId: materialBillableItem?.materialId,
      itemName: materialBillableItem?.material?.description,
      businessLineId,
      quantity: 1,
      commercialTaxesUsed,
      netWeight: materialBillableItem?.quantity ?? 0,
      t,
    }),
  );

  const serviceTaxes = taxDistricts.map((taxDistrict) =>
    formatServiceOrMaterialTax({
      taxDistrict,
      serviceTotal,
      itemCategory: 'services',
      itemId: billableServiceId,
      itemName: serviceName,
      businessLineId,
      quantity: 1,
      hasAppliedSurcharges: false,
      commercialTaxesUsed,
      netWeight: billableServiceItem?.quantity ?? 0,
      t,
    }),
  );
  const lineItemsWithDescriptions: FormattableLineItem[] = lineItems
    .filter((lineItem) => lineItem.billableItem)
    .map((lineItem) => ({
      uuid: lineItem.uuid,
      isThreshold: false,
      description: lineItem.billableItem?.description || 'no desc',
      price: lineItem.price as number,
      quantity: lineItem.quantity,
      billableLineItemId: lineItem.billableItem?.id,
    }));

  if (materialBillableItem) {
    lineItemsWithDescriptions.push({
      uuid: materialBillableItem.uuid,
      isThreshold: true,
      description: thresholdDescription,
      price: materialBillableItem.price as number,
      quantity: materialBillableItem.quantity,
      thresholdId: materialBillableItem.thresholdId as number,
    });
  }

  const lineItemTaxes = taxDistricts.map((taxDistrict) =>
    formatLineItemsTaxes({
      taxDistrict,
      lineItems: lineItemsWithDescriptions,
      businessLineId,
      quantity: billableServiceItem?.quantity ?? 1,
      commercialTaxesUsed,
      t,
    }),
  );

  const getServiceNameForLineItem = (obi: OrderBillableItem) => {
    if (isMaterialOrderBillableItem(obi)) {
      return thresholdDescription;
    }

    if (obi.billableItem?.materialBasedPricing && obi.material) {
      return `${obi.billableItem.description}(${obi.material.description})`;
    }

    return obi.billableItem?.description;
  };

  const getUnitForLineItem = (obi: OrderBillableItem) => {
    if (isMaterialOrderBillableItem(obi)) {
      return toLower(massTranslation);
    }

    if (isFeeOrderBillableItem(obi)) {
      return eachUnit;
    }

    let unit;

    if (obi.billableItem?.unit) {
      unit = toLower(billableItemUnitTransMapping[obi.billableItem.unit]);
    }

    return unit;
  };

  if (isEmpty(taxDistricts)) {
    return (
      <TaxesModalContainer>
        <Box className={classes.contentWrapper}>
          <Typography>No Taxes applied.</Typography>
        </Box>
      </TaxesModalContainer>
    );
  }

  return (
    <TaxesModalContainer>
      <Box className={classes.appliedTaxesWrapper}>
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
            <Box pt={2} pb={2} key={district.id}>
              <Box mb={2}>
                <Box pb={1}>
                  <Typography variant="body1" className={classes.taxTitle}>
                    {district.description}
                  </Typography>
                </Box>
                <Box pb={1}>
                  <Typography variant="body2">
                    {formatTaxDistrictDescription(taxDescription ?? '', ',')}
                    <br />
                    <Trans>Tax District updated on</Trans>{' '}
                    {t('dateLabel', {
                      date: new Date(district.updatedAt),
                    })}
                    .
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" className={classes.taxHeader}>
                  <Trans>Applied Taxes</Trans>
                </Typography>
                <Typography variant="body2" className={classes.taxHeader}>
                  <Trans>Tax Calculations</Trans>
                </Typography>
              </Box>
              {shouldIncludeTax(serviceTax) && billableServiceItem && (
                <Box className={classes.taxRow}>
                  <TaxDescription
                    serviceName={serviceName}
                    calculatedTax={serviceTax}
                    unit={eachUnit}
                  />
                  <TaxCalculationComponent calculatedTax={serviceTax} />
                </Box>
              )}
              {shouldIncludeTax(materialTax) && materialBillableItem && (
                <Box className={classes.taxRow}>
                  <TaxDescription
                    serviceName={materialBillableItem.material?.description}
                    calculatedTax={materialTax}
                    unit={eachUnit}
                  />
                  <TaxCalculationComponent calculatedTax={materialTax} />
                </Box>
              )}
              {lineItemTax.map(
                (tax) =>
                  shouldIncludeTax(tax) &&
                  orderBillableItemsByUUID[tax.lineItem.uuid] && (
                    <Box key={tax.lineItem.uuid} className={classes.taxRow}>
                      <TaxDescription
                        serviceName={getServiceNameForLineItem(
                          orderBillableItemsByUUID[tax.lineItem.uuid],
                        )}
                        calculatedTax={tax}
                        unit={getUnitForLineItem(orderBillableItemsByUUID[tax.lineItem.uuid])}
                      />
                      <TaxCalculationComponent calculatedTax={tax} />
                    </Box>
                  ),
              )}
            </Box>
          );
        })}
      </Box>
      <Divider />
      <Box className={classes.taxSummaryTable}>
        <Divider />
        <Box className={classes.taxSummaryTableWrapper}>
          <Box pb={1}>
            <Typography variant="body1" className={classes.taxTitle}>
              <Trans>Summary</Trans>
            </Typography>
          </Box>
          <TableContainer>
            <Table
              size="small"
              aria-label={t('tax summary table')}
              className={classes.summaryTableRoot}
            >
              <TableHead>
                <TableRow className={cs(classes.summaryTableHeadRow, classes.summaryTableRow)}>
                  <TableCell align="left">
                    <Trans>Tax District</Trans>
                  </TableCell>
                  <TableCell align="left">
                    <Trans>Billable Item</Trans>
                  </TableCell>
                  <TableCell align="left">
                    <Trans>Material</Trans>
                  </TableCell>
                  <TableCell align="left">
                    <Trans>Tax Type</Trans>
                  </TableCell>
                  <TableCell align="right">
                    <Trans>Amount</Trans>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taxDistricts.map((district, index) => {
                  const serviceTax = serviceTaxes[index];
                  const materialTax = materialsTaxes[index];
                  const lineItemTax = lineItemTaxes[index];
                  const taxData = findTaxConfigurationByBusinessLineId(district, businessLineId);

                  return (
                    <React.Fragment key={district.id}>
                      {shouldIncludeTax(serviceTax) && (
                        <TableRow className={classes.summaryTableRow}>
                          <TableCell align="left">{district.description}</TableCell>
                          <TableCell align="left">{serviceName}</TableCell>
                          <TableCell align="left" />
                          <TableCell align="left">
                            <Box whiteSpace="nowrap">
                              {taxData?.[
                                commercialTaxesUsed ? 'commercialServices' : 'nonCommercialServices'
                              ].calculation === TaxCalculation.Flat
                                ? t(`Flat, $t(currency)`)
                                : t(`Percentage, %`)}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {t('money', { value: serviceTax.amount })}
                          </TableCell>
                        </TableRow>
                      )}
                      {shouldIncludeTax(materialTax) && (
                        <TableRow className={classes.summaryTableRow}>
                          <TableCell align="left">{district.description}</TableCell>
                          <TableCell align="left">{serviceName}</TableCell>
                          <TableCell align="left">{materialName}</TableCell>
                          <TableCell align="left">
                            <Box whiteSpace="nowrap">
                              {taxData?.[
                                commercialTaxesUsed
                                  ? 'commercialMaterials'
                                  : 'nonCommercialMaterials'
                              ].calculation === TaxCalculation.Flat
                                ? t(`Flat, $t(currency)`)
                                : t(`Percentage, %`)}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {t('money', { value: materialTax.amount })}
                          </TableCell>
                        </TableRow>
                      )}
                      {lineItemTax.map(
                        (tax) =>
                          shouldIncludeTax(tax) &&
                          orderBillableItemsByUUID[tax.lineItem.uuid] && (
                            <TableRow
                              key={`${district.id}-line-item`}
                              className={classes.summaryTableRow}
                            >
                              <TableCell align="left">{district.description}</TableCell>
                              <TableCell align="left">
                                {tax.shouldDisplayLineItem
                                  ? isMaterialOrderBillableItem(
                                      orderBillableItemsByUUID[tax.lineItem.uuid],
                                    )
                                    ? thresholdDescription
                                    : tax.lineItem.description
                                  : t(`All Line Items`)}
                              </TableCell>
                              <TableCell align="left">
                                {tax.shouldDisplayLineItem
                                  ? orderBillableItemsByUUID[tax.lineItem.uuid].material
                                      ?.description
                                  : null}
                              </TableCell>
                              <TableCell align="left">
                                <Box whiteSpace="nowrap">
                                  {taxData?.[
                                    commercialTaxesUsed
                                      ? 'commercialLineItems'
                                      : 'nonCommercialLineItems'
                                  ].calculation === TaxCalculation.Flat
                                    ? t(`Flat, $t(currency)`)
                                    : t(`Percentage, %`)}
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                {t('money', { value: tax.amount })}
                              </TableCell>
                            </TableRow>
                          ),
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </TaxesModalContainer>
  );
};
