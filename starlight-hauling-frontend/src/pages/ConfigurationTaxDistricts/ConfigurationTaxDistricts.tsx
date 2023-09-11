import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { Badge, Tooltip, Typography } from '@root/common';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TablePageContainer,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { formatTaxDistrictDescription, NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useCrudPermissions, useStores } from '@root/hooks';
import configurationStyle from '@root/pages/SystemConfiguration/css/styles.scss';
import { TaxDistrictQuickView } from '@root/quickViews';
import { TaxDistrictType } from '@root/types';

import { PageHeader } from '../SystemConfiguration/components';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.TaxDistricts.Text.';

const TaxDistrictsTable: React.FC = () => {
  const [canViewDistricts, _, canCreateDistricts] = useCrudPermissions(
    'configuration',
    'tax-districts',
  );

  const { t } = useTranslation();
  const tableContainerRef = useRef(null);

  const { taxDistrictStore, systemConfigurationStore, i18nStore } = useStores();

  const selectedTaxDistrict = taxDistrictStore.selectedEntity;

  useEffect(() => {
    if (canViewDistricts) {
      taxDistrictStore.request();
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [taxDistrictStore, canViewDistricts]);

  const countryLevelDistrict = taxDistrictStore.sortedValues.find(
    district => district.districtType === TaxDistrictType.Country,
  );

  return (
    <TablePageContainer id="pageContainer">
      <Helmet title={t('Titles.TaxDistricts')} />
      <PageHeader
        button={canCreateDistricts ? t(`${I18N_PATH}AddNewTaxDistrict`) : undefined}
        title={t(`${I18N_PATH}TaxDistricts`)}
      />
      <TableTools.ScrollContainer>
        <TaxDistrictQuickView
          clickOutContainers={tableContainerRef}
          isOpen={taxDistrictStore.isOpenQuickView || systemConfigurationStore.isCreating}
        />
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>{t('Text.Status')}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t('Text.Description')}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}DistrictType`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}TaxesDescription`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}MapCode`)}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody cells={5} loading={taxDistrictStore.loading} ref={tableContainerRef}>
            {countryLevelDistrict ? (
              <>
                <TableRow
                  onClick={() => {
                    taxDistrictStore.selectEntity(countryLevelDistrict);
                  }}
                  selected={selectedTaxDistrict?.id === countryLevelDistrict.id}
                >
                  <TableCell>
                    <StatusBadge active={countryLevelDistrict.active} />
                  </TableCell>
                  <TableCell maxWidth={400}>
                    <Typography ellipsis>{countryLevelDistrict.description}</Typography>
                  </TableCell>
                  <TableCell maxWidth={400}>
                    <Typography ellipsis>
                      {t(
                        `${I18N_PATH}LocalDistrictTypes.${i18nStore.region}.${TaxDistrictType.Country}`,
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    {!countryLevelDistrict.taxDescription &&
                    countryLevelDistrict.useGeneratedDescription ? (
                      <Typography color="secondary">{t(`${I18N_PATH}NoTaxes`)}</Typography>
                    ) : (
                      <Tooltip
                        text={
                          <div className={styles.tooltip}>
                            {countryLevelDistrict.taxDescription}
                          </div>
                        }
                      >
                        <span className={configurationStyle.tableCellDescription}>
                          {formatTaxDistrictDescription(
                            countryLevelDistrict.taxDescription ?? '',
                            ';',
                          )}
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>

                  <TableCell maxWidth={400}>
                    <Badge color="success">{t(`${I18N_PATH}Added`)}</Badge>
                  </TableCell>
                </TableRow>
                <Divider colSpan={5} />
              </>
            ) : null}
            {taxDistrictStore.sortedValues
              .filter(district => district.districtType !== TaxDistrictType.Country)
              .map(item => (
                <TableRow
                  key={item.id}
                  onClick={() => {
                    taxDistrictStore.selectEntity(item);
                  }}
                  selected={selectedTaxDistrict?.id === item.id}
                >
                  <TableCell>
                    <StatusBadge active={item.active} />
                  </TableCell>
                  <TableCell maxWidth={400}>
                    <Typography ellipsis>{item.description}</Typography>
                  </TableCell>
                  <TableCell maxWidth={400}>
                    <Typography ellipsis>
                      {t(`${I18N_PATH}LocalDistrictTypes.${i18nStore.region}.${item.districtType}`)}
                    </Typography>
                  </TableCell>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    {!item.taxDescription && item.useGeneratedDescription ? (
                      <Typography color="secondary">{t(`${I18N_PATH}NoTaxes`)}</Typography>
                    ) : (
                      <Tooltip text={<div className={styles.tooltip}>{item.taxDescription}</div>}>
                        <span className={configurationStyle.tableCellDescription}>
                          {formatTaxDistrictDescription(item.taxDescription ?? '', ';')}
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>

                  <TableCell maxWidth={400}>
                    {item.districtCode ? (
                      <Badge color="success">{t(`${I18N_PATH}Added`)}</Badge>
                    ) : (
                      <Badge color="alert">{t(`${I18N_PATH}Missing`)}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(TaxDistrictsTable);
