import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { PlusIcon } from '@root/assets';
import { Typography } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TablePageContainer,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { Paths, Routes } from '@root/consts';
import { enableRecyclingFeatures, isCore } from '@root/consts/env';
import { NotificationHelper, pathToUrl } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useCrudPermissions, useStores } from '@root/hooks';
import { BusinessUnitType } from '@root/types';

const I18N_PATH = 'pages.SystemConfiguration.tables.BusinessUnits.Text.';

const ConfigurationBusinessUnits: React.FC = () => {
  const { businessUnitStore } = useStores();
  const [canViewBusinessUnits, _, canCreateBusinessUnits] = useCrudPermissions(
    'configuration',
    'business-units',
  );

  const history = useHistory();

  const { t } = useTranslation();

  useEffect(() => {
    if (canViewBusinessUnits) {
      businessUnitStore.request();
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [businessUnitStore, canViewBusinessUnits]);

  const handleRowClick = (id: number, type: BusinessUnitType) => {
    if (!canViewBusinessUnits) {
      return;
    }

    history.push(
      pathToUrl(Paths.SystemConfigurationModule.BusinessUnit, {
        id,
        businessUnitType: type,
      }),
    );
  };

  return (
    <TablePageContainer>
      <Helmet title={t('Titles.BusinessUnits')} />
      <Layouts.Margin top="2" bottom="2">
        <Layouts.Flex alignItems="center" justifyContent="space-between">
          <Typography as="h1" variant="headerTwo" fontWeight="bold">
            Business Units
          </Typography>
          {canCreateBusinessUnits ? (
            <Layouts.Flex>
              {isCore ||
                (enableRecyclingFeatures && (
                  <Layouts.Margin right="0.5">
                    <Link
                      to={pathToUrl(Paths.SystemConfigurationModule.BusinessUnit, {
                        id: Routes.Create,
                        businessUnitType: BusinessUnitType.RECYCLING_FACILITY,
                      })}
                    >
                      <Button variant="primary" iconLeft={PlusIcon}>
                        {t(`${I18N_PATH}AddNewFacility`)}
                      </Button>
                    </Link>
                  </Layouts.Margin>
                ))}
              <Link
                to={pathToUrl(Paths.SystemConfigurationModule.BusinessUnit, {
                  id: Routes.Create,
                  businessUnitType: BusinessUnitType.HAULING,
                })}
              >
                <Button variant="primary" iconLeft={PlusIcon}>
                  {t(`${I18N_PATH}AddNewBusinessUnit`)}
                </Button>
              </Link>
            </Layouts.Flex>
          ) : null}
        </Layouts.Flex>
      </Layouts.Margin>
      <TableTools.ScrollContainer>
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>
              {t(`${I18N_PATH}BusinessUnitName`, { number: 1 })}
            </TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={100}>
              {t(`${I18N_PATH}BusinessUnitName`, { number: 2 })}
            </TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={200}>
              {t(`${I18N_PATH}LinesOfBusiness`)}
            </TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody loading={businessUnitStore.loading} cells={3}>
            {businessUnitStore.sortedValues.map(
              ({ id, nameLine1, nameLine2, type, businessLines }) => (
                <TableRow key={id} onClick={() => handleRowClick(id, type)}>
                  <TableCell>
                    <Typography ellipsis fontWeight="medium">
                      {nameLine1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography ellipsis>{nameLine2}</Typography>
                  </TableCell>
                  <TableCell>
                    {type === BusinessUnitType.RECYCLING_FACILITY
                      ? t(`${I18N_PATH}RecyclingLineOfBusiness`)
                      : businessLines.map(({ name }) => name).join(', ')}
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(ConfigurationBusinessUnits);
