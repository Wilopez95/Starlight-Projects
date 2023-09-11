import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { HistoryIcon } from '@root/assets';
import { Badge, FormInput, WarningTooltip } from '@root/common';
import { Table } from '@root/common/TableTools';
import { SurchargeCalculation } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { RatesEntityType } from '@root/modules/pricing/const';

import { FormSkeleton, MaterialNavItem } from '../../../../components';

import styles from '../../../../css/styles.scss';
import { materialsLoadingNavigationConfig } from './navigationConfigs';
import { type ISurchargeForm, type ISurchargeGeneralRateFormikData } from './types';

const SurchargeForm: React.FC<ISurchargeForm> = ({
  currentMaterialNavigation,
  onMaterialChange,
  onShowRatesHistory,
}) => {
  const { values, errors, handleChange, handleBlur } =
    useFormikContext<ISurchargeGeneralRateFormikData>();

  const { generalRateStoreNew, surchargeStore, materialStore } = useStores();
  const { businessUnitId, businessLineId } = useBusinessContext();
  const { currencySymbol } = useIntl();

  const { t } = useTranslation();

  const materialsNavigation: NavigationConfigItem<string | null>[] = useMemo(
    () => [
      { label: t('Form.NoneMaterial'), key: null, index: 0 },
      ...materialStore.sortedValues.map((material, index) => ({
        label: <MaterialNavItem text={material.description} active={material.active} />,
        key: material.id.toString(),
        index: index + 1,
      })),
    ],
    [materialStore.sortedValues, t],
  );

  useEffect(() => {
    if (!currentMaterialNavigation && !materialStore.loading && materialsNavigation.length) {
      onMaterialChange?.(materialsNavigation[0]);
    }
  }, [currentMaterialNavigation, materialStore.loading, materialsNavigation, onMaterialChange]);

  useEffect(() => {
    (async () => {
      await generalRateStoreNew.request({
        businessUnitId,
        businessLineId,
        entityType: RatesEntityType.surcharge,
      });

      if (currentMaterialNavigation) {
        generalRateStoreNew.filterSurchargeRatesByParameters({
          materialId: currentMaterialNavigation.key
            ? Number.parseInt(currentMaterialNavigation.key, 10)
            : null,
        });
      }
    })();
  }, [currentMaterialNavigation, generalRateStoreNew, businessLineId, businessUnitId]);

  const handleShowHistory = useCallback(
    (surchargeId: number, description?: string) => {
      if (currentMaterialNavigation) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          surchargeId,
          materialId: currentMaterialNavigation.key
            ? Number.parseInt(currentMaterialNavigation.key, 10)
            : null,
          entityType: RatesEntityType.surcharge,
        };

        const materialLabel = currentMaterialNavigation.key
          ? materialStore.getById(+currentMaterialNavigation.key)?.description
          : t('Form.NoneMaterial');

        onShowRatesHistory(ratesHistoryParams, [description, materialLabel].join(' • '));
      }
    },
    [
      businessLineId,
      businessUnitId,
      currentMaterialNavigation,
      materialStore,
      onShowRatesHistory,
      t,
    ],
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
          {generalRateStoreNew.loading ? (
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
                        text={t('ValidationErrors.EnsureValueInCorrectFormat')}
                      />
                    </Layouts.Margin>
                    {t('Text.Value')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {values.surcharge?.map((surcharge, index) => {
                  const surchargeService = surchargeStore.getById(surcharge.surchargeId);

                  const inputPath = `surcharge[${index}].price`;

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
                      <td className={cx(styles.cell, styles.label, styles.right)}>
                        {surchargeService?.calculation === SurchargeCalculation.Flat
                          ? currencySymbol
                          : '%'}
                      </td>
                      <td className={cx(styles.cell, styles.midSize)}>
                        <div className={styles.inputWrapper}>
                          <FormInput
                            name={inputPath}
                            type="number"
                            key="price"
                            value={values.surcharge[index].price}
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
