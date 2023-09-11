import React, { useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Badge, Calendar, Layouts, Select, Typography } from '@starlightpro/shared-components';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { RunIcon } from '@root/assets';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeader,
  TableScrollContainer,
} from '@root/core/common/TableTools';
import { useStores } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';
import { CustomerNavigation, CustomerPortalLayout } from '@root/customer/layouts';
import ReportQuickView from '@root/customer/quickViews/Report/ReportQuickView';
import { Report } from '@root/finance/stores/report/Reports';
import { ReportFolder } from '@root/finance/types/entities';

import { useDateRangeOptions } from './hooks';
import { TableRowStyled } from './styles';
import { dateRanges, ReportsParams } from './types';

const I18N_PATH = 'pages.ReportsPage.';
const ReportsPage: React.FC = () => {
  const { reportStore } = useStores();
  const tableRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const { subPath } = useParams<ReportsParams>();
  const dateRangeOptions = useDateRangeOptions();
  const { t } = useTranslation();
  const { formatDateTime } = useIntl();

  const isCustomReport = subPath === ReportFolder.Custom;

  useEffect(() => {
    reportStore.request(subPath);
  }, [reportStore, subPath]);

  const handleChangeDateRange = useCallback(
    (_: string, value: string) => {
      reportStore.setDateRange(value);
      const currentRange = dateRanges[value];

      if (currentRange) {
        reportStore.setStartDate(currentRange.start);
        reportStore.setEndDate(currentRange.end);
      }
    },
    [reportStore],
  );

  const handleStartDateChange = useCallback(
    (_: string, value: Date) => {
      reportStore.setStartDate(value);
    },
    [reportStore],
  );

  const handleEndDateChange = useCallback(
    (_: string, value: Date) => {
      reportStore.setEndDate(value);
    },
    [reportStore],
  );

  const handleRunReport = useCallback(
    (report: Report) => {
      reportStore.toggleQuickView(true);
      reportStore.selectEntity(report);
    },
    [reportStore],
  );

  return (
    <CustomerPortalLayout>
      <Helmet title={t('Titles.Reports')} />
      <ReportQuickView condition={reportStore.isOpenQuickView} parentRef={navigationRef} />
      <CustomerNavigation ref={navigationRef} />
      <TableScrollContainer ref={tableRef}>
        <Layouts.Margin left='1'>
          <Layouts.Grid alignItems='center' columns='0.75fr 3fr 1fr 2fr 1fr 2fr 2fr' columnGap='2'>
            <Typography
              as='label'
              htmlFor='dateRange'
              textAlign='right'
              variant='bodyMedium'
              color='secondary'
              shade='light'
            >
              {t(`${I18N_PATH}DateRange`)}
            </Typography>
            <Layouts.Margin top='3'>
              <Select
                name='dateRange'
                options={dateRangeOptions}
                onSelectChange={handleChangeDateRange}
                placeholder={t(`${I18N_PATH}SelectDateRange`)}
                value={reportStore.dateRange}
                nonClearable
              />
            </Layouts.Margin>
            {reportStore.dateRange === 'customDateRange' && (
              <>
                <Typography
                  as='label'
                  htmlFor='startDate'
                  textAlign='right'
                  variant='bodyMedium'
                  color='secondary'
                  shade='light'
                >
                  {t(`${I18N_PATH}StartDate`)}
                </Typography>
                <Layouts.Margin top='3'>
                  <Calendar
                    name='startDate'
                    withInput
                    value={reportStore.startDate}
                    onDateChange={handleStartDateChange}
                    dateFormat=''
                    formatDate={() => formatDateTime(reportStore.startDate).date}
                  />
                </Layouts.Margin>
                <Typography
                  as='label'
                  htmlFor='endDate'
                  textAlign='right'
                  variant='bodyMedium'
                  color='secondary'
                  shade='light'
                >
                  {t(`${I18N_PATH}EndDate`)}
                </Typography>
                <Layouts.Margin top='3'>
                  <Calendar
                    name='endDate'
                    withInput
                    value={reportStore.endDate}
                    onDateChange={handleEndDateChange}
                    dateFormat=''
                    formatDate={() => formatDateTime(reportStore.endDate).date}
                  />
                </Layouts.Margin>
              </>
            )}
          </Layouts.Grid>
        </Layouts.Margin>
        <Divider color='grey' shade='dark' />
        <Table>
          <TableHeader>
            <TableHeadCell width='25%'>
              <Typography variant='bodyMedium' color='secondary' shade='light'>
                {t(`${I18N_PATH}ReportName`)}
              </Typography>
            </TableHeadCell>
            <TableHeadCell width='25%'>
              <Typography variant='bodyMedium' color='secondary' shade='light'>
                {t(`${I18N_PATH}Type`)}
              </Typography>
            </TableHeadCell>
            <TableCell fallback='' emptyTh />
          </TableHeader>
          <TableBody cells={3}>
            {reportStore.values.map((report) => (
              <TableRowStyled onClick={noop} key={Math.random()}>
                <TableCell width='25%'>
                  <Typography variant='bodyMedium'>{report.reportName}</Typography>
                </TableCell>
                <TableCell width='25%'>
                  {isCustomReport ? (
                    <Badge borderRadius={2} color='alternative'>
                      {t(`${I18N_PATH}CustomReport`)}
                    </Badge>
                  ) : (
                    <Badge borderRadius={2} color='primary'>
                      {t(`${I18N_PATH}Report`)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell right>
                  <Typography variant='bodyMedium' cursor='pointer' color='information'>
                    <Layouts.Flex onClick={() => handleRunReport(report)}>
                      <RunIcon />
                      {t(`${I18N_PATH}RunReport`)}
                    </Layouts.Flex>
                  </Typography>
                </TableCell>
              </TableRowStyled>
            ))}
          </TableBody>
        </Table>
      </TableScrollContainer>
    </CustomerPortalLayout>
  );
};

export default observer(ReportsPage);
