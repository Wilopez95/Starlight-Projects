import React, { useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, FormContainer, FormInput, Layouts } from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormik } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TablePageContainer,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBusinessContext, useCleanup, useCrudPermissions, useStores } from '@root/hooks';

import { PageHeader } from '../../components';
import { type ISystemConfigurationTable } from '../../types';

import configurationStyle from '../../css/styles.scss';
import {
  FormDataType,
  getInventoryInitialValues,
  inventoryValidationSchema,
  normalize,
} from './formikData';
import { InventoryRolloff } from './IntentoryRolloff';

const I18N_PATH = 'pages.SystemConfiguration.tables.Inventory.Text.';

const InventoryTable: React.FC<ISystemConfigurationTable> = ({ className }) => {
  const tableScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { inventoryStore, businessLineStore } = useStores();
  const tbodyContainerRef = useRef(null);
  const { t } = useTranslation();
  const [canViewInventory] = useCrudPermissions('configuration', 'inventory');

  const { businessLineId, businessUnitId } = useBusinessContext();

  useEffect(() => {
    if (canViewInventory) {
      inventoryStore.request(businessUnitId, businessLineId);
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [inventoryStore, businessUnitId, businessLineId, canViewInventory]);

  useCleanup(inventoryStore);

  const handleSaveChanges = useCallback(
    ({ inventory }: FormDataType) => {
      const isInvalid = !!inventory.find(
        item => item.totalQuantity - item.onRepairQuantity - item.onJobSiteQuantity < 0,
      );

      if (isInvalid) {
        return;
      }

      const normalizedData = normalize(inventory);

      inventoryStore.updateInventory(businessUnitId, normalizedData);
    },
    [businessUnitId, inventoryStore],
  );

  const formik = useFormik({
    enableReinitialize: true,
    onSubmit: handleSaveChanges,
    initialValues: getInventoryInitialValues(inventoryStore.values),
    validationSchema: inventoryValidationSchema,
  });

  const { values, errors, handleChange, handleSubmit } = formik;

  return (
    <TablePageContainer className={className}>
      <Helmet title={t('Titles.Inventory')} />
      <PageHeader title="Inventory" hideActions />
      {businessLineStore.isRollOffType(businessLineId) ? (
        <InventoryRolloff />
      ) : (
        <>
          <Layouts.Scroll ref={tableScrollContainerRef} overflowY="hidden">
            <FormContainer formik={formik} fullHeight>
              <TableTools.ScrollContainer>
                <Table>
                  <TableTools.Header>
                    <TableTools.HeaderCell minWidth={100} full>
                      {t(`Text.Equipment`)}
                    </TableTools.HeaderCell>
                    <TableTools.HeaderCell minWidth={120}>
                      {t(`${I18N_PATH}TotalQty`)}
                    </TableTools.HeaderCell>
                    <TableTools.HeaderCell minWidth={120}>
                      {t(`${I18N_PATH}OnRepair`)}
                    </TableTools.HeaderCell>
                    <TableTools.HeaderCell minWidth={120}>
                      {t(`${I18N_PATH}OnJobSite`)}
                    </TableTools.HeaderCell>
                    <TableTools.HeaderCell minWidth={120}>
                      {t(`${I18N_PATH}Available`)}
                    </TableTools.HeaderCell>
                  </TableTools.Header>
                  <TableBody loading={inventoryStore.loading} ref={tbodyContainerRef} cells={5}>
                    <FieldArray name="inventory">
                      {() => {
                        return values.inventory.map((item, index) => {
                          const availableQuantity =
                            item.totalQuantity - item.onRepairQuantity - item.onJobSiteQuantity;

                          return (
                            <TableRow key={item.id} className={configurationStyle.customRow}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell titleClassName={configurationStyle.tableCellTitle}>
                                <FormInput
                                  type="number"
                                  name={`inventory.${index}.totalQuantity`}
                                  onChange={handleChange}
                                  value={item.totalQuantity}
                                  borderError={!!getIn(errors, `inventory[${index}].totalQuantity`)}
                                />
                              </TableCell>
                              <TableCell titleClassName={configurationStyle.tableCellTitle}>
                                <FormInput
                                  type="number"
                                  name={`inventory.${index}.onRepairQuantity`}
                                  onChange={handleChange}
                                  value={item.onRepairQuantity}
                                  borderError={
                                    !!getIn(errors, `inventory[${index}].onRepairQuantity`)
                                  }
                                />
                              </TableCell>
                              <TableCell titleClassName={configurationStyle.tableCellTitle}>
                                <FormInput
                                  type="number"
                                  name={`inventory.${index}.onJobSiteQuantity`}
                                  onChange={noop}
                                  value={item.onJobSiteQuantity || 0}
                                  disabled
                                />
                              </TableCell>
                              <TableCell titleClassName={configurationStyle.tableCellTitle}>
                                <FormInput
                                  type="number"
                                  name={`inventory.${index}.availableQuantity`}
                                  onChange={noop}
                                  value={availableQuantity}
                                  disabled
                                  borderError={availableQuantity < 0}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        });
                      }}
                    </FieldArray>
                  </TableBody>
                </Table>
              </TableTools.ScrollContainer>
            </FormContainer>
          </Layouts.Scroll>
          <Layouts.Box minHeight="92px" backgroundColor="white">
            <Divider />
            <Layouts.Padding top="3" left="4" right="4">
              <Layouts.Flex justifyContent="flex-end">
                <Button
                  variant="primary"
                  onClick={() => {
                    handleSubmit();
                  }}
                >
                  {t('Text.SaveChanges')}
                </Button>
              </Layouts.Flex>
            </Layouts.Padding>
          </Layouts.Box>
        </>
      )}
    </TablePageContainer>
  );
};

export default observer(InventoryTable);
