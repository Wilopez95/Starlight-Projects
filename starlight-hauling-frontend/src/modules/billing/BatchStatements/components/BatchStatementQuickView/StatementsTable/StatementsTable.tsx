import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import {
  Table,
  TableBody,
  TableCheckboxCell,
  TableTools,
} from '../../../../../../common/TableTools';
import { useStores } from '../../../../../../hooks';
import { INewBatchStatement } from '../../../types';

import { StatementRow } from './StatementRow';

const I18N_PATH = 'quickViews.BatchStatement.BatchStatementQuickView.StatementsTable.';
const StatementsTable: React.FC = () => {
  const { t } = useTranslation();

  const { batchStatementStore } = useStores();

  const selectedBatchStatement = batchStatementStore.selectedEntity;
  const isLoading = batchStatementStore.quickViewLoading;

  const { values, setFieldValue } = useFormikContext<INewBatchStatement>();

  const statementsCount = selectedBatchStatement?.statements?.length ?? 0;
  const checkedStatementsCount = values.statementIds?.length ?? 0;

  const isAllChecked =
    checkedStatementsCount === statementsCount &&
    statementsCount > 0 &&
    !batchStatementStore.loading;
  const indeterminate = !isAllChecked && checkedStatementsCount > 0;

  const handleCheckAll = useCallback(() => {
    const isUncheckAll = !!values?.statementIds?.length;

    const newStatementIds = isUncheckAll
      ? []
      : selectedBatchStatement?.statements?.map(({ id }) => +id);

    setFieldValue('statementIds', newStatementIds);
  }, [selectedBatchStatement?.statements, setFieldValue, values?.statementIds?.length]);

  const handleCheckStatement = useCallback(
    (statementId: number) => {
      const isUncheck = values.statementIds?.includes(statementId);

      const newStatementIds = isUncheck
        ? values?.statementIds?.filter(id => id !== statementId)
        : [...(values?.statementIds ?? []), statementId];

      setFieldValue('statementIds', newStatementIds);
    },
    [setFieldValue, values.statementIds],
  );

  return (
    <Table>
      <TableTools.Header sticky={false}>
        <TableCheckboxCell
          header
          indeterminate={indeterminate}
          onChange={handleCheckAll}
          name="AllStatements"
          value={isAllChecked}
        />
        <TableTools.HeaderCell>{t(`${I18N_PATH}Name`)}</TableTools.HeaderCell>
        <TableTools.HeaderCell>{t(`${I18N_PATH}CurrentBalance`)}, $</TableTools.HeaderCell>
        <TableTools.HeaderCell>{t(`${I18N_PATH}PreviousStatement`)}, $</TableTools.HeaderCell>
        <TableTools.HeaderCell>{t(`${I18N_PATH}ThisStatement`)}, $</TableTools.HeaderCell>
      </TableTools.Header>
      <TableBody cells={4} loading={isLoading}>
        {selectedBatchStatement?.statements?.map(statement => (
          <StatementRow
            key={statement.id}
            onSelect={() => handleCheckStatement(+statement.id)}
            statement={statement}
            selected={values?.statementIds?.includes(+statement.id)}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(StatementsTable);
