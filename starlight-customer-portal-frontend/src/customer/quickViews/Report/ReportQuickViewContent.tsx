import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';
import { ExagoImageWrapper } from '@root/customer/pages/Reports/styles';

import * as QuickViewStyles from './styles';
import { IReportQuickViewContent } from './types';

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const ReportQuickViewContent: React.FC<IReportQuickViewContent> = ({ onClose }) => {
  const { exagoStore, reportStore, customerStore } = useStores();
  const { formatDateTime } = useIntl();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const exagoLoadingRef = useRef(false);
  const businessUnitId = customerStore?.selectedEntity?.businessUnitId ?? 0;
  const [isReportManagerInitialized, setReportManagerInitialized] = useState(false);
  const customerId = customerStore?.selectedEntity?.id ?? 0;
  const selectedReport = reportStore.selectedEntity;

  useEffect(() => {
    if (selectedReport && !exagoLoadingRef.current) {
      exagoLoadingRef.current = false;

      (async () => {
        try {
          await exagoStore.instance?.DisposePage();

          setReportManagerInitialized(false);
          exagoLoadingRef.current = true;

          await exagoStore.createReportSession({
            options: {
              OnLoad: () => {
                setReportManagerInitialized(true);
                exagoLoadingRef.current = false;
              },
            },
            businessUnitId,
            fromDate: formatDateTime(reportStore.startDate, { timeZone: localTimeZone })
              .dateDefault,
            toDate: formatDateTime(reportStore.endDate, { timeZone: localTimeZone }).dateDefault,
            reportType: 'view',
            customerId,
          });
        } catch (error) {
          console.error('Exago initialization Error', error);
        }
      })();
    }
  }, [
    businessUnitId,
    exagoStore,
    formatDateTime,
    reportStore.endDate,
    reportStore.startDate,
    selectedReport,
    customerStore?.selectedEntity?.id,
    customerId,
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
      const params = [
        {
          Name: 'fromDate',
          Value: reportStore.startDate,
        },
        {
          Name: 'toDate',
          Value: reportStore.endDate,
        },
        {
          Name: 'businessUnitId',
          Value: businessUnitId,
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
    reportStore.startDate,
  ]);

  return (
    <QuickViewStyles.Wrapper>
      <QuickViewStyles.CrossIcon onClick={onClose} />
      <QuickViewStyles.Container>
        <Layouts.Scroll>
          <Layouts.Padding padding='3'>
            <Typography variant='headerThree'>{selectedReport?.reportName}</Typography>
            <Typography variant='bodyMedium' color='secondary' shade='light'>{`${
              formatDateTime(reportStore.startDate, { timeZone: localTimeZone }).date
            } - ${
              formatDateTime(reportStore.endDate, { timeZone: localTimeZone }).date
            }`}</Typography>
          </Layouts.Padding>
          <ExagoImageWrapper position='relative' height='75%' ref={containerRef} />
        </Layouts.Scroll>
      </QuickViewStyles.Container>
    </QuickViewStyles.Wrapper>
  );
};

export default observer(ReportQuickViewContent);
