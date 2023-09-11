import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { Badge } from '@root/common';
import { Table, TableBody, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { DomainsQuickView } from '@root/quickViews';

const I18N_PATH = 'pages.SystemConfiguration.tables.CompanySettings.components.Domains.Text.';

const Domains: React.FC = () => {
  const tbodyContainerRef = useRef(null);

  const { systemConfigurationStore, domainStore } = useStores();
  const { t } = useTranslation();

  const selectedDomain = domainStore.selectedEntity;

  const loadDomains = useCallback(() => {
    domainStore.request();
  }, [domainStore]);

  useEffect(loadDomains, [loadDomains]);

  return (
    <TableTools.ScrollContainer>
      <DomainsQuickView
        clickOutContainers={tbodyContainerRef}
        isOpen={systemConfigurationStore.isCreating || domainStore.isOpenQuickView}
      />
      <Table>
        <TableTools.Header>
          <TableTools.HeaderCell minWidth={150}>{t(`${I18N_PATH}Domain`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell minWidth={50}>{t(`Text.Status`)}</TableTools.HeaderCell>
        </TableTools.Header>
        <TableBody ref={tbodyContainerRef} cells={2} loading={domainStore.loading}>
          {domainStore.values.map(domain => (
            <TableRow
              key={domain.id}
              onClick={() => {
                domainStore.selectEntity(domain);
              }}
              selected={selectedDomain?.id === domain.id}
            >
              <TableCell>{domain.name}</TableCell>
              <TableCell>
                <Badge color={domain.validationStatus === 'pending' ? 'primary' : 'success'}>
                  {domain.validationStatus === 'pending'
                    ? t(`${I18N_PATH}PendingValidation`)
                    : t(`${I18N_PATH}Validated`)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableTools.ScrollContainer>
  );
};

export default observer(Domains);
