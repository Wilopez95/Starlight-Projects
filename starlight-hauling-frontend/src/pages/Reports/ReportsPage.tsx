import React, { useCallback, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';
import {
  Button,
  Calendar,
  ISelectOption,
  Layouts,
  MultiSelect,
  Select,
  useToggle,
} from '@starlightpro/shared-components';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { DeleteIcon, DuplicateIcon, EditIcon, PlusIcon, RunIcon } from '@root/assets';
import { Badge, Typography } from '@root/common';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TablePageContainer,
  TableTools,
} from '@root/common/TableTools';
import { BusinessUnitLayout } from '@root/components/PageLayouts/BusinessUnitLayout';
import { Paths } from '@root/consts';
import { dateRanges } from '@root/consts/reports';
import { handleEnterOrSpaceKeyDown, NotificationHelper, pathToUrl } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBusinessContext, usePermission, useStores } from '@root/hooks';
import { Permission } from '@root/hooks/permissions/types';
import { useIntl } from '@root/i18n/useIntl';
import { Report } from '@root/stores/entities';
import { ReportFolder } from '@root/types';

import CreateReportModal from './components/CreateReportModal/CreateReportModal';
import { useNavigationTabs } from './helper';
import { useDateRangeOptions } from './hooks';
import * as Styles from './styles';
import { ReportsParams } from './types';

const I18N_PATH = 'pages.Reports.ReportsPage.';

