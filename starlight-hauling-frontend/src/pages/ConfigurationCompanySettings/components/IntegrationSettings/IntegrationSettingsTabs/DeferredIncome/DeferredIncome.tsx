import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
  Divider,
} from '@root/common/TableTools';
import { Typography } from '@root/common';
import Select from 'react-select';
import { CollapsibleBar, Layouts, Button } from '@starlightpro/shared-components';

import { useStores } from '@root/hooks';
import { QbAddAccountModal } from '@root/components/modals';
import { DeleteIcon, PlusIcon } from '@root/assets';
import { customStyles } from '../styles';
import styles from '../css/styles.scss';
import {
  BusinessLine,
  CustomerGroup,
  EquipmentItem,
  LineItem,
  Material,
  Surcharge,
  Threshold,
} from '../../../../../../stores/entities';
import {
  IBasicData,
  IQbAccounts,
  IQbBillableItems,
  IQbBillableItemsData,
  IQbBillableItemsortedAccounts,
  ISubscriptionBillingCycleOptions,
} from '../../../../../../types';
const I18N_PATH =
  'pages.SystemConfiguration.tables.CompanySettings.components.QbIntegrationSettings.Tabs.Text.';

interface routeParams {
  id: string;
}

const subscriptionBillingCycleOptions: ISubscriptionBillingCycleOptions[] = [
  {
    label: 'Monthly',
    value: 1,
  },
  {
    label: 'Quarterly',
    value: 2,
  },
  {
    label: 'Yearly',
    value: 3,
  },
];

