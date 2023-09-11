import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { BackIcon } from '@root/assets';
import { Typography } from '@root/common';
import { BusinessUnitLayout } from '@root/components/PageLayouts/BusinessUnitLayout';
import { Routes } from '@root/consts';
import { getReportDateRange } from '@root/consts/reports';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { ReportFolder } from '@root/types';

import { useLineOfBusiness } from '../helper';
import { CustomReportWrapper, ExagoImageWrapper } from '../styles';
import { ReportsParams } from '../types';

const I18N_PATH = 'pages.Reports.Text.';

const RunReport: React.FC = () => {
  const { subPath } = useParams<ReportsParams>();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const exagoLoadingRef = useRef(false);
  const { t } = useTranslation();
  const [isReportManagerInitialized, setReportManagerInitialized] = useState(false);

  const { reportStore, exagoStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const linesOfBusiness = useLineOfBusiness();

  const selectedReport = reportStore.selectedEntity;
  const history = useHistory();
  const { formatDateTime } = useIntl();

  const ExagoWrapper = subPath === ReportFolder.Custom ? CustomReportWrapper : ExagoImageWrapper;

  const handleBack = useCallback(() => {
    const backUrl = `/${Routes.BusinessUnits}/${businessUnitId}/${Routes.Reports}/${subPath}`;

    history.push(backUrl);
  }, [businessUnitId, history, subPath]);

  useEffect(() => {
    if (selectedReport && !exagoLoadingRef.current) {
      exagoLoadingRef.current = false;

      (async () => {
        await exagoStore.instance?.DisposePage();

        setReportManagerInitialized(false);
        exagoLoadingRef.current = true;

        const [startDate, endDate] = getReportDateRange(reportStore.startDate, reportStore.endDate);

        await exagoStore.createReportSession({
          options: {
            OnLoad: () => {
              setReportManagerInitialized(true);
              exagoLoadingRef.current = false;
            },
          },
          businessUnitId,
          fromDate: startDate,
          toDate: endDate,
          reportType: 'view',
          linesOfBusiness,
        });
      })();
    }
  }, [
    businessUnitId,
    exagoStore,
    formatDateTime,
    reportStore.linesOfBusiness,
    reportStore.endDate,
    reportStore.startDate,
    selectedReport,
    linesOfBusiness,
  ]);

  const previewPath = useMemo(
    () => `${[selectedReport?.path, selectedReport?.reportName].join('\\')}`,
    [selectedReport?.path, selectedReport?.reportName],
  );

  useEffect(() => {
    if (
      exagoStore.instance &&
      isReportManagerInitialized &&
      !exagoLoadingRef.current &&
      exagoStore.exportType
    ) {
      const [startDate, endDate] = getReportDateRange(reportStore.startDate, reportStore.endDate);

      const params = [
        {
          Name: 'fromDate',
          Value: startDate,
        },
        {
          Name: 'toDate',
          Value: endDate,
        },
        {
          Name: 'businessUnitId',
          Value: businessUnitId,
        },
        {
          Name: 'linesOfBusiness',
          Value: linesOfBusiness,
        },
      ];

      exagoStore.instance?.ExecuteReport(containerRef.current, 'html', previewPath, {
        Parameters: params,
      });
    }
  }, [
    businessUnitId,
    exagoStore.exportType,
    exagoStore.instance,
    isReportManagerInitialized,
    previewPath,
    reportStore.endDate,
    reportStore.linesOfBusiness,
    reportStore.startDate,
    linesOfBusiness,
  ]);

  return (
    <BusinessUnitLayout showNavigation={false}>
      <div>
        <Layouts.Flex
          height="72px"
          width="100vw"
          backgroundColor="secondary"
          backgroundShade="dark"
          as={Layouts.Box}
          justifyContent="flex-start"
          alignItems="center"
        >
          <Typography variant="bodyMedium" color="white" cursor="pointer">
            <Layouts.Flex alignItems="center" onClick={handleBack}>
              <Layouts.Padding left="3">
                <Layouts.IconLayout color="white">
                  <BackIcon />
                </Layouts.IconLayout>
              </Layouts.Padding>
              {t(`${I18N_PATH}Back`)}
            </Layouts.Flex>
          </Typography>
        </Layouts.Flex>
        <ExagoWrapper position="relative" height="92%" width="100vw" ref={containerRef} />
      </div>
    </BusinessUnitLayout>
  );
};

export default observer(RunReport);
