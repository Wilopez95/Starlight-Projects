import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormikContext } from 'formik';
import { capitalize, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { HistoryIcon } from '@root/assets';
import { Badge, FormInput, Protected } from '@root/common';
import { Table } from '@root/common/TableTools';
import { getUnitLabel } from '@root/helpers';
import { useBusinessContext, useStores, useUserContext } from '@root/hooks';
import { RatesEntityType } from '@root/modules/pricing/const';

import { FormSkeleton, MaterialNavItem } from '../../../../components';

import styles from '../../../../css/styles.scss';
import { materialsLoadingNavigationConfig } from './navigationConfigs';
import { type ILineItemForm, type ILineItemGeneralRateFormikData } from './types';

const I18N_PATH = 'modules.pricing.GeneralRate.components.forms.Text.';

const LineItemForm: React.FC<ILineItemForm> = ({
  currentMaterialNavigation,
  onMaterialChange,
  onShowRatesHistory,
}) => {
  const { values, errors, handleChange, handleBlur } =
    useFormikContext<ILineItemGeneralRateFormikData>();

  const { businessLineStore, generalRateStoreNew, lineItemStore, materialStore } = useStores();
  const { businessUnitId, businessLineId } = useBusinessContext();
  const { t } = useTranslation();
  const { currentUser } = useUserContext();

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const materialsNavigation: NavigationConfigItem<string | null>[] = useMemo(
    () => [
      { label: t('Form.NoneMaterial'), key: null, index: 0 },
      ...materialStore.sortedValues
        .filter(
          material =>
            !isRecyclingLoB || material.useForDump || material.useForLoad || material.misc,
        )
        .map((material, index) => ({
          label: <MaterialNavItem text={material.description} active={material.active} />,
          key: material.id.toString(),
          index: index + 1,
        })),
    ],
    [isRecyclingLoB, materialStore.sortedValues, t],
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
        entityType: RatesEntityType.oneTimeLineItem,
      });

      if (currentMaterialNavigation) {
        generalRateStoreNew.filterOneTimeLineItemRatesByParameters({
          materialId: currentMaterialNavigation.key
            ? Number.parseInt(currentMaterialNavigation.key, 10)
            : null,
        });
      }
    })();
  }, [businessLineId, businessUnitId, currentMaterialNavigation, generalRateStoreNew]);

  useEffect(() => {}, [
    currentMaterialNavigation,
    generalRateStoreNew,
    businessLineId,
    businessUnitId,
  ]);

  const handleShowHistory = useCallback(
    (lineItemId: number, description?: string) => {
      if (currentMaterialNavigation) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          lineItemId,
          materialId: currentMaterialNavigation.key
            ? Number.parseInt(currentMaterialNavigation.key, 10)
            : null,
          entityType: RatesEntityType.oneTimeLineItem,
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
                  <th className={cx(styles.title, styles.left)}>{t(`${I18N_PATH}Items`)}</th>
                  <th className={cx(styles.title, styles.left)}>{t('Text.Type')}</th>
                  <th className={cx(styles.title, styles.right)}>{t(`${I18N_PATH}Unit`)}</th>
                  <th className={cx(styles.title, styles.right)}>
                    {t(`${I18N_PATH}GeneralRackRates`)}, $
                  </th>
                </tr>
              </thead>
              <tbody>
                {values.oneTimeLineItem?.map((lineItem, index) => {
                  const lineItemService = lineItemStore.getById(lineItem.billableLineItemId);

                  const inputPath = `oneTimeLineItem[${index}].price`;

                  return (
                    <tr key={lineItem.billableLineItemId} className={styles.historyLabel}>
                      <td className={cx(styles.cell, styles.large, styles.label)}>
                        <Layouts.Flex alignItems="center">
                          {lineItemService?.description}
                          {!lineItemService?.active ? (
                            <Badge color="alert" className={styles.inactive}>
                              {t(`${I18N_PATH}Inactive`)}
                            </Badge>
                          ) : null}
                          <Protected permissions="configuration/price-groups:view-history:perform">
                            <HistoryIcon
                              className={styles.rateHistoryIcon}
                              onClick={() =>
                                handleShowHistory(
                                  lineItem.billableLineItemId,
                                  lineItemService?.description,
                                )
                              }
                            />
                          </Protected>
                        </Layouts.Flex>
                      </td>
                      <td className={cx(styles.cell, styles.label, styles.left)}>
                        {startCase(lineItemService?.type)}
                      </td>
                      <td className={cx(styles.cell, styles.label, styles.right)}>
                        {capitalize(
                          getUnitLabel(lineItemService?.unit, currentUser?.company?.unit),
                        )}
                      </td>
                      <td className={cx(styles.cell, styles.midSize)}>
                        <div className={styles.inputWrapper}>
                          <FormInput
                            name={inputPath}
                            type="number"
                            ariaLabel="Price"
                            key="price"
                            value={values.oneTimeLineItem[index].price}
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

export default observer(LineItemForm);
