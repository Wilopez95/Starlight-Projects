import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { CompanyService } from '@root/api';
import { Typography } from '@root/common';
import { TablePageContainer } from '@root/common/TableTools';
import { convertDates, NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { usePermission, useStores } from '@root/hooks';
import { type ICompany } from '@root/types';

import {
  CompanyInformationSection,
  LogoInformationSection,
  LogoRequirementsSection,
} from './sections';

const ConfigurationCompanyProfile: React.FC = () => {
  const { t } = useTranslation();
  const [company, setCompany] = useState<ICompany>();
  const [loading, setLoading] = useState(true);
  const canViewCompanyProfile = usePermission('configuration:company-profile:view');
  const { i18nStore } = useStores();

  const setCurrentCompany = useCallback(async () => {
    if (!canViewCompanyProfile) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

      return;
    }

    setLoading(true);
    const response = await CompanyService.currentCompany();

    if (!isEmpty(response)) {
      const companyResponse = convertDates(response);

      setCompany({
        ...companyResponse,
        mailingAddress: { ...companyResponse.mailingAddress, region: i18nStore.region },
        physicalAddress: { ...companyResponse.physicalAddress, region: i18nStore.region },
      });
    }
    setLoading(false);
  }, [canViewCompanyProfile, i18nStore.region]);

  useEffect(() => {
    setCurrentCompany();
  }, [setCurrentCompany]);

  return (
    <TablePageContainer>
      <Layouts.Scroll>
        <Helmet title={t('Titles.CompanyProfile')} />
        <Layouts.Margin top="2" bottom="2">
          <Layouts.Flex alignItems="center" justifyContent="space-between">
            <Typography as="h1" variant="headerTwo" fontWeight="bold">
              {t('pages.SystemConfiguration.tables.Companies.Text.CompanyProfile')}
            </Typography>
          </Layouts.Flex>
        </Layouts.Margin>

        {canViewCompanyProfile ? (
          <>
            <LogoInformationSection
              loading={loading}
              company={company}
              onSetCompany={setCompany}
              onSetCurrentCompany={setCurrentCompany}
            />
            <LogoRequirementsSection />
            <CompanyInformationSection
              loading={loading}
              company={company}
              onSetCompany={setCompany}
              onSetCurrentCompany={setCurrentCompany}
            />
          </>
        ) : null}
      </Layouts.Scroll>
    </TablePageContainer>
  );
};

export default observer(ConfigurationCompanyProfile);
