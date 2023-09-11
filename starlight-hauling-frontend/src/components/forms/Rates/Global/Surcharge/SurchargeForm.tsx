import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { HistoryIcon } from '@root/assets';
import { Badge, FormInput, WarningTooltip } from '@root/common';
import { Table } from '@root/common/TableTools';
import { NONE_MATERIAL_KEY, SurchargeCalculation } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { RatesEntityType } from '@root/types';

import { FormSkeleton, MaterialNavItem } from '../../components';

import styles from '../../css/styles.scss';
import { materialsLoadingNavigationConfig } from './navigationConfigs';
import { type IGlobalRateSurchargeFormikData, type ISurchargeForm } from './types';

const I18N_PATH = 'components.forms.Rates.Global.Surcharge.';

const SurchargeForm: React.FC<ISurchargeForm> = ({
  currentMaterialNavigation,
  onMaterialChange,
  onShowRatesHistory,
}) => {
  const { values, errors, handleChange, handleBlur } =
    useFormikContext<IGlobalRateSurchargeFormikData>();

  const { globalRateStore, surchargeStore, materialStore } = useStores();
  const { businessUnitId, businessLineId } = useBusinessContext();
  const { currencySymbol } = useIntl();

  const { t } = useTranslation();

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
    if (!currentMaterialNavigation && !materialStore.loading && materialsNavigation.length) {
      onMaterialChange?.(materialsNavigation[0]);
    }
  }, [currentMaterialNavigation, materialStore.loading, materialsNavigation, onMaterialChange]);

  useEffect(() => {
    if (currentMaterialNavigation) {
      globalRateStore.requestSurcharges({
        materialId:
          currentMaterialNavigation.key === NONE_MATERIAL_KEY
            ? undefined
            : Number.parseInt(currentMaterialNavigation.key, 10),
        businessLineId,
        businessUnitId,
      });
    }
  }, [
    currentMaterialNavigation,
    globalRateStore,
    globalRateStore.isPreconditionFailed,
    businessLineId,
    businessUnitId,
  ]);

  const handleShowHistory = useCallback(
    (surchargeId: number, description?: string) => {
      if (currentMaterialNavigation) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          surchargeId,
          materialId:
            currentMaterialNavigation.key === NONE_MATERIAL_KEY
              ? null
              : Number.parseInt(currentMaterialNavigation.key, 10),
          entityType: RatesEntityType.globalRatesSurcharges,
        };

        const materialLabel = materialStore.getById(+currentMaterialNavigation.key)?.description;

        onShowRatesHistory(ratesHistoryParams, [description, materialLabel].join(' • '));
      }
    },
    [businessLineId, businessUnitId, currentMaterialNavigation, materialStore, onShowRatesHistory],
  );

  return (
    <Layouts.Grid
      as={Layouts.Box}
      columns="320px auto"
      height="100%"
      minHeight="100%"
      backgroundColor="white"
    >
      <Layouts.Scroll>
        <Navigation
          activeTab={currentMaterialNavigation}
          configs={materialStore.loading ? materialsLoadingNavigationConfig : materialsNavigation}
          onChange={onMaterialChange}
          className={styles.materialsNavigation}
          direction="column"
        />
      </Layouts.Scroll>
      <Layouts.Scroll>
        <div className={styles.wrapper}>
          {globalRateStore.surchargesLoading ? (
            <FormSkeleton />
          ) : (
            <Table>
              <thead>
                <tr>
                  <th className={cx(styles.title, styles.left)}>{t('Text.Items')}</th>
                  <th className={cx(styles.title, styles.right)}>{t('Text.Units')}</th>
                  <th className={cx(styles.title, styles.right)}>
                    <Layouts.Margin right="1" as="span">
                      <WarningTooltip
                        position="top"
                        text={t(`${I18N_PATH}EnsureValueInCorrectFormat`)}
                      />
                    </Layouts.Margin>
                    {t('Text.Value')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {values.surcharges?.map((surcharge, index) => {
                  const surchargeService = surchargeStore.getById(surcharge.surchargeId);

                  const inputPath = `surcharges[${index}].price`;
                  const symbol =
                    surchargeService?.calculation === SurchargeCalculation.Flat
                      ? currencySymbol
                      : '%';

                  return (
                    <tr key={surcharge.surchargeId} className={styles.historyLabel}>
                      <td className={cx(styles.cell, styles.large, styles.label)}>
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
                      </td>
                      <td className={cx(styles.cell, styles.label, styles.right)}>{symbol}</td>
                      <td className={cx(styles.cell, styles.midSize)}>
                        <div className={styles.inputWrapper}>
                          <FormInput
                            name={inputPath}
                            type="number"
                            ariaLabel={`${surchargeService?.description ?? ''} value, ${symbol}`}
                            key="price"
                            value={values.surcharges[index].price}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={getIn(errors, inputPath)}
                            wrapClassName={styles.input}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>
      </Layouts.Scroll>
    </Layouts.Grid>
  );
};

export default observer(SurchargeForm);
