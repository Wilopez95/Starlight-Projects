import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
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
import { Paths } from '@root/consts';
import { customStyles } from '../styles';
import styles from '../css/styles.scss';
import {
  IBasicData,
  IQbAccounts,
  IQbBillableItems,
  IQbBillableItemsData,
  IQbBillableItemsortedAccounts,
} from '../../../../../../types';
import { BusinessLine, CustomerGroup } from '../../../../../../stores/entities';
const I18N_PATH =
  'pages.SystemConfiguration.tables.CompanySettings.components.QbIntegrationSettings.Tabs.Text.';

interface routeParams {
  id: string;
}

const Income: React.FC = () => {
  const { qbAccountsStore, qbBillableItemsStore, businessLineStore, customerGroupStore } =
    useStores();
  const [sortedAccounts, setSortedAccounts] = useState<IQbBillableItemsortedAccounts[]>();
  const [bussinessLineOptions, setBussinessLineOptions] = useState<IBasicData[]>();
  const [customerGroupOptions, setCustomerGroupOptions] = useState<IBasicData[]>();
  const { t } = useTranslation();
  const { id } = useParams<routeParams>();
  const history = useHistory();

  const goBackToQbIntegrations = () => {
    history.push({
      pathname: Paths.SystemConfigurationModule.CompanySettings,
      search: '?tabKey=accountingIntegration',
    });
  };

  const closeModal = useCallback(() => {
    qbAccountsStore.toggleModal();
  }, []);
  const formatBillableItems = (billableItems: IQbBillableItems[]) => {
    const accounts: IQbBillableItemsortedAccounts[] = [];
    billableItems?.forEach((element: IQbBillableItems, index: number) => {
      const lineOfBussinessIndex = businessLineStore.values.find(
        (bussinessLine: BusinessLine) => bussinessLine.id === Number(element.lineOfBussinessId),
      );
      if (index == 0) {
        accounts.push({
          accountName: element.accountName,
          billableItems: [
            {
              id: element.id,
              description: element.description ?? '',
              lineOfBussiness: lineOfBussinessIndex?.name,
              lineOfBussinessId: Number(element.lineOfBussinessId),
              customerGroup: element.customerGroup,
              customerGroupId: element.customerGroupId,
              type: String(element.type),
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
            description: element.description ?? '',
            lineOfBussiness: lineOfBussinessIndex?.name,
            lineOfBussinessId: Number(element.lineOfBussinessId),
            customerGroup: element.customerGroup,
            customerGroupId: element.customerGroupId,
            type: String(element.type),
          });
        } else {
          accounts.push({
            accountName: element.accountName,
            billableItems: [
              {
                id: element.id,
                description: element.description ?? '',
                lineOfBussiness: lineOfBussinessIndex?.name,
                lineOfBussinessId: Number(element.lineOfBussinessId),
                customerGroup: element.customerGroup,
                customerGroupId: element.customerGroupId,
                type: String(element.type),
              },
            ],
          });
        }
      }
    });
    return accounts;
  };

  useEffect(() => {
    (async () => {
      await businessLineStore.request();
      setBussinessLineOptions(
        businessLineStore.values.map((businessLine: BusinessLine) => ({
          label: businessLine.name,
          value: businessLine.id,
        })),
      );

      await customerGroupStore.request({});
      setCustomerGroupOptions(
        customerGroupStore.values.map((customerGroup: CustomerGroup) => ({
          label: customerGroup.description,
          value: customerGroup.id,
        })),
      );

      await qbBillableItemsStore.request(Number(id), ['lineItem']);
      setSortedAccounts(formatBillableItems(qbBillableItemsStore.values));
    })();
  }, [qbBillableItemsStore]);

  const deleteBillableItem = useCallback(
    (accountName, billableItemId) => {
      const temporarySetup: IQbBillableItemsortedAccounts[] = JSON.parse(
        JSON.stringify(sortedAccounts),
      );
      const selectedAccount = temporarySetup?.find(
        (account: IQbBillableItemsortedAccounts) => account.accountName === accountName,
      );
      const billableItemIndex = selectedAccount?.billableItems?.findIndex(
        (billableItem: IQbBillableItemsData) => billableItem.id === billableItemId,
      );
      if (billableItemIndex !== undefined && (billableItemIndex > 0 || billableItemIndex === 0)) {
        selectedAccount?.billableItems?.splice(billableItemIndex, 1);
        setSortedAccounts(temporarySetup);
      }
      if (selectedAccount?.billableItems?.length === 0) {
        const accountIndex = temporarySetup?.findIndex(
          (account: IQbBillableItemsortedAccounts) => account.accountName === accountName,
        );
        if (accountIndex !== undefined && (accountIndex > 0 || accountIndex === 0)) {
          temporarySetup?.splice(accountIndex, 1);
          setSortedAccounts(temporarySetup);
        }
      }
    },
    [sortedAccounts],
  );

  const getAddAccountsSubmit = (filteredAccounts?: IQbAccounts[]) => {
    const newAccounts: IQbBillableItemsortedAccounts[] = JSON.parse(JSON.stringify(sortedAccounts));
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
          id: `${accountIndex}-${account.billableItems?.length}`,
          description: '',
          lineOfBussiness: '',
          lineOfBussinessId: '',
          customerGroup: '',
          customerGroupId: '',
          type: 'lineItem',
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
            case 'lineOfBussinessId':
              typeIndex = businessLineStore.values?.find(
                (bussinesLine: BusinessLine) => bussinesLine.id === selectedOption.value,
              );
              billableItem.lineOfBussiness = typeIndex?.name;
              billableItem.lineOfBussinessId = typeIndex?.id;
              break;
            case 'customerGroupId':
              typeIndex = customerGroupStore.values?.find(
                (customerGroup: CustomerGroup) => customerGroup.id === selectedOption.value,
              );
              billableItem.customerGroup = typeIndex?.description;
              billableItem.customerGroupId = typeIndex?.id;
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

  const saveConfig = () => {
    qbBillableItemsStore.insertMany(Number(id), sortedAccounts as IQbBillableItemsortedAccounts[], [
      'lineItem',
    ]);
  };

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
            <TableTools.HeaderCell>{t(`${I18N_PATH}IncomeAccount`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}LineOfBusiness`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}CostumerGroup`)}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody cells={3}>
            {sortedAccounts?.map((account: IQbBillableItemsortedAccounts, accountIndex: number) => (
              <TableRow key={accountIndex}>
                <TableCell colSpan={3}>
                  <div style={{ width: '100%' }}>
                    <CollapsibleBar
                      arrowLeft
                      label={<Typography variant="headerFive">{account.accountName}</Typography>}
                    >
                      <Layouts.Margin top="2">
                        {account.billableItems?.map(
                          (billableItem: IQbBillableItemsData, index: number) => (
                            <Layouts.Margin bottom="1" key={index}>
                              <Layouts.Grid columns={3} gap="2">
                                <Layouts.Cell>
                                  <Layouts.Flex>
                                    <DeleteIcon
                                      role="button"
                                      tabIndex={0}
                                      onClick={() =>
                                        deleteBillableItem(account.accountName, billableItem.id)
                                      }
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
                                    options={bussinessLineOptions}
                                    value={
                                      {
                                        label: billableItem.lineOfBussiness,
                                        value: billableItem.lineOfBussinessId,
                                      } as IBasicData
                                    }
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
            <Button type="reset" onClick={goBackToQbIntegrations}>
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

export default observer(Income);
