import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';
import validator from 'validator';

import { HistoryIcon } from '@root/assets';
import { Badge, FormInput, WarningTooltip } from '@root/common';
import { Table, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { NONE_MATERIAL_KEY, SurchargeCalculation } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { RatesEntityType } from '@root/types';

import { FormSkeleton, InputOperations, MaterialNavItem } from '../../components';
import { calculateFinalPrice, calculatePercentage, toFixed } from '../../helpers';

import styles from '../../css/styles.scss';
import { materialsLoadingNavigationConfig } from './navigationConfigs';
import { type IPriceGroupRateSurchargeFormikData, type ISurchargeForm } from './types';

const I18N_PATH = 'components.forms.Rates.Custom.Surcharge.';
const SurchargeForm: React.FC<ISurchargeForm> = ({
  currentMaterialNavigation,
  onMaterialChange,
  onShowRatesHistory,
  viewMode = false,
}) => {
  const { values, errors, setFieldValue, handleBlur, setFieldTouched } =
    useFormikContext<IPriceGroupRateSurchargeFormikData>();

  const { globalRateStore, surchargeStore, priceGroupStore, materialStore } = useStores();
  const { businessUnitId, businessLineId } = useBusinessContext();
  const { t } = useTranslation();
  const { currencySymbol, formatCurrency } = useIntl();

  const selectedPriceGroup = priceGroupStore.selectedEntity;

  const materialsNavigation: NavigationConfigItem<string>[] = useMemo(
    () => [
      { label: 'None Material', key: NONE_MATERIAL_KEY, index: 0 },
      ...materialStore.sortedValues.map((material, index) => ({
        label: <MaterialNavItem text={material.description} active={material.active} />,
        key: material.id.toString(),
        index: index + 1,
      })),
    ],
    [materialStore.sortedValues],
  );

  useEffect(() => {
    if (!materialStore.loading && materialsNavigation.length && !currentMaterialNavigation) {
      onMaterialChange?.(materialsNavigation[0]);
    }
  }, [currentMaterialNavigation, materialStore.loading, materialsNavigation, onMaterialChange]);

  useEffect(() => {
    if (currentMaterialNavigation && selectedPriceGroup) {
      globalRateStore.requestSurcharges({
        businessUnitId,
        businessLineId,
        materialId:
          currentMaterialNavigation.key === NONE_MATERIAL_KEY
            ? undefined
            : Number.parseInt(currentMaterialNavigation.key, 10),
      });
      priceGroupStore.requestSurcharges({
        businessUnitId,
        businessLineId,
        priceGroupId: selectedPriceGroup.id,
        materialId:
          currentMaterialNavigation.key === NONE_MATERIAL_KEY
            ? undefined
            : Number.parseInt(currentMaterialNavigation.key, 10),
      });
    }
  }, [
    currentMaterialNavigation,
    globalRateStore,
    priceGroupStore,
    selectedPriceGroup,
    priceGroupStore.isPreconditionFailed,
    businessUnitId,
    businessLineId,
  ]);

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      const { value } = e.target;
      const price = values.surcharges[index].price ?? 0;
      let operation = values.surcharges[index].operation;

      const surcharge = { ...values.surcharges[index] };

      if (price > 0) {
        operation = operation ?? true;

        surcharge.value = value;
        surcharge.operation = operation;

        const finalPrice = calculateFinalPrice(operation, +value, +price);

        surcharge.displayValue = value;
        surcharge.finalPrice = finalPrice;
      }

      setFieldValue(`surcharges[${index}]`, surcharge);
    },
    [setFieldValue, values],
  );

  const handleFinalPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      const { value } = e.target;
      const price = values.surcharges[index].price ?? 0;

      const surcharge = { ...values.surcharges[index] };

      if (price > 0) {
        surcharge.finalPrice = value;

        if (values.surcharges[index].operation === undefined) {
          surcharge.operation = true;
        }
        const percentage = calculatePercentage(price, +value);

        surcharge.value = percentage;
        if (percentage) {
          surcharge.displayValue = toFixed(+percentage, 3);
          surcharge.operation = +value > price;
        } else {
          surcharge.displayValue = undefined;
          surcharge.operation = undefined;
        }
      }
      setFieldValue(`surcharges[${index}]`, surcharge);
      setFieldTouched(`surcharges[${index}].value`, true);
    },
    [setFieldValue, setFieldTouched, values],
  );

  const handleOperationChange = useCallback(
    (operation: boolean, index: number) => {
      if (!viewMode) {
        const baseFieldName = `surcharges[${index}]`;
        const price = values.surcharges[index].price ?? 0;

        if (price > 0) {
          setFieldValue(`${baseFieldName}.operation`, operation);
          const value = values.surcharges[index].value ?? 0;

          const finalPrice = calculateFinalPrice(operation, +value, +price);

          if (validator.isNumeric(finalPrice)) {
            setFieldValue(`${baseFieldName}.finalPrice`, finalPrice);
          }
          setFieldTouched(`surcharges[${index}].value`, true);
        }
      }
    },
    [viewMode, values.surcharges, setFieldValue, setFieldTouched],
  );

  const handleShowHistory = useCallback(
    (surchargeId: number, description?: string) => {
      if (selectedPriceGroup && currentMaterialNavigation) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          surchargeId,
          materialId:
            currentMaterialNavigation.key === NONE_MATERIAL_KEY
              ? null
              : Number.parseInt(currentMaterialNavigation.key, 10),
          customRatesGroupId: selectedPriceGroup.id,
          entityType: RatesEntityType.customRatesSurcharges,
        };

        const materialLabel = materialStore.getById(+currentMaterialNavigation.key)?.description;

        onShowRatesHistory(ratesHistoryParams, [description, materialLabel].join(' • '));
      }
    },
    [
      businessLineId,
      businessUnitId,
      currentMaterialNavigation,
      materialStore,
      onShowRatesHistory,
      selectedPriceGroup,
    ],
  );

  const inputDisabled = (index: number) => viewMode || !values.surcharges[index].price;

  return (
    <>
      <Navigation
        activeTab={currentMaterialNavigation}
        configs={materialStore.loading ? materialsLoadingNavigationConfig : materialsNavigation}
        onChange={onMaterialChange}
        className={cx(styles.customerMaterialsNavigation, styles.quickView)}
        direction="column"
      />
      <Layouts.Flex direction="column" as={Layouts.Box} width="80%">
        <Layouts.Padding top="1" right="0.5" bottom="0" left="2">
          {priceGroupStore.surchargesLoading ? (
            <FormSkeleton />
          ) : (
            <Table>
              <thead>
                <tr className={styles.surchargeGrid}>
                  <TableTools.HeaderCell titleClassName={styles.tableCell}>
                    {t(`${I18N_PATH}Surcharges`)}
                  </TableTools.HeaderCell>
                  <TableTools.HeaderCell titleClassName={styles.tableCell} right>
                    {t(`${I18N_PATH}GlobalValue`)}
                  </TableTools.HeaderCell>
                  <TableTools.HeaderCell titleClassName={styles.tableCell} right>
                    {t(`${I18N_PATH}Value`)}, %
                  </TableTools.HeaderCell>
                  <TableTools.HeaderCell titleClassName={styles.tableCell} right>
                    <Layouts.Margin right="1" as="span">
                      <WarningTooltip
                        position="top"
                        text={t(`${I18N_PATH}EnsureValueInCorrectFormat`)}
                      />
                    </Layouts.Margin>

                    {t(`${I18N_PATH}GroupValue`)}
                  </TableTools.HeaderCell>
                </tr>
              </thead>
              <tbody>
                {values.surcharges?.map((surcharge, index) => {
                  const surchargeService = surchargeStore.getById(surcharge.surchargeId);

                  return (
                    <TableRow
                      key={surcharge.surchargeId}
                      className={cx(styles.historyLabel, styles.surchargeGrid)}
                    >
                      <TableCell titleClassName={styles.tableCell}>
                        <Layouts.Flex alignItems="center">
                          {surchargeService?.description}
                          {!surchargeService?.active ? (
                            <Badge color="alert" className={styles.inactive}>
                              {t('Text.Inactive')}
                            </Badge>
                          ) : null}
                          <HistoryIcon
                            className={styles.rateHistoryIcon}
                            onClick={() =>
                              handleShowHistory(
                                surcharge.surchargeId,
                                surchargeService?.description,
                              )
                            }
                          />
                        </Layouts.Flex>
                      </TableCell>
                      <TableCell titleClassName={styles.tableCell} right>
                        {surchargeService?.calculation === SurchargeCalculation.Flat
                          ? formatCurrency(surcharge.price)
                          : `${surcharge.price ?? 0}%`}
                      </TableCell>
                      <TableCell titleClassName={styles.tableCell} right>
                        <Layouts.Flex alignItems="center">
                          <InputOperations
                            disabled={viewMode}
                            active={surcharge.operation}
                            onIncrement={() => handleOperationChange(true, index)}
                            onDecrement={() => handleOperationChange(false, index)}
                          />
                          <FormInput
                            type="number"
                            name={`surcharges[${index}].value`}
                            key="value"
                            value={values.surcharges[index].displayValue}
                            disabled={inputDisabled(index)}
                            className={styles.input}
                            onChange={e => handleValueChange(e, index)}
                            onBlur={handleBlur}
                            error={getIn(errors.surcharges, `[${index}].value`)}
                            noError={!getIn(errors.surcharges, `[${index}].value`)}
                            wrapClassName={styles.input}
                          />
                        </Layouts.Flex>
                      </TableCell>
                      <TableCell titleClassName={styles.tableCell} right>
                        <Layouts.Flex alignItems="center">
                          <Layouts.Margin right="1">
                            {surchargeService?.calculation === SurchargeCalculation.Flat
                              ? currencySymbol
                              : ''}
                          </Layouts.Margin>
                          <FormInput
                            type="number"
                            name={`surcharges[${index}].finalPrice`}
                            key="finalPrice"
                            value={values.surcharges[index].finalPrice}
                            disabled={inputDisabled(index)}
                            className={styles.input}
                            onChange={e => handleFinalPriceChange(e, index)}
                            error={getIn(errors.surcharges, `[${index}].finalPrice`)}
                            noError={!getIn(errors.surcharges, `[${index}].finalPrice`)}
                            wrapClassName={styles.input}
                          />
                        </Layouts.Flex>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Layouts.Padding>
      </Layouts.Flex>
    </>
  );
};

export default observer(SurchargeForm);
