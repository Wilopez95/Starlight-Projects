import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { Table, TableBody, TableInfiniteScroll, TableTools } from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useCleanup, useCrudPermissions, useStores } from '@root/hooks';
import { PageHeader } from '@root/pages/SystemConfiguration/components';
import { RoleQuickView } from '@root/quickViews';
import { Role } from '@root/stores/entities';

import { routesNavigationConfig } from '../../navigationConfig';

import { RoleHeader } from './RoleHeader';
import { RoleRow } from './RoleRow';

const I18N_PATH = 'pages.SystemConfiguration.tables.UsersAndRoles.Text.';

const RolesPage: React.FC = () => {
  const [canViewUsersAndRoles, , canCreateUsersAndRoles] = useCrudPermissions(
    'configuration',
    'users',
  );

  const { roleStore, systemConfigurationStore, resourceStore } = useStores();
  const tbodyContainerRef = useRef(null);

  const { t } = useTranslation();

  useCleanup(roleStore);

  const handleSelectUser = useCallback(
    (role: Role) => {
      roleStore.selectEntity(role);
    },
    [roleStore],
  );

  useEffect(() => {
    resourceStore.request();

    if (!canViewUsersAndRoles) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    } else {
      roleStore.cleanup();
      roleStore.request();
    }
  }, [canViewUsersAndRoles, resourceStore, roleStore]);

  const loadRoles = useCallback(() => {
    if (!canViewUsersAndRoles) {
      return;
    }

    roleStore.request();
  }, [canViewUsersAndRoles, roleStore]);

  return (
    <>
      <PageHeader
        button={canCreateUsersAndRoles ? t(`${I18N_PATH}AddNewRole`) : undefined}
        title={t(`${I18N_PATH}UsersAndRoles`)}
      />
      <RoleQuickView
        isOpen={roleStore.isOpenQuickView || systemConfigurationStore.isCreating}
        clickOutContainers={tbodyContainerRef}
      />

      <TableTools.ScrollContainer
        tableNavigation={<TableTools.HeaderNavigation routes={routesNavigationConfig} />}
      >
        <Table>
          <RoleHeader />
          <TableBody
            cells={3}
            loading={roleStore.loading}
            ref={tbodyContainerRef}
            noResult={roleStore.noResult}
          >
            {roleStore.sortedValues.map(role => (
              <RoleRow
                item={role}
                selectedItem={roleStore.selectedEntity}
                key={role.id}
                onSelect={handleSelectUser}
              />
            ))}
          </TableBody>
        </Table>
        <TableInfiniteScroll
          onLoaderReached={loadRoles}
          loaded={roleStore.loaded}
          loading={roleStore.loading}
        >
          Loading
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(RolesPage);
