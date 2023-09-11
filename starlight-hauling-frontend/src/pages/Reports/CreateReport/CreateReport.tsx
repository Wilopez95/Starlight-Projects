import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { BackIcon } from '@root/assets';
import { Typography } from '@root/common';
import { BusinessUnitLayout } from '@root/components/PageLayouts/BusinessUnitLayout';
import { getReportDateRange } from '@root/consts/reports';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { useLineOfBusiness } from '../helper';
import { CustomReportWrapper } from '../styles';
import { ReportTypeEnum } from '../types';

const I18N_PATH = 'pages.Reports.CreateReport.';

const CreateReport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const exagoLoadingRef = useRef(false);
  const [isReportManagerInitialized, setReportManagerInitialized] = useState(false);

  const { reportStore, exagoStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const linesOfBusiness = useLineOfBusiness();

  const { type = ReportTypeEnum.ExpressView } = useParams<{
    type: ReportTypeEnum;
  }>();

  const { t } = useTranslation();

  const history = useHistory();
  const { formatDateTime } = useIntl();

  useEffect(() => {
    if (!exagoLoadingRef.current) {
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
          selfService: true,
          reportType: 'create',
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
    t,
    linesOfBusiness,
  ]);

  const handleBack = useCallback(() => {
    history.goBack();
  }, [history]);

  useEffect(() => {
    if (
      exagoStore.instance &&
      isReportManagerInitialized &&
      !exagoLoadingRef.current &&
      exagoStore.exportType
    ) {
      exagoStore.instance?.NewReport(containerRef.current, type);
    }
  }, [exagoStore.exportType, exagoStore.instance, isReportManagerInitialized, type]);

  return (
    <BusinessUnitLayout showNavigation={false}>
      <Helmet title={t('Titles.CreateNewReport')} />
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
        <CustomReportWrapper position="relative" height="92%" width="100vw" ref={containerRef} />
      </div>
    </BusinessUnitLayout>
  );
};

export default observer(CreateReport);
