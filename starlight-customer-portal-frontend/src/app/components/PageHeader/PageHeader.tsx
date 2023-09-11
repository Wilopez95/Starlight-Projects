import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  ClickOutHandler,
  CollapsibleBar,
  EditIcon,
  Layouts,
  GlobalMenuIcon,
  HelpIcon,
  LogOutIcon,
  Typography,
  UserIcon,
} from '@starlightpro/shared-components';
import type { RawTimeZone } from '@vvo/tzdb';
import { observer } from 'mobx-react-lite';

import { CollapsibleBarHeader } from '@root/app/components/СollapsibleBarHeader/СollapsibleBarHeader';
import { EditProfileModal } from '@root/app/modals';
import { LobbyMenu } from '@root/auth/widgets';
import { Logo } from '@root/core/common';
import { Divider } from '@root/core/common/TableTools';
import { getDefaultLogo } from '@root/core/helpers';
import { useStores, useToggle, useUserContext } from '@root/core/hooks';
import { IContactFormData } from '@root/customer/forms/EditMyContact/types';

import { IPageHeader } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'components.PageHeader.Text.';

const PageHeader: React.FC<IPageHeader> = ({ children }) => {
  const { logOut } = useUserContext();

  const [isEditProfileModalOpen, toggleEditProfileModalOpen] = useToggle();
  const [isMenuOpen, toggleMenuOpen] = useToggle();

  const { customerStore, contactStore } = useStores();
  const currentCustomer = customerStore.selectedEntity;

  const timeZonesRef = useRef<RawTimeZone[]>([]);

  const { t } = useTranslation();

  const onEditProfileSubmit = useCallback(
    (data: IContactFormData) => {
      toggleEditProfileModalOpen();
      (async () => {
        await contactStore.updateMe(data);
        if (currentCustomer) {
          const customer = await customerStore.requestById(currentCustomer.id);

          if (customer) {
            customerStore.updateSelectedEntity(customer);
          }
        }
      })();
    },
    [contactStore, currentCustomer, customerStore, toggleEditProfileModalOpen],
  );

  useEffect(() => {
    import('@vvo/tzdb').then(({ rawTimeZones }) => (timeZonesRef.current = rawTimeZones));
  }, []);

  const childrenComponent = useMemo(() => {
    return typeof children === 'string' ? (
      <div className={styles.headerTitle}>{children}</div>
    ) : (
      <div>{children}</div>
    );
  }, [children]);

  return (
    <nav className={styles.header}>
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={toggleEditProfileModalOpen}
        onFormSubmit={onEditProfileSubmit}
        contact={contactStore.me}
      />
      <div className={styles.logoContainer}>
        <GlobalMenuIcon className={styles.menuIcon} onClick={toggleMenuOpen} />
        {isMenuOpen && (
          <ClickOutHandler onClickOut={toggleMenuOpen}>
            <div className={styles.menuPosition}>
              <LobbyMenu />
            </div>
          </ClickOutHandler>
        )}
        <Logo defaultLogo={getDefaultLogo(currentCustomer?.name || '')} />
        <div className={styles.nameContainer}>
          <div className={styles.name}>{currentCustomer?.name}</div>
          <div className={styles.secondName}>{currentCustomer?.businessUnit.nameLine1}</div>
        </div>
        <Layouts.Margin left='2'>
          {currentCustomer?.onHold ? (
            <Badge color='alert'>{t('Text.OnHold')}</Badge>
          ) : (
            <Badge color='success'>{t('Text.Active')}</Badge>
          )}
        </Layouts.Margin>
      </div>
      <div className={styles.dataContainer}>
        {childrenComponent}
        <Layouts.Flex as={Layouts.Padding} alignItems='center' right='3'>
          <HelpIcon className={styles.iconContainer} />
          <CollapsibleBar
            beforeIcon={UserIcon}
            label={<CollapsibleBarHeader name={contactStore.me?.name || ''} />}
            absolute
            beforeIconClassName={styles.userIcon}
            containerClassName={styles.bar}
          >
            <Layouts.Padding top='2' left='2' right='2' className={styles.menuBody}>
              <Divider className={styles.menuDivider} />
              <Layouts.Flex
                justifyContent='space-between'
                className={styles.userDropdownItem}
                onClick={toggleEditProfileModalOpen}
              >
                <Typography color='secondary' shade='desaturated'>
                  {t(`${I18N_PATH}EditProfile`)}
                </Typography>
                <EditIcon />
              </Layouts.Flex>
              <Layouts.Flex
                justifyContent='space-between'
                className={styles.userDropdownItem}
                onClick={logOut}
              >
                <Typography color='alert' shade='light'>
                  {t(`${I18N_PATH}LogOut`)}
                </Typography>
                <LogOutIcon />
              </Layouts.Flex>
            </Layouts.Padding>
          </CollapsibleBar>
        </Layouts.Flex>
      </div>
    </nav>
  );
};

export default observer(PageHeader);
