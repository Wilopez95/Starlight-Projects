import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import { useLineOfBusiness } from '../helper';
import { ReportWrapper } from '../styles';
import { ReportsParams } from '../types';

const I18N_PATH = 'pages.Reports.Text.';

const DuplicateReport: React.FC = () => {
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

  useEffect(() => {
    if (!exagoLoadingRef.current) {
      exagoLoadingRef.current = false;

      (async () => {
        await exagoStore.instance?.DisposePage();

        setReportManagerInitialized(false);
        getReportDateRange;
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
          path: selectedReport?.path,
          selfService: true,
          reportType: 'duplicate',
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
    selectedReport?.path,
    linesOfBusiness,
  ]);

  const handleBack = useCallback(() => {
    const backUrl = `/${Routes.BusinessUnits}/${businessUnitId}/${Routes.Reports}/${subPath}`;

    history.push(backUrl);
  }, [businessUnitId, history, subPath]);

  useEffect(() => {
    if (exagoStore.instance && isReportManagerInitialized && !exagoLoadingRef.current) {
      exagoStore.instance?.LoadFullUI(containerRef.current);
    }
  }, [exagoStore.instance, isReportManagerInitialized]);

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
              <Layouts.Padding left="3" right="1">
                <BackIcon />
              </Layouts.Padding>
              {t(`${I18N_PATH}Back`)}
            </Layouts.Flex>
          </Typography>
        </Layouts.Flex>
        <ReportWrapper position="relative" height="92%" width="100vw" ref={containerRef} />
      </div>
    </BusinessUnitLayout>
  );
};

export default observer(DuplicateReport);
