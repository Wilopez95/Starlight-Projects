import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { ISelectOption } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';
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
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IQbIntegrationLog } from '@root/types';
import { format } from 'date-fns-tz';
import { parseDate } from '@root/helpers';
import { QbIntegrationLogQuickView } from '@root/quickViews';
import { QbIntegrationLogService } from '@root/api/qbIntegrationLog/qbIntegrationLog';
import { type ISystemConfigurationTable } from '../SystemConfiguration/types';
import PageHeader from '../SystemConfiguration/components/PageHeader/PageHeader';
import { QbIntegrationLog } from '../../stores/qbIntegrationLog/QbIntegrationLog';
import { getColorByAction } from './helpers';
import DateRangeFilter from './components/DateRangeFilter/DateRangeFilter';

const I18N_PATH = 'pages.SystemConfiguration.tables.QbIntegrationLog.Text.';
const LIMIT = 20;

const typeOptions: ISelectOption[] = [
  { label: 'Error', value: 'error' },
  { label: 'Warning', value: 'warn' },
  { label: 'Info', value: 'info' },
];

const ConfigurationIntegrationLog: React.FC<ISystemConfigurationTable> = ({ className }) => {
  const { dateFormat, formatCurrency } = useIntl();
  const tbodyContainerRef = useRef(null);
  const { qbIntegrationLogStore } = useStores();
  const { t } = useTranslation();

  const selectedAccounting = qbIntegrationLogStore.selectedEntity;

  const loadDomains = useCallback(() => {
    qbIntegrationLogStore.request();
  }, [qbIntegrationLogStore]);

  useEffect(loadDomains, [loadDomains]);
  const [entries, setEntries] = useState<IQbIntegrationLog[]>([]);
  const offset = useRef(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [loaded, setLoaded] = useState(true);
  const [filterState, setFilterState] = useState<AppliedFilterState>({});
  const { businessUnitStore } = useStores();
  const requestParams = useMemo(
    () => ({
      id: search,
      ...filterState,
    }),
    [filterState, search],
  );

  useEffect(() => {
    businessUnitStore.request();
  }, [businessUnitStore]);

  const loadMore = useCallback(async () => {
    setLoading(true);
    const response = await QbIntegrationLogService.getQbIntegrationLog(requestParams, {
      skip: offset.current ? offset.current : undefined,
      limit: LIMIT,
    });
    setEntries(prevEntries =>
      prevEntries.concat(
        response.items.map(log => new QbIntegrationLog(qbIntegrationLogStore, log)),
      ),
    );
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
      const response = await QbIntegrationLogService.getQbIntegrationLog(requestParams, {
        skip: offset.current ? offset.current : undefined,
        limit: LIMIT,
      });
      setEntries(response.items.map(log => new QbIntegrationLog(qbIntegrationLogStore, log)));
      if (response.items.length === 0 || response.items.length !== LIMIT) {
        setLoaded(true);
      }
      offset.current = offset.current + LIMIT;
      setLoading(false);
    })();
  }, [loadMore, requestParams]);

  const handleLogEntryClick = useCallback((entry: IQbIntegrationLog) => {
    qbIntegrationLogStore.selectEntity(entry, true);
  }, []);

  const buOptions = businessUnitStore.values.map(bu => ({
    label: bu.fullName,
    value: bu.id,
  }));

  return (
    <TablePageContainer className={className}>
      <QbIntegrationLogQuickView
        clickOutContainers={tbodyContainerRef}
        isOpen={qbIntegrationLogStore.isOpenQuickView}
      />
      <Helmet title={t('Titles.QbIntegrationLog')} />
      <PageHeader title={t(`${I18N_PATH}Title`)} hideSwitch />
      <TableTools.ScrollContainer>
        <TableTools.HeaderNavigation
          onSearch={setSearch}
          placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
          filterable
          routes={[]}
        >
          <TableFilter onApply={setFilterState}>
            <TableFilterConfig
              label={t(`${I18N_PATH}SessionStart`)}
              filterByKey="lastSuccessfulIntegration"
            >
              <DateRangeFilter fromDatePropName="lsiDateFrom" toDatePropName="lsiDateTo" />
            </TableFilterConfig>
            {/* <TableFilterConfig label={t(`${I18N_PATH}Period`)} filterByKey='integrationPeriod'>
              <DateRangeFilter fromDatePropName="ipDateFrom" toDatePropName="ipDateTo" />
            </TableFilterConfig> */}
            <TableFilterConfig
              label={t(`${I18N_PATH}BusinessUnit`)}
              filterByKey="integrationBuList"
            >
              <MultiSelectFilter options={buOptions} />
            </TableFilterConfig>
            <TableFilterConfig label={t(`${I18N_PATH}Status`)} filterByKey="type">
              <MultiSelectFilter options={typeOptions} />
            </TableFilterConfig>
            {/* <TableFilterConfig label={t(`${I18N_PATH}StatusCode`)} filterByKey='statusCode'>
              <MultiSelectFilter
                options = {statusCodeOptions}
              ></MultiSelectFilter>
            </TableFilterConfig> */}
          </TableFilter>
        </TableTools.HeaderNavigation>
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell>{t(`${I18N_PATH}Id`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}Status`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}SessionStart`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}Period`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}BusinessUnit`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}Total`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}StatusCode`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}Message`)}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody ref={tbodyContainerRef} cells={7} loading={qbIntegrationLogStore.loading}>
            {entries.map(accounting => (
              <TableRow
                key={accounting.id}
                onClick={() => {
                  handleLogEntryClick(accounting);
                }}
                selected={selectedAccounting?.id === accounting.id}
              >
                <TableCell>{accounting.id}</TableCell>
                <TableCell>
                  <Badge borderRadius={2} color={getColorByAction(accounting.type)}>
                    {startCase(accounting.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(parseDate(accounting.lastSuccessfulIntegration), dateFormat.dateTime)}
                </TableCell>
                <TableCell>
                  {`${format(parseDate(accounting.rangeFrom), dateFormat.dateTime)} - ${format(
                    parseDate(accounting.rangeTo),
                    dateFormat.dateTime,
                  )}`}
                </TableCell>
                <TableCell>
                  {accounting.integrationBuList.length === 1
                    ? accounting.integrationBuList
                    : `${accounting.integrationBuList} `}
                </TableCell>
                <TableCell>{formatCurrency(parseInt(accounting.paymentsTotal, 10))}</TableCell>
                <TableCell>{accounting.statusCode}</TableCell>
                <TableCell>{accounting.description}</TableCell>
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

export default observer(ConfigurationIntegrationLog);
