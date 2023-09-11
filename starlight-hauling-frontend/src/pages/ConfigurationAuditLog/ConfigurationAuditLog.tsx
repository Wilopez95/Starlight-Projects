import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { ISelectOption } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { GlobalService } from '@root/api';
import { Badge } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TableInfiniteScroll,
  TablePageContainer,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import {
  AppliedFilterState,
  MultiSelectFilter,
  TableFilter,
  TableFilterConfig,
} from '@root/common/TableTools/TableFilter';
import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { useCrudPermissions, useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { AuditAction, AuditEntity, entities, IAuditLogEntry } from '@root/types';

import PageHeader from '../SystemConfiguration/components/PageHeader/PageHeader';
import { type ISystemConfigurationTable } from '../SystemConfiguration/types';

import DateRangeFilter from './components/DateRangeFilter/DateRangeFilter';
import RecordDetailsModal from './components/RecordDetailsModal/RecordDetailsModal';
import { getColorByAction } from './helpers';

const I18N_PATH = 'pages.SystemConfiguration.tables.AuditLog.Text.';

const LIMIT = 25;

const actionOptions: ISelectOption[] = [
  {
    label: 'Create',
    value: AuditAction.create,
  },
  { label: 'Modify', value: AuditAction.modify },
  { label: 'Delete', value: AuditAction.delete },
];

const ConfigurationAuditLog: React.FC<ISystemConfigurationTable> = ({ className }) => {
  const { t } = useTranslation();
  const { formatDateTime } = useIntl();

  const [entries, setEntries] = useState<IAuditLogEntry[]>([]);
  const [currentEntry, setEntry] = useState<IAuditLogEntry>();
  const offset = useRef(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>('');
  const [loaded, setLoaded] = useState(false);
  const [filterState, setFilterState] = useState<AppliedFilterState>({});
  const [isModalVisible, toggleModal] = useToggle(false);
  const { businessUnitStore, userStore } = useStores();

  const [canViewUsers] = useCrudPermissions('configuration', 'users');
  const [canViewBusinessUnits] = useCrudPermissions('configuration', 'business-units');

  const requestParams = useMemo(
    () => ({
      entityId: search,
      ...filterState,
    }),
    [filterState, search],
  );

  useEffect(() => {
    userStore.request();
  }, [userStore]);

  useEffect(() => {
    if (canViewBusinessUnits) {
      businessUnitStore.request();
    }
  }, [businessUnitStore, canViewBusinessUnits]);

  const loadMore = useCallback(async () => {
    setLoading(true);

    const response = await GlobalService.auditLogs(requestParams, {
      skip: offset.current,
      limit: LIMIT,
    });

    setEntries(prevEntries => prevEntries.concat(response.items));

    if (response.items.length === 0 || response.items.length !== LIMIT) {
      setLoaded(true);
    }

    offset.current = offset.current + LIMIT;
    setLoading(false);
  }, [requestParams]);

  useEffect(() => {
    (async () => {
      offset.current = 0;
      setLoaded(false);
      setLoading(true);

      const response = await GlobalService.auditLogs(requestParams, {
        skip: offset.current,
        limit: LIMIT,
      });

      setEntries(response.items);

      if (response.items.length === 0 || response.items.length !== LIMIT) {
        setLoaded(true);
      }

      offset.current = offset.current + LIMIT;
      setLoading(false);
    })();
  }, [loadMore, requestParams]);

  const handleLogEntryClick = useCallback(
    (entry: IAuditLogEntry) => {
      setEntry(entry);
      toggleModal();
    },
    [toggleModal],
  );

  const handleModalClose = useCallback(() => {
    setEntry(undefined);
    toggleModal();
  }, [toggleModal]);

  const buOptions = businessUnitStore.values.map(bu => ({
    label: bu.fullName,
    value: bu.id,
  }));

  return (
    <TablePageContainer className={className}>
      {currentEntry ? (
        <RecordDetailsModal
          entry={currentEntry}
          isOpen={isModalVisible}
          onClose={handleModalClose}
        />
      ) : null}
      <Helmet title={t('Titles.AuditLog')} />
      <PageHeader title={t(`${I18N_PATH}Title`)} hideSwitch />
      <TableTools.ScrollContainer>
        <TableTools.HeaderNavigation
          onSearch={setSearch}
          placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
          filterable
          routes={[]}
        >
          <TableFilter onApply={setFilterState}>
            {canViewUsers ? (
              <TableFilterConfig label={t(`${I18N_PATH}User`)} filterByKey="userIds">
                <MultiSelectFilter
                  searchable
                  options={userStore.values.map(user => ({
                    label: user?.name,
                    value: user.id,
                  }))}
                />
              </TableFilterConfig>
            ) : null}
            {canViewBusinessUnits ? (
              <TableFilterConfig
                label={t(`${I18N_PATH}BusinessUnit`)}
                filterByKey="businessUnitIds"
              >
                <MultiSelectFilter searchable options={buOptions} />
              </TableFilterConfig>
            ) : null}
            <TableFilterConfig label={t(`${I18N_PATH}ActionType`)} filterByKey="actions">
              <MultiSelectFilter options={actionOptions} />
            </TableFilterConfig>
            <TableFilterConfig label={t(`${I18N_PATH}Entity`)} filterByKey="entities">
              <MultiSelectFilter
                options={entities.map(entity => ({ label: startCase(entity), value: entity }))}
              />
            </TableFilterConfig>
            <TableFilterConfig label={t(`${I18N_PATH}DatePeriod`)} filterByKey="dateRange">
              <DateRangeFilter fromDatePropName="dateFrom" toDatePropName="dateTo" />
            </TableFilterConfig>
          </TableFilter>
        </TableTools.HeaderNavigation>
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell>{t(`${I18N_PATH}Action`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}Date`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}User`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}RecordId`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell right>{t(`${I18N_PATH}RecordType`)}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody loading={loading} cells={5} noResult={!entries.length}>
            {entries.map(entry => {
              const entryId =
                entry.entity === AuditEntity.SubscriptionOrder && entry.data?.sequenceId
                  ? entry.data.sequenceId
                  : entry.entityId;

              return (
                <TableRow key={entry.id} onClick={() => handleLogEntryClick(entry)}>
                  <TableCell>
                    <Badge borderRadius={2} color={getColorByAction(entry.action)}>
                      {startCase(entry.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDateTime(substituteLocalTimeZoneInsteadUTC(entry.timestamp)).dateTime}
                  </TableCell>
                  <TableCell>{entry.user}</TableCell>
                  <TableCell>{entryId}</TableCell>
                  <TableCell right>{startCase(entry.entity)}</TableCell>
                </TableRow>
              );
            })}
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

export default observer(ConfigurationAuditLog);
