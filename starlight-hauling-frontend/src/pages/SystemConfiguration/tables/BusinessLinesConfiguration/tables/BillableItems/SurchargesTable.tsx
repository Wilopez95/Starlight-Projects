import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Table, TableBody, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { useStores } from '@hooks';

import configurationStyle from '../../../../css/styles.scss';

const I18N_PATH =
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.BillableItems.SurchargesTable.';

const SurchargesTable = () => {
  const { t } = useTranslation();
  const { surchargeStore } = useStores();
  const tbodyContainerRef = useRef(null);

  return (
    <Table>
      <TableTools.Header>
        <TableTools.HeaderCell minWidth={50 + 48}>{t(`${I18N_PATH}Status`)}</TableTools.HeaderCell>
        <TableTools.HeaderCell>{t(`${I18N_PATH}Description`)}</TableTools.HeaderCell>
        <TableTools.HeaderCell>{t(`${I18N_PATH}Type`)}</TableTools.HeaderCell>
      </TableTools.Header>
      <TableBody ref={tbodyContainerRef} cells={3} loading={surchargeStore.loading}>
        {surchargeStore.sortedValues.map(item => (
          <TableRow
            key={item.id}
            className={configurationStyle.customRow}
            onClick={() => {
              surchargeStore.selectEntity(item);
            }}
            selected={surchargeStore.selectedEntity?.id === item.id}
          >
            <TableCell>
              <StatusBadge active={item.active} />
            </TableCell>

            <TableCell titleClassName={configurationStyle.tableCellTitle}>
              {item.description}
            </TableCell>

            <TableCell titleClassName={configurationStyle.tableCellTitle}>
              {startCase(item.calculation)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(SurchargesTable);
