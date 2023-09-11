import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Table, TableBody, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useCrudPermissions, useStores } from '@root/hooks';
import { ThirdPartyHaulerRateQuickView } from '@root/quickViews';

import configurationStyle from '../../../../css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.ThirdPartyHaulerCosts.Text.';

const ThirdPartyHaulerRatesTable: React.FC = () => {
  const { thirdPartyHaulerStore } = useStores();
  const { t } = useTranslation();
  const tbodyContainerRef = useRef<HTMLTableSectionElement>(null);
  const [canViewHaulers] = useCrudPermissions('configuration', 'third-party-haulers');
  const [canViewOperatingCosts] = useCrudPermissions('configuration', 'operating-costs');

  const selectedThirdPartyHauler = thirdPartyHaulerStore.selectedEntity;

  useEffect(() => {
    if (canViewHaulers && canViewOperatingCosts) {
      thirdPartyHaulerStore.cleanup();
      thirdPartyHaulerStore.request({ activeOnly: true });
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [canViewHaulers, canViewOperatingCosts, thirdPartyHaulerStore]);

  return (
    <>
      <ThirdPartyHaulerRateQuickView isOpen={thirdPartyHaulerStore.isOpenQuickView} />
      <Table>
        <TableTools.Header>
          <TableTools.HeaderCell colSpan={2} minWidth={400}>
            {t('Text.Description')}
          </TableTools.HeaderCell>
        </TableTools.Header>
        <TableBody loading={thirdPartyHaulerStore.loading} ref={tbodyContainerRef} cells={2}>
          {thirdPartyHaulerStore.sortedValues.map(item => (
            <TableRow
              key={item.id}
              className={configurationStyle.customRow}
              onClick={() => thirdPartyHaulerStore.selectEntity(item)}
              selected={selectedThirdPartyHauler?.id === item.id}
            >
              <TableCell titleClassName={configurationStyle.tableCellTitle}>
                {item.description}
              </TableCell>
              <TableCell titleClassName={configurationStyle.tableCellAction}>
                <Typography
                  color="information"
                  variant="bodyMedium"
                  cursor="pointer"
                  role="button"
                  tabIndex={0}
                >
                  {t(`${I18N_PATH}EditRates`)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default observer(ThirdPartyHaulerRatesTable);
