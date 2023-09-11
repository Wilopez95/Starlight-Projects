import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TablePageContainer,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { BusinessLineTypes } from '@root/consts';
import { PageHeader } from '@root/pages/SystemConfiguration/components';
import { ConfigurationBusinessLineQuickView } from '@root/quickViews';
import { useStores } from '@hooks';

const I18N_PATH = 'pages.SystemConfiguration.tables.BusinessLines.Text.';

const ConfigurationBusinessLines: React.FC = () => {
  const { businessLineStore, systemConfigurationStore } = useStores();

  const tbodyContainerRef = useRef(null);

  const { t } = useTranslation();

  const selectedBusinessLine = businessLineStore.selectedEntity;

  useEffect(() => {
    businessLineStore.request();
  }, [businessLineStore]);

  return (
    <TablePageContainer>
      <Helmet title={t('Titles.LinesOfBusiness')} />

      <PageHeader
        title={t(`${I18N_PATH}LinesOfBusiness`)}
        button={t(`${I18N_PATH}AddNewLine`)}
        hideSwitch
      />
      <ConfigurationBusinessLineQuickView
        clickOutContainers={tbodyContainerRef}
        isOpen={businessLineStore.isOpenQuickView || systemConfigurationStore.isCreating}
      />

      <TableTools.ScrollContainer>
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={100}>{t(`Text.Status`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={100}>{t(`Text.Name`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={100}>{t(`Text.Type`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={200}>{t(`Text.Description`)}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody ref={tbodyContainerRef} loading={businessLineStore.loading} cells={5}>
            {businessLineStore.sortedValues.map(item => (
              <TableRow
                key={item.id}
                onClick={() => businessLineStore.selectEntity(item)}
                selected={item.id === selectedBusinessLine?.id}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography>{item.name}</Typography>
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography>
                    {startCase(BusinessLineTypes.find(elem => elem.value === item.type)?.label)}
                  </Typography>
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography>{item.description}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(ConfigurationBusinessLines);
