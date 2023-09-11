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
import { NONE_MATERIAL_KEY } from '@root/consts';
import { getUnitLabel } from '@root/helpers';
import { useBusinessContext, useStores, useUserContext } from '@root/hooks';
import { RatesEntityType } from '@root/types';

import { FormSkeleton, MaterialNavItem } from '../../components';

import styles from '../../css/styles.scss';
import { materialsLoadingNavigationConfig } from './navigationConfigs';
import { type IGlobalRateLineItemFormikData, type ILineItemForm } from './types';

const I18N_PATH = 'components.forms.Rates.Global.Form.';

const LineItemForm: React.FC<ILineItemForm> = ({
  currentMaterialNavigation,
  onMaterialChange,
  onShowRatesHistory,
}) => {
  const { values, errors, handleChange, handleBlur } =
    useFormikContext<IGlobalRateLineItemFormikData>();

  const { businessLineStore, globalRateStore, lineItemStore, materialStore } = useStores();
  const { businessUnitId, businessLineId } = useBusinessContext();
  const { t } = useTranslation();
  const { currentUser } = useUserContext();

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const materialsNavigation: NavigationConfigItem<string>[] = useMemo(
    () => [
      { label: 'None Material', key: NONE_MATERIAL_KEY, index: 0 },
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
    [isRecyclingLoB, materialStore.sortedValues],
  );

  useEffect(() => {
    if (!currentMaterialNavigation && !materialStore.loading && materialsNavigation.length) {
      onMaterialChange?.(materialsNavigation[0]);
    }
  }, [currentMaterialNavigation, materialStore.loading, materialsNavigation, onMaterialChange]);

  useEffect(() => {
    if (currentMaterialNavigation) {
      globalRateStore.requestLineItems({
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
    (lineItemId: number, description?: string) => {
      if (currentMaterialNavigation) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          lineItemId,
          materialId:
            currentMaterialNavigation.key === NONE_MATERIAL_KEY
              ? null
              : Number.parseInt(currentMaterialNavigation.key, 10),
          entityType: RatesEntityType.globalRatesLineItems,
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
          {globalRateStore.lineItemsLoading ? (
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
                {values.lineItems?.map((lineItem, index) => {
                  const lineItemService = lineItemStore.getById(lineItem.lineItemId);

                  const inputPath = `lineItems[${index}].price`;

                  return (
                    <tr key={lineItem.lineItemId} className={styles.historyLabel}>
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
                                handleShowHistory(lineItem.lineItemId, lineItemService?.description)
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
                            ariaLabel={`${lineItemService?.description ?? ''} general rack rates`}
                            key="price"
                            value={values.lineItems[index].price}
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