const ReportsPage: React.FC = () => {
  const { reportStore, businessLineStore } = useStores();
  const [isCreateReportModalOpen, toggleIsCreateReportModalOpen] = useToggle();
  const history = useHistory();

  const { subPath } = useParams<ReportsParams>();

  const { businessUnitId } = useBusinessContext();

  const { t } = useTranslation();

  const dateRangeOptions = useDateRangeOptions();
  const { firstDayOfWeek } = useIntl();

  const isCustomReport = subPath === ReportFolder.Custom;
  const canAccessCustomPerform = usePermission('reports:custom:perform');
  const canAccessView = usePermission(
    isCustomReport ? 'reports:custom:perform' : (`reports:${subPath}:view` as Permission),
  );
  const canAccessUpdate = usePermission(
    isCustomReport ? 'reports:custom:perform' : (`reports:${subPath}:update` as Permission),
  );

  useEffect(() => {
    reportStore.setSort('reportName', 'desc');
  }, [reportStore]);

  const handleRequest = useCallback(() => {
    if (!canAccessView) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    } else {
      reportStore.request(subPath);
      businessLineStore.request({ activeOnly: true });
    }
  }, [businessLineStore, canAccessView, reportStore, subPath]);

  useEffect(() => {
    businessLineStore.cleanup();
    reportStore.cleanup();

    handleRequest();
  }, [businessLineStore, handleRequest, reportStore]);

  const navigationTabs = useNavigationTabs();

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
      reportStore.selectEntity(report);
      history.push(
        pathToUrl(Paths.ReportsModule.View, {
          businessUnit: businessUnitId,
          subPath,
        }),
      );
    },
    [businessUnitId, history, reportStore, subPath],
  );

  const handleEditReport = useCallback(
    (report: Report) => {
      reportStore.selectEntity(report);
      history.push(
        pathToUrl(Paths.ReportsModule.Edit, {
          businessUnit: businessUnitId,
          subPath,
        }),
      );
    },
    [businessUnitId, history, reportStore, subPath],
  );

  const handleDeleteReport = useCallback(() => {
    history.push(
      pathToUrl(Paths.ReportsModule.Delete, {
        businessUnit: businessUnitId,
      }),
    );
  }, [businessUnitId, history]);

  const handleDuplicateReport = useCallback(
    (report: Report) => {
      reportStore.selectEntity(report);
      history.push(
        pathToUrl(Paths.ReportsModule.Duplicate, {
          businessUnit: businessUnitId,
          subPath,
        }),
      );
    },
    [businessUnitId, history, reportStore, subPath],
  );

  const businessLineOptions: ISelectOption[] = useMemo(
    () => [
      {
        label: 'All Lines of Business',
        value: 0,
      },
      ...businessLineStore.values.map(elem => ({
        value: elem.id,
        label: elem.name,
      })),
    ],
    [businessLineStore.values],
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLOrSVGElement>,
    callback: (report: Report) => void,
    report: Report,
  ) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback(report);
    }
  };

  const handleChangeLineOfBusiness = useCallback(
    (_, lobIds: number[]) => {
      let ids: number[];
      const lastValue = lobIds.slice(-1);
      const allValue = +businessLineOptions[0].value;

      if (!lastValue.length || lastValue.includes(allValue)) {
        ids = [allValue];
      } else {
        ids = lobIds.filter(id => id !== allValue);
      }

      reportStore.setBusinessLines(ids);
    },
    [businessLineOptions, reportStore],
  );

  const { dateFormat } = useDateIntl();

  const isProfitabilityTab = subPath === ReportFolder.Profitability;

  return (
    <>
      <CreateReportModal isOpen={isCreateReportModalOpen} onClose={toggleIsCreateReportModalOpen} />
      <BusinessUnitLayout>
        <Helmet title={t('Titles.Reports')} />
        <TablePageContainer>
          <Layouts.Margin bottom="4">
            <Layouts.Flex justifyContent="space-between">
              <Typography as="h1" variant="headerTwo">
                {isProfitabilityTab
                  ? t(`${I18N_PATH}DashboardsAndReports`)
                  : t(`${I18N_PATH}Reports`)}
              </Typography>
              {canAccessCustomPerform ? (
                <Button
                  variant="primary"
                  onClick={toggleIsCreateReportModalOpen}
                  iconLeft={PlusIcon}
                >
                  {t(`${I18N_PATH}CreateReport`)}
                </Button>
              ) : null}
            </Layouts.Flex>
          </Layouts.Margin>
          <TableTools.ScrollContainer
            tableNavigation={
              <TableTools.HeaderNavigation
                filterable
                showFilterIcon={false}
                routes={navigationTabs}
              >
                <>
                  <Layouts.Margin left="3">
                    <Layouts.Grid
                      alignItems="center"
                      columns="0.75fr 3fr 1fr 3fr 0.5fr"
                      columnGap="2"
                    >
                      <Typography
                        as="label"
                        htmlFor="dateRange"
                        textAlign="right"
                        variant="bodyMedium"
                        color="secondary"
                        shade="light"
                      >
                        {t(`${I18N_PATH}DateRange`)}
                      </Typography>
                      <Layouts.Margin top="3" bottom="3">
                        <Select
                          name="dateRange"
                          options={dateRangeOptions}
                          onSelectChange={handleChangeDateRange}
                          placeholder={t(`${I18N_PATH}SelectDateRange`)}
                          value={reportStore.dateRange}
                          noErrorMessage
                          nonClearable
                        />
                      </Layouts.Margin>
                      <Typography
                        as="label"
                        htmlFor="linesOfBusiness"
                        textAlign="right"
                        variant="bodyMedium"
                        color="secondary"
                        shade="light"
                      >
                        {t(`${I18N_PATH}LineOfBusiness`)}
                      </Typography>
                      <Layouts.Margin top="3">
                        <MultiSelect
                          name="linesOfBusiness"
                          onSelectChange={handleChangeLineOfBusiness}
                          options={businessLineOptions}
                          value={reportStore.linesOfBusiness}
                        />
                      </Layouts.Margin>
                      {reportStore.dateRange === 'customDateRange' ? (
                        <>
                          <Layouts.Cell left={1} justifySelf="flex-end">
                            <Typography
                              as="label"
                              htmlFor="startDate"
                              textAlign="right"
                              variant="bodyMedium"
                              color="secondary"
                              shade="light"
                            >
                              {t(`${I18N_PATH}StartDate`)}
                            </Typography>
                          </Layouts.Cell>
                          <Layouts.Margin top="3">
                            <Calendar
                              name="startDate"
                              withInput
                              value={reportStore.startDate}
                              placeholder={t('Text.SetDate')}
                              firstDayOfWeek={firstDayOfWeek}
                              dateFormat={dateFormat}
                              onDateChange={handleStartDateChange}
                            />
                          </Layouts.Margin>
                          <Typography
                            as="label"
                            htmlFor="endDate"
                            textAlign="right"
                            variant="bodyMedium"
                            color="secondary"
                            shade="light"
                          >
                            {t(`${I18N_PATH}EndDate`)}
                          </Typography>
                          <Layouts.Margin top="3">
                            <Calendar
                              name="endDate"
                              withInput
                              value={reportStore.endDate}
                              placeholder={t('Text.SetDate')}
                              firstDayOfWeek={firstDayOfWeek}
                              dateFormat={dateFormat}
                              onDateChange={handleEndDateChange}
                            />
                          </Layouts.Margin>
                        </>
                      ) : null}
                    </Layouts.Grid>
                  </Layouts.Margin>
                  <Divider />
                </>
              </TableTools.HeaderNavigation>
            }
          >
            <Table>
              <TableTools.Header>
                <TableTools.SortableHeaderCell
                  store={reportStore}
                  sortKey="reportName"
                  onSort={noop}
                  width="25%"
                >
                  {t(`${I18N_PATH}ReportName`)}
                </TableTools.SortableHeaderCell>

                <TableTools.SortableHeaderCell
                  store={reportStore}
                  sortKey="reportType"
                  onSort={noop}
                  width="25%"
                >
                  {t(`${I18N_PATH}Type`)}
                </TableTools.SortableHeaderCell>
                <TableCell fallback="" emptyTh />
              </TableTools.Header>
              <TableBody loading={reportStore.loading} cells={3} noResult={reportStore.noResult}>
                {reportStore.sortedValues.map(report => (
                  <Styles.TableRowStyled key={report.reportName}>
                    <TableCell width="25%">
                      <Typography variant="bodyMedium">{report.reportName}</Typography>
                    </TableCell>
                    <TableCell width="25%">
                      {isCustomReport ? (
                        report.reportType === 2 ? (
                          <Badge borderRadius={2} color="purple">
                            {t(`${I18N_PATH}CustomDashboard`)}
                          </Badge>
                        ) : (
                          <Badge borderRadius={2} color="alternative">
                            {t(`${I18N_PATH}CustomReport`)}
                          </Badge>
                        )
                      ) : report.reportType === 2 ? (
                        <Badge borderRadius={2} color="purple">
                          {t(`${I18N_PATH}Dashboard`)}
                        </Badge>
                      ) : (
                        <Badge borderRadius={2} color="primary">
                          {t(`${I18N_PATH}Report`)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell right>
                      {isCustomReport && canAccessCustomPerform ? (
                        <Layouts.Margin right="3">
                          <Typography variant="bodyMedium" cursor="pointer" color="information">
                            <Layouts.Flex onClick={() => handleDeleteReport()}>
                              <DeleteIcon
                                role="button"
                                aria-label={t('Text.Delete')}
                                tabIndex={0}
                                onKeyDown={e => handleKeyDown(e, handleDeleteReport, report)}
                              />
                              {t('Text.Delete')}
                            </Layouts.Flex>
                          </Typography>
                        </Layouts.Margin>
                      ) : null}

                      {canAccessCustomPerform ? (
                        <Layouts.Margin right="3">
                          <Typography variant="bodyMedium" cursor="pointer" color="information">
                            <Layouts.Flex onClick={() => handleDuplicateReport(report)}>
                              <DuplicateIcon
                                role="button"
                                aria-label={t('Text.Duplicate')}
                                tabIndex={0}
                                onKeyDown={e => handleKeyDown(e, handleDuplicateReport, report)}
                              />
                              {t('Text.Duplicate')}
                            </Layouts.Flex>
                          </Typography>
                        </Layouts.Margin>
                      ) : null}
                      {canAccessUpdate && report.reportEditName && !isProfitabilityTab ? (
                        <Layouts.Margin right="3">
                          <Typography variant="bodyMedium" cursor="pointer" color="information">
                            <Layouts.Flex onClick={() => handleEditReport(report)}>
                              <EditIcon
                                role="button"
                                aria-label={t('Text.Edit')}
                                tabIndex={0}
                                onKeyDown={e => handleKeyDown(e, handleEditReport, report)}
                              />
                              {t('Text.Edit')}
                            </Layouts.Flex>
                          </Typography>
                        </Layouts.Margin>
                      ) : null}
                      <Typography variant="bodyMedium" cursor="pointer" color="information">
                        <Layouts.Flex onClick={() => handleRunReport(report)}>
                          <RunIcon
                            aria-label={
                              report.reportType === 2
                                ? t(`${I18N_PATH}RunDashboard`)
                                : t(`${I18N_PATH}RunReport`)
                            }
                            tabIndex={0}
                            onKeyDown={e => handleKeyDown(e, handleRunReport, report)}
                          />
                          {report.reportType === 2
                            ? t(`${I18N_PATH}RunDashboard`)
                            : t(`${I18N_PATH}RunReport`)}
                        </Layouts.Flex>
                      </Typography>
                    </TableCell>
                  </Styles.TableRowStyled>
                ))}
              </TableBody>
            </Table>
          </TableTools.ScrollContainer>
        </TablePageContainer>
      </BusinessUnitLayout>
    </>
  );
};

export default observer(ReportsPage);
