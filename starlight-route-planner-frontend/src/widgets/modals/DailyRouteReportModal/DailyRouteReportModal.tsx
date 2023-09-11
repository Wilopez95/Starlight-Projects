import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Typography } from '@starlightpro/shared-components';

import { LoadingIndicator } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';
import { IDailyRouteReport } from '@root/types';

import { IFrame, Modal } from './styles';

interface IProps {
  dailyRouteServiceDate: string;
  dailyRouteNumber: number;
  dailyRouteReport?: IDailyRouteReport;
  onClose(): void;
}

const I18N_PATH_ROOT = 'Text.';

export const DailyRouteReportModal: React.FC<IProps> = ({
  dailyRouteReport,
  dailyRouteServiceDate,
  dailyRouteNumber,
  onClose,
}) => {
  const { t } = useTranslation();
  const { formatDateTime } = useIntl();

  const formattedServiceDate = useMemo(() => {
    return formatDateTime(new Date(dailyRouteServiceDate)).popupDate;
  }, [dailyRouteServiceDate, formatDateTime]);

  return (
    <Modal isOpen onClose={onClose}>
      <Layouts.Padding top="2" right="3" bottom="2" left="3">
        <Typography color="default" variant="headerThree">
          <>
            #{dailyRouteNumber} {t(`${I18N_PATH_ROOT}RouteSheet`)}
          </>
        </Typography>
        <Typography color="secondary" shade="light" variant="bodyMedium">
          {formattedServiceDate}
        </Typography>
      </Layouts.Padding>
      {dailyRouteReport ? (
        <>
          <IFrame src={dailyRouteReport.pdfUrl} />
          <Layouts.Padding top="2" right="3" bottom="2" left="3">
            <Layouts.Flex justifyContent="flex-end">
              <a href={dailyRouteReport.pdfUrl} target="_blank" rel="noreferrer">
                <Button variant="primary">{t(`${I18N_PATH_ROOT}Download`)}</Button>
              </a>
            </Layouts.Flex>
          </Layouts.Padding>
        </>
      ) : (
        <LoadingIndicator />
      )}
    </Modal>
  );
};