const DeferredIncome: React.FC = () => {
  const {
    qbAccountsStore,
    qbBillableItemsStore,
    businessLineStore,
    lineItemStore,
    thresholdStore,
    surchargeStore,
    materialStore,
    equipmentItemStore,
    customerGroupStore,
  } = useStores();
  const [newBillableItemsSetup, setNewBillableItemsSetup] = useState<IQbBillableItems[]>();
  const [sortedAccounts, setSortedAccounts] = useState<IQbBillableItemsortedAccounts[]>();
  const [bussinessLineOptions, setBussinessLineOptions] = useState<IBasicData[]>();
  const [customerGroupOptions, setCustomerGroupOptions] = useState<IBasicData[]>();
  const [equipmentItemOptions, setEquipmentItemOptions] = useState<IBasicData[]>();
  const [materialOptions, setMaterialOptions] = useState<IBasicData[]>();
  const [billableItemsOptions, setBillableItemsOptions] = useState<IBasicData[]>();
  const { t } = useTranslation();
  const { id } = useParams<routeParams>();
  const doNothing = useCallback(() => {}, []);
  const closeModal = useCallback(() => {
    qbAccountsStore.toggleModal();
  }, []);

  const sortBillableItems = useCallback(
    (billableItems: IQbBillableItems[] | undefined) => {
      const accounts: IQbBillableItemsortedAccounts[] = [];
      billableItems?.forEach((element: IQbBillableItems, index: number) => {
        const lineOfBussinessIndex = businessLineStore.values.find(
          (bussinessLine: BusinessLine) => bussinessLine.id === Number(element.lineOfBussinessId),
        );
        const equipmentItemIndex = equipmentItemStore.values.find(
          (equipmentItem: EquipmentItem) => equipmentItem.id === Number(element.equipmentId),
        );
        const materialIndex = materialStore.values.find(
          (material: Material) => material.id === Number(element.materialId),
        );
        const subscriptionBillingCycleIndex = subscriptionBillingCycleOptions.find(
          (billingCycle: ISubscriptionBillingCycleOptions) =>
            billingCycle.value === Number(element.subscriptionBillingCycle),
        );
        if (index == 0) {
          accounts.push({
            accountName: element.accountName,
            billableItems: [
              {
                id: element.id,
                description: element.description,
                subscriptionBillingCycleName: subscriptionBillingCycleIndex?.label,
                subscriptionBillingCycle: subscriptionBillingCycleIndex?.value,
                lineOfBussiness: lineOfBussinessIndex?.name,
                lineOfBussinessId: Number(element.lineOfBussinessId),
                material: materialIndex?.description,
                materialId: Number(element.materialId),
                equipment: equipmentItemIndex?.description,
                equipmentId: Number(element.equipmentId),
                customerGroup: element.customerGroup,
                customerGroupId: element.customerGroupId,
                type: element.type,
              },
            ],
          });
        } else {
          const accountIndex = accounts.findIndex(
            (account: IQbBillableItemsortedAccounts) => account.accountName === element.accountName,
          );
          if (accountIndex !== -1) {
            accounts[accountIndex].billableItems?.push({
              id: element.id,
              description: element.description,
              subscriptionBillingCycleName: subscriptionBillingCycleIndex?.label,
              subscriptionBillingCycle: subscriptionBillingCycleIndex?.value,
              lineOfBussiness: lineOfBussinessIndex?.name,
              lineOfBussinessId: Number(element.lineOfBussinessId),
              material: materialIndex?.description,
              materialId: Number(element.materialId),
              equipment: equipmentItemIndex?.description,
              equipmentId: Number(element.equipmentId),
              customerGroup: element.customerGroup,
              customerGroupId: element.customerGroupId,
              type: element.type,
            });
          } else {
            accounts.push({
              accountName: element.accountName,
              billableItems: [
                {
                  id: element.id,
                  description: element.description,
                  subscriptionBillingCycleName: subscriptionBillingCycleIndex?.label,
                  subscriptionBillingCycle: subscriptionBillingCycleIndex?.value,
                  lineOfBussiness: lineOfBussinessIndex?.name,
                  lineOfBussinessId: Number(element.lineOfBussinessId),
                  material: materialIndex?.description,
                  materialId: Number(element.materialId),
                  equipment: equipmentItemIndex?.description,
                  equipmentId: Number(element.equipmentId),
                  customerGroup: element.customerGroup,
                  customerGroupId: element.customerGroupId,
                  type: element.type,
                },
              ],
            });
          }
        }
      });
      setSortedAccounts(accounts);
    },
    [sortedAccounts, businessLineStore],
  );

  useEffect(() => {
    (async () => {
      await businessLineStore.request();
      setBussinessLineOptions(
        businessLineStore.values.map((businessLine: BusinessLine) => ({
          label: businessLine.name,
          value: businessLine.id,
        })),
      );
      await lineItemStore.request({});
      await thresholdStore.request({});
      await surchargeStore.request({});
      setBillableItemsOptions([
        ...lineItemStore.values.map((lineItem: LineItem) => ({
          label: lineItem.description,
          value: lineItem.id,
          type: 'lineItem',
        })),
        ...thresholdStore.values.map((treshold: Threshold) => ({
          label: treshold.description,
          value: treshold.id,
          type: 'treshold',
        })),
        ...surchargeStore.values.map((surcharge: Surcharge) => ({
          label: surcharge.description,
          value: surcharge.id,
          type: 'surcharge',
        })),
      ]);
      await materialStore.request({});
      setMaterialOptions(
        materialStore.values.map((material: Material) => ({
          label: material.description,
          value: material.id,
        })),
      );
      await equipmentItemStore.request({});
      setEquipmentItemOptions(
        equipmentItemStore.values.map((equipmentItem: EquipmentItem) => ({
          label: equipmentItem.description,
          value: equipmentItem.id,
        })),
      );
      await customerGroupStore.request({});
      setCustomerGroupOptions(
        customerGroupStore.values.map((customerGroup: CustomerGroup) => ({
          label: customerGroup.description,
          value: customerGroup.id,
        })),
      );
      await qbBillableItemsStore.request(Number(id), ['lineItem', 'surcharge']);
      setNewBillableItemsSetup(qbBillableItemsStore.values);
      sortBillableItems(qbBillableItemsStore.values);
    })();
  }, [qbBillableItemsStore, businessLineStore]);

  const deleteBillableItem = useCallback(
    (idNumber: number) => {
      const temporarySetup = newBillableItemsSetup;
      const billableItemIndex = temporarySetup?.findIndex(
        (billableItem: IQbBillableItems) => billableItem.id === idNumber,
      );
      if (billableItemIndex !== undefined && (billableItemIndex > 0 || billableItemIndex === 0)) {
        temporarySetup?.splice(billableItemIndex, 1);
        setNewBillableItemsSetup(temporarySetup);
        sortBillableItems(newBillableItemsSetup);
      }
    },
    [newBillableItemsSetup],
  );

  const getAddAccountsSubmit = (filteredAccounts: IQbAccounts[] | undefined) => {
    const newAccounts: IQbBillableItemsortedAccounts[] | undefined = sortedAccounts;
    filteredAccounts?.forEach((filteredAccount: IQbAccounts) => {
      const accountIndex = newAccounts?.findIndex(
        (account: IQbBillableItemsortedAccounts) => account.accountName === filteredAccount.name,
      );
      if (accountIndex === -1) {
        newAccounts?.push({
          accountName: filteredAccount.name,
          billableItems: [],
        });
      }
    });
    setSortedAccounts(newAccounts);
    closeModal();
  };

  const addNewLine = (accountIndex: number, accountName: string) => {
    const newAccounts = sortedAccounts?.map(account => {
      if (account.accountName === accountName) {
        account.billableItems?.push({
          id: `${accountIndex}-${account.billableItems?.length ?? 0}`,
          description: '',
          subscriptionBillingCycleName: '',
          subscriptionBillingCycle: '',
          lineOfBussiness: '',
          lineOfBussinessId: '',
          material: '',
          materialId: '',
          equipment: '',
          equipmentId: '',
          customerGroup: '',
          customerGroupId: '',
          type: '',
        });
      }
      return account;
    });
    setSortedAccounts(newAccounts);
  };

  const handleSelectChange = (
    billableItemId: number,
    selectedOption: IBasicData,
    selectType: string,
  ) => {
    const newAccounts = sortedAccounts?.map((account: IQbBillableItemsortedAccounts) => {
      const newBillableItems = account.billableItems?.map((billableItem: IQbBillableItemsData) => {
        if (billableItem.id === billableItemId) {
          let typeIndex;
          switch (selectType) {
            case 'subscriptionBillingCycle':
              typeIndex = subscriptionBillingCycleOptions?.find(
                (subscriptionBillingCycle: ISubscriptionBillingCycleOptions) =>
                  subscriptionBillingCycle.value === selectedOption.value,
              );
              billableItem.subscriptionBillingCycleName = typeIndex?.label;
              billableItem.subscriptionBillingCycle = typeIndex?.value;
              break;
            case 'lineOfBussinessId':
              typeIndex = businessLineStore.values?.find(
                (bussinesLine: BusinessLine) => bussinesLine.id === selectedOption.value,
              );
              billableItem.lineOfBussiness = typeIndex?.name;
              billableItem.lineOfBussinessId = typeIndex?.id as number;
              break;
            case 'materialId':
              typeIndex = materialStore.values?.find(
                (material: Material) => material.id === selectedOption.value,
              );
              billableItem.material = typeIndex?.description;
              billableItem.materialId = typeIndex?.id as number;
              break;
            case 'equipmentId':
              typeIndex = equipmentItemStore.values?.find(
                (equipment: EquipmentItem) => equipment.id === selectedOption.value,
              );
              billableItem.equipment = typeIndex?.description;
              billableItem.equipmentId = typeIndex?.id as number;
              break;
            case 'customerGroupId':
              typeIndex = customerGroupStore.values?.find(
                (customerGroup: CustomerGroup) => customerGroup.id === selectedOption.value,
              );
              billableItem.customerGroup = typeIndex?.description as string;
              billableItem.customerGroupId = typeIndex?.id as number;
              break;
            case 'billableItem':
              typeIndex = billableItemsOptions?.find(
                (billableItemOption: IBasicData) =>
                  billableItemOption.value === selectedOption.value,
              );
              billableItem.description = typeIndex?.label as string;
              billableItem.type = typeIndex?.type as string;
              break;
            default:
              break;
          }
        }
        return billableItem;
      });
      account.billableItems = newBillableItems;
      return account;
    });
    setSortedAccounts(newAccounts);
  };

  const saveConfig = useCallback(async () => {
    await qbBillableItemsStore.insertMany(
      Number(id),
      sortedAccounts as IQbBillableItemsortedAccounts[],
      ['lineItem', 'surcharge'],
    );
  }, [qbBillableItemsStore, sortedAccounts]);

  return (
    <>
      <QbAddAccountModal
        isOpen={qbAccountsStore.isOpenModal}
        onClose={closeModal}
        onFormSubmit={getAddAccountsSubmit}
      />
      <TableTools.ScrollContainer>
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50}>
              {t(`${I18N_PATH}IncomeAccount`)}
            </TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>
              {t(`${I18N_PATH}SubscriptionBillingCycle`)}
            </TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>
              {t(`${I18N_PATH}LineOfBusiness`)}
            </TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>{t(`${I18N_PATH}Service`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>{t(`${I18N_PATH}Material`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>
              {t(`${I18N_PATH}Equipment`)}
            </TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>
              {t(`${I18N_PATH}CostumerGroup`)}
            </TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody cells={7}>
            {sortedAccounts?.map((account: IQbBillableItemsortedAccounts, accountIndex: number) => (
              <TableRow key={accountIndex}>
                <TableCell colSpan={7}>
                  <div style={{ width: '100%' }}>
                    <CollapsibleBar
                      arrowLeft
                      label={<Typography variant="headerFive">{account.accountName}</Typography>}
                    >
                      <Layouts.Margin top="2">
                        {account.billableItems?.map(
                          (billableItem: IQbBillableItemsData, index: number) => (
                            <Layouts.Margin bottom="1" key={index}>
                              <Layouts.Grid columns={7} gap="2">
                                <Layouts.Cell>
                                  <Layouts.Flex>
                                    <DeleteIcon
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => deleteBillableItem(billableItem.id as number)}
                                      className={styles.removeIcon}
                                    />
                                    <Layouts.Margin margin="1">
                                      <Typography variant="bodyMedium">{`#${
                                        index + 1
                                      }`}</Typography>
                                    </Layouts.Margin>
                                  </Layouts.Flex>
                                </Layouts.Cell>
                                <Layouts.Cell>
                                  <Select
                                    menuPosition="fixed"
                                    styles={customStyles}
                                    options={subscriptionBillingCycleOptions}
                                    value={{
                                      label: billableItem.subscriptionBillingCycleName as string,
                                      value: billableItem.subscriptionBillingCycle as number,
                                    }}
                                    onChange={selectedOption =>
                                      handleSelectChange(
                                        billableItem.id as number,
                                        selectedOption as IBasicData,
                                        'subscriptionBillingCycle',
                                      )
                                    }
                                  />
                                </Layouts.Cell>
                                <Layouts.Cell>
                                  <Select
                                    menuPosition="fixed"
                                    styles={customStyles}
                                    options={bussinessLineOptions}
                                    value={{
                                      label: billableItem.lineOfBussiness as string,
                                      value: billableItem.lineOfBussinessId as number,
                                    }}
                                    onChange={selectedOption =>
                                      handleSelectChange(
                                        billableItem.id as number,
                                        selectedOption as IBasicData,
                                        'lineOfBussinessId',
                                      )
                                    }
                                  />
                                </Layouts.Cell>
                                <Layouts.Cell>
                                  <Select
                                    menuPosition="fixed"
                                    styles={customStyles}
                                    options={billableItemsOptions}
                                    value={
                                      {
                                        label: billableItem.description,
                                        value: billableItem.description,
                                      } as IBasicData
                                    }
                                    onChange={selectedOption =>
                                      handleSelectChange(
                                        billableItem.id as number,
                                        selectedOption as IBasicData,
                                        'billableItem',
                                      )
                                    }
                                  />
                                </Layouts.Cell>
                                <Layouts.Cell>
                                  <Select
                                    menuPosition="fixed"
                                    styles={customStyles}
                                    options={materialOptions}
                                    value={{
                                      label: billableItem.material as string,
                                      value: billableItem.materialId as number,
                                    }}
                                    onChange={selectedOption =>
                                      handleSelectChange(
                                        billableItem.id as number,
                                        selectedOption as IBasicData,
                                        'materialId',
                                      )
                                    }
                                  />
                                </Layouts.Cell>
                                <Layouts.Cell>
                                  <Select
                                    menuPosition="fixed"
                                    styles={customStyles}
                                    options={equipmentItemOptions}
                                    value={{
                                      label: billableItem.equipment as string,
                                      value: billableItem.equipmentId as number,
                                    }}
                                    onChange={selectedOption =>
                                      handleSelectChange(
                                        billableItem.id as number,
                                        selectedOption as IBasicData,
                                        'equipmentId',
                                      )
                                    }
                                  />
                                </Layouts.Cell>
                                <Layouts.Cell>
                                  <Select
                                    menuPosition="fixed"
                                    styles={customStyles}
                                    options={customerGroupOptions}
                                    value={
                                      {
                                        label: billableItem.customerGroup,
                                        value: billableItem.customerGroupId,
                                      } as IBasicData
                                    }
                                    onChange={selectedOption =>
                                      handleSelectChange(
                                        billableItem.id as number,
                                        selectedOption as IBasicData,
                                        'customerGroupId',
                                      )
                                    }
                                  />
                                </Layouts.Cell>
                              </Layouts.Grid>
                            </Layouts.Margin>
                          ),
                        )}
                      </Layouts.Margin>
                      <Layouts.Flex>
                        <Button
                          variant="none"
                          onClick={() => addNewLine(accountIndex, account.accountName)}
                        >
                          <Layouts.Flex alignItems="center" justifyContent="center">
                            <Layouts.IconLayout height="12px" width="12px">
                              <PlusIcon />
                            </Layouts.IconLayout>
                            <Typography color="information" cursor="pointer" variant="bodyMedium">
                              {'Add Line'}
                            </Typography>
                          </Layouts.Flex>
                        </Button>
                      </Layouts.Flex>
                    </CollapsibleBar>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
      <Layouts.Box minHeight="92px" backgroundColor="white">
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" onClick={doNothing}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" variant="primary" onClick={saveConfig}>
              {t('Text.SaveChanges')}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </>
  );
};

export default observer(DeferredIncome);
