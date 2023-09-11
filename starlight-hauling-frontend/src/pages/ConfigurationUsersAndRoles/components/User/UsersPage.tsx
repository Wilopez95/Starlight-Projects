import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { Table, TableBody, TableInfiniteScroll, TableTools } from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useCleanup, useCrudPermissions, useStores } from '@root/hooks';
import { PageHeader } from '@root/pages/SystemConfiguration/components';
import { UserQuickView } from '@root/quickViews';
import { User } from '@root/stores/entities';

import { routesNavigationConfig } from '../../navigationConfig';

import { UserHeader } from './UserHeader';
import { UserRow } from './UserRow';

const I18N_PATH = 'pages.SystemConfiguration.tables.UsersAndRoles.Text.';

const UsersPage: React.FC = () => {
  const [canViewUsersAndRoles, _, canCreateUsersAndRoles] = useCrudPermissions(
    'configuration',
    'users',
  );

  const { userStore, systemConfigurationStore, resourceStore, roleStore } = useStores();
  const [search, setSearch] = useState<string>();
  const tbodyContainerRef = useRef(null);

  const { t } = useTranslation();

  useCleanup(userStore);

  const handleSelectUser = useCallback(
    (user: User) => {
      userStore.selectEntity(user);
    },
    [userStore],
  );

  const loadUsers = useCallback(() => {
    if (!canViewUsersAndRoles) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      userStore.markLoaded();
    } else {
      userStore.request({ query: search });
    }
  }, [canViewUsersAndRoles, userStore, search]);

  useEffect(() => {
    resourceStore.request();
    userStore.cleanup();
    roleStore.cleanup();
    roleStore.requestForDisplay();
    loadUsers();
  }, [loadUsers, resourceStore, userStore, roleStore]);

  return (
    <>
      <PageHeader
        button={canCreateUsersAndRoles ? t(`${I18N_PATH}AddNewUser`) : undefined}
        title={t(`${I18N_PATH}UsersAndRoles`)}
      />
      <UserQuickView
        isOpen={userStore.isOpenQuickView || systemConfigurationStore.isCreating}
        clickOutContainers={tbodyContainerRef}
      />

      <TableTools.ScrollContainer
        tableNavigation={
          <TableTools.HeaderNavigation
            routes={routesNavigationConfig}
            onSearch={setSearch}
            placeholder="Search Users"
          />
        }
      >
        <Table>
          <UserHeader />
          <TableBody
            cells={5}
            loading={userStore.loading}
            ref={tbodyContainerRef}
            noResult={userStore.noResult}
          >
            {userStore.sortedValues.map(user => (
              <UserRow
                item={user}
                selectedItem={userStore.selectedEntity}
                key={user.id}
                onSelect={handleSelectUser}
              />
            ))}
          </TableBody>
        </Table>
        <TableInfiniteScroll
          onLoaderReached={loadUsers}
          loaded={userStore.loaded}
          loading={userStore.loading}
          initialRequest={false}
        >
          Loading
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(UsersPage);
