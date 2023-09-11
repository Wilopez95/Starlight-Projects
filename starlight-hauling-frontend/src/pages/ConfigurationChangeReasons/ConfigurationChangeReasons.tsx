import React, { useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, PlusIcon, Switch } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import {
  Table,
  TableBody,
  TableCell,
  TableInfiniteScroll,
  TablePageContainer,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { ChangeReasonQuickView } from '@root/quickViews';
import { useCleanup, useCrudPermissions, useStores } from '@hooks';

import PageHeader from '../SystemConfiguration/components/PageHeader/PageHeader';

const I18N_PATH = 'pages.SystemConfiguration.tables.ChangeReasons.Text.';

const ChangeReasonsTable: React.FC = () => {
  const { t } = useTranslation();
  const { changeReasonStore, systemConfigurationStore } = useStores();
  const [canViewReasons, _, canCreateReasons] = useCrudPermissions(
    'configuration',
    'change-reasons',
  );

  useCleanup(changeReasonStore);

  const loadMore = useCallback(() => {
    changeReasonStore.request();
  }, [changeReasonStore]);

  useEffect(() => {
    if (!canViewReasons) {
      changeReasonStore.markLoaded();
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

      return;
    }

    loadMore();
  }, [changeReasonStore, canViewReasons, loadMore]);

  const handleChangeInactive = useCallback(() => {
    systemConfigurationStore.toggleShow();
    changeReasonStore.cleanup();
    loadMore();
  }, [systemConfigurationStore, changeReasonStore, loadMore]);

  const handleCreationClick = useCallback(() => {
    systemConfigurationStore.toggleDuplicating(false);
    systemConfigurationStore.toggleCreating();
  }, [systemConfigurationStore]);

  const selectedChangeReason = changeReasonStore.selectedEntity;
  const loaded = changeReasonStore.loaded;
  const loading = changeReasonStore.loading;

  return (
    <TablePageContainer>
      <Helmet title={t('Titles.ChangeReasons')} />
      <PageHeader hideSwitch title={t(`${I18N_PATH}Reasons`)}>
        <Layouts.Margin top="0.5">
          <Switch
            id="pageHeaderSwitch"
            name="pageHeaderSwitch"
            value={systemConfigurationStore.showInactive}
            onChange={handleChangeInactive}
          >
            {t(`${I18N_PATH}ShowInactive`)}
          </Switch>
        </Layouts.Margin>
        {canCreateReasons ? (
          <Layouts.Margin left="2">
            <Button iconLeft={PlusIcon} variant="primary" onClick={handleCreationClick}>
              {t(`${I18N_PATH}AddNewReason`)}
            </Button>
          </Layouts.Margin>
        ) : null}
      </PageHeader>
      <TableTools.ScrollContainer>
        <ChangeReasonQuickView
          isOpen={changeReasonStore.isOpenQuickView || systemConfigurationStore.isCreating}
        />
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell>{t('Text.Status')}</TableTools.HeaderCell>
            <TableTools.SortableHeaderCell
              store={changeReasonStore}
              sortKey="description"
              onSort={loadMore}
            >
              {t('Text.Description')}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              store={changeReasonStore}
              sortKey="businessLineNames"
              onSort={loadMore}
            >
              {t('Text.LineOfBusiness')}
            </TableTools.SortableHeaderCell>
          </TableTools.Header>
          <TableBody cells={3} loading={loading} noResult={changeReasonStore.noResult}>
            {changeReasonStore.values.map(item => (
              <TableRow
                key={item.id}
                onClick={() => changeReasonStore.selectEntity(item)}
                selected={selectedChangeReason?.id === item.id}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.businessLineNames}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableInfiniteScroll
          initialRequest={false}
          onLoaderReached={loadMore}
          loaded={loaded}
          loading={loading}
        />
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(ChangeReasonsTable);
