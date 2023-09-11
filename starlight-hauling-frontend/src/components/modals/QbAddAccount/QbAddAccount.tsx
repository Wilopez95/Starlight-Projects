import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Modal } from '@root/common';
import { Layouts, Button } from '@starlightpro/shared-components';
import { Typography } from '@root/common/Typography/Typography';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
  TableCheckboxCell,
} from '@root/common/TableTools';
import { useStores } from '@hooks';
import { IQbAccounts } from '../../../types';
import styles from './css/styles.scss';
interface routeParams {
  id: string;
}
interface IQbAddAccountModal {
  isOpen: boolean;
  onClose: () => void;
  onFormSubmit: (filteredAccounts?: IQbAccounts[]) => void;
}

const QbAddAccountModal = ({ isOpen, onClose, onFormSubmit }: IQbAddAccountModal) => {
  const { qbAccountsStore } = useStores();
  const [accounts, setAccounts] = useState<IQbAccounts[]>();
  const [allAccountsSelected, setAllAccountsSelected] = useState<boolean>(false);
  const { id } = useParams<routeParams>();
  useEffect(() => {
    (async () => {
      await qbAccountsStore.request(Number(id));
      setAccounts(
        qbAccountsStore.values.map((element: IQbAccounts) => ({ ...element, checked: false })),
      );
    })();
  }, [qbAccountsStore]);

  const checkAllAccounts = useCallback(
    value => {
      const tempAccounts = accounts?.map(account => {
        account.checked = !value;
        return account;
      });
      setAccounts(tempAccounts);
    },
    [accounts],
  );

  const checkOneAccount = useCallback(
    (idNum, value) => {
      const tempAccounts = accounts?.map(account => {
        if (account.id === idNum) {
          account.checked = value;
        }
        return account;
      });
      setAccounts(tempAccounts);
    },
    [accounts],
  );

  const saveData = () => {
    const tempAccounts = accounts?.filter((account: IQbAccounts) => account.checked);
    onFormSubmit(tempAccounts);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <Layouts.Padding padding="2.5">
        <Typography variant="headerTwo">Select Accounts to Add</Typography>
      </Layouts.Padding>
      <Divider />
      <TableTools.ScrollContainer>
        <Table>
          <TableTools.Header>
            <TableCheckboxCell
              header
              name="allParameters"
              value={allAccountsSelected}
              onChange={() => {
                setAllAccountsSelected(!allAccountsSelected);
                checkAllAccounts(allAccountsSelected);
              }}
            />
            <TableTools.HeaderCell minWidth={50}>{'Account ID'}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>{'Name'}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>{'Type'}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody cells={4}>
            {accounts?.map(account => (
              <TableRow key={`row-${account.id}`}>
                <TableCheckboxCell
                  key={account.id}
                  name="parameter"
                  value={account.checked}
                  onChange={e => {
                    checkOneAccount(account.id, e.target.checked);
                  }}
                />
                <TableCell>
                  <Typography variant="bodyMedium">{account.quickBooksId}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="bodyMedium">{account.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="bodyMedium">{account.type}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
      <Layouts.Padding padding="2.5">
        <Layouts.Flex justifyContent="space-between">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={saveData}>
            Add Selected Accounts
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </Modal>
  );
};

export default QbAddAccountModal;
