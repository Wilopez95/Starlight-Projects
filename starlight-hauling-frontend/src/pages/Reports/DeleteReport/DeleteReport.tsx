import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import * as Sentry from '@sentry/react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { BackIcon } from '@root/assets';
import { Typography } from '@root/common';
import { BusinessUnitLayout } from '@root/components/PageLayouts/BusinessUnitLayout';
import { Routes } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { ApiError } from '@root/api/base/ApiError';
import { ReportWrapper } from '../styles';

const I18N_PATH = 'pages.Reports.Text.';
const DeleteReport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const exagoLoadingRef = useRef(false);
  const { t } = useTranslation();
  const [isReportManagerInitialized, setReportManagerInitialized] = useState(false);

  const { exagoStore } = useStores();
  const { businessUnitId } = useBusinessContext();

  const history = useHistory();
  const { formatDateTime } = useIntl();

  useEffect(() => {
    if (!exagoLoadingRef.current) {
      exagoLoadingRef.current = false;

      (async () => {
        try {
          await exagoStore.instance?.DisposePage();

          setReportManagerInitialized(false);
          exagoLoadingRef.current = true;

          await exagoStore.initDeleteReportSession({
            OnLoad: () => {
              setReportManagerInitialized(true);
              exagoLoadingRef.current = false;
            },
            businessUnitId: +businessUnitId,
          });
        } catch (error: unknown) {
          const typedError = error as ApiError;
          Sentry.addBreadcrumb({
            category: 'Exago',
            message: `Exago Delete Error ${JSON.stringify(typedError?.message)}`,
          });
          Sentry.captureException(typedError);
        }
      })();
    }
  }, [businessUnitId, exagoStore, formatDateTime]);

  const handleBack = useCallback(() => {
    const backUrl = `/${Routes.BusinessUnits}/${businessUnitId}/${Routes.Reports}/custom`;

    history.push(backUrl);
  }, [businessUnitId, history]);

  useEffect(() => {
    if (
      exagoStore.instance &&
      isReportManagerInitialized &&
      !exagoLoadingRef.current &&
      exagoStore.exportType
    ) {
      exagoStore.instance?.LoadFullUI(containerRef.current);
    }
  }, [exagoStore.exportType, exagoStore.instance, isReportManagerInitialized]);

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

export default observer(DeleteReport);
