import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CollapsibleBar, Layouts } from '@starlightpro/shared-components';
import { type RawTimeZone } from '@vvo/tzdb';
import cx from 'classnames';
import { differenceInSeconds } from 'date-fns';
import { observer } from 'mobx-react-lite';

import {
  ClockInIcon,
  ClockOutIcon,
  GlobalMenuIcon,
  HelpIcon,
  LogOutIcon,
  RemindersIcon,
  SettingsIcon,
  UserIcon,
} from '@root/assets';
import { Protected, Tooltip, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { isCore } from '@root/consts/env';
import { RouteModules } from '@root/consts/routing';
import { getDefaultLogo, handleEnterOrSpaceKeyDown, parseDate, pathToUrl } from '@root/helpers';
import {
  useBoolean,
  useOverlayController,
  useStores,
  useTimeZone,
  useUserContext,
} from '@root/hooks';
import { Languages } from '@root/i18n/config/language';
import { useIntl } from '@root/i18n/useIntl';
import ReminderQuickView from '@root/quickViews/ReminderQuickView/ReminderQuickView';

import LobbyMenu from '../LobbyMenu/LobbyMenu';
import ConfirmModal from '../modals/Confirm/Confirm';

import * as Styles from './styles';
import { IPageHeader } from './types';
import { useHeaderInfo } from './useHeaderInfo';

import styles from './css/styles.scss';

const I18N_PATH = 'components.PageHeader.Text.';

const PageHeader: React.FC<IPageHeader> = ({ children, domainType = 'businessUnit' }) => {
  const { currentUser, logOut, clockOut, clockIn, currentClockInOut } = useUserContext();
  const [zIndex, registerZIndex, unRegisterZIndex] = useOverlayController();

  const [clockedIn, setClockedIn] = useState(0);
  const [isClockOutModalOpen, showClockOutModal, hideClockOutModal] = useBoolean();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { businessUnitStore, i18nStore, reminderStore } = useStores();

  const { name: languageName } = useIntl();

  const { timeZone } = useTimeZone();
  const { t } = useTranslation();
  const logoContainerRef = useRef<HTMLDivElement>(null);

  const timeZonesRef = useRef<RawTimeZone[]>([]);
  const reminderBtnRef = useRef<HTMLSpanElement>(null);

  const { logoUrl, subTitle, title } = useHeaderInfo(domainType);

  const currentTimeZone = timeZonesRef.current.find(
    timeZoneOption => (timeZoneOption?.name ?? '') === timeZone,
  );

  const unit = businessUnitStore.selectedEntity;

  useEffect(() => {
    import('@vvo/tzdb').then(({ rawTimeZones }) => (timeZonesRef.current = rawTimeZones));
  }, []);

  useEffect(() => {
    reminderStore.cleanup();
    reminderStore.getAllUserReminders();
  }, [reminderStore]);

  useEffect(() => {
    let clockedInTimer: number;

    if (currentClockInOut) {
      clockedInTimer = window.setInterval(() => {
        setClockedIn(seconds => seconds + 1);
      }, 1000);
    }

    return () => clearInterval(clockedInTimer);
  }, [currentClockInOut]);

  const startTime = useMemo(() => {
    return currentClockInOut?.clockIn
      ? differenceInSeconds(new Date(), parseDate(currentClockInOut?.clockIn))
      : 0;
  }, [currentClockInOut?.clockIn]);

  const formattedTime = useMemo(() => {
    const clockedTime = startTime + clockedIn;
    const hours = `0${Math.floor(clockedTime / 3600)}`.slice(-2);
    const minutes = `0${Math.floor((clockedTime % 3600) / 60)}`.slice(-2);
    const seconds = `0${clockedTime % 60}`.slice(-2);

    return `${hours}:${minutes}:${seconds}`;
  }, [clockedIn, startTime]);

  const childrenComponent = useMemo(() => {
    return typeof children === 'string' ? (
      <div className={styles.headerTitle}>{children}</div>
    ) : (
      <div>{children}</div>
    );
  }, [children]);

  const handleLogOutClockOut = useCallback(async () => {
    await clockOut();
    hideClockOutModal();
    setClockedIn(0);
    logOut();
  }, [clockOut, hideClockOutModal, logOut]);

  const handleClockOut = useCallback(() => {
    clockOut(false);
    setClockedIn(0);
  }, [clockOut]);

  const handleClockOutKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        handleClockOut();
      }
    },
    [handleClockOut],
  );

  const handleClockInKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        clockIn();
      }
    },
    [clockIn],
  );

  const handleCloseOpen = useCallback(() => {
    setIsMenuOpen(false);
    unRegisterZIndex();
  }, [setIsMenuOpen, unRegisterZIndex]);

  const handleToggleMenuOpen = useCallback(() => {
    setIsMenuOpen(prev => {
      if (prev) {
        unRegisterZIndex();

        return false;
      }
      registerZIndex();

      return true;
    });
  }, [registerZIndex, unRegisterZIndex]);

  const handleMenuOpenOnKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        handleToggleMenuOpen();
      }
    },
    [handleToggleMenuOpen],
  );

  const handleLogOutKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        !!currentUser?.company?.clockIn && !!currentClockInOut ? showClockOutModal() : logOut();
      }
    },
    [currentClockInOut, currentUser?.company?.clockIn, logOut, showClockOutModal],
  );

  const handleLanguageSelect = useCallback(
    (lang: Languages) => () => {
      i18nStore.setLanguage(lang);
    },
    [i18nStore],
  );

  const handleLanguageSelectOnKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>, lang: Languages) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        i18nStore.setLanguage(lang);
      }
    },
    [i18nStore],
  );

  const collapsibleBarHeader = useMemo(
    () => (
      <Layouts.Flex direction="column">
        <Typography variant="headerFive" color="white">
          {`${t(`${I18N_PATH}Hi`)}, ${currentUser?.name ?? ''}`}
        </Typography>
        <Typography variant="bodySmall" color="grey">
          {currentTimeZone?.alternativeName}
        </Typography>
      </Layouts.Flex>
    ),
    [currentTimeZone?.alternativeName, currentUser, t],
  );

  const isReminderQuickViewOpen = !isCore && reminderStore.isOpenQuickView;

  return (
    <Styles.NavBar zIndex={zIndex}>
      <ConfirmModal
        isOpen={isClockOutModalOpen}
        cancelButton={t(`${I18N_PATH}CancelButton`)}
        submitButton={t(`${I18N_PATH}ClockOut`)}
        title={t(`${I18N_PATH}TitleClockOut`)}
        subTitle={t(`${I18N_PATH}SubTitleClockOut`)}
        onCancel={logOut}
        onClose={hideClockOutModal}
        onSubmit={handleLogOutClockOut}
        nonDestructive
      />

      {!isCore ? (
        <ReminderQuickView
          isOpen={isReminderQuickViewOpen}
          clickOutContainers={reminderBtnRef}
          onAfterClose={() => reminderStore.toggleQuickView(false)}
        />
      ) : null}

      {isMenuOpen ? (
        <Styles.LobbyMenuContainer
          onClickOut={handleCloseOpen}
          subContainers={logoContainerRef}
          zIndex={zIndex}
        >
          <LobbyMenu handleMenuClose={handleCloseOpen} />
        </Styles.LobbyMenuContainer>
      ) : null}

      <div
        ref={logoContainerRef}
        className={styles.logoContainer}
        onClick={handleToggleMenuOpen}
        onKeyDown={handleMenuOpenOnKeyDown}
      >
        <GlobalMenuIcon role="button" aria-label="units" tabIndex={0} className={styles.menuIcon} />
        <div className={styles.logoImgWrapper}>
          {logoUrl ? (
            <img alt="" src={logoUrl} className={styles.logo} />
          ) : (
            <div className={styles.menuItemImgWrapper}>
              <Typography ellipsis color="white" className={styles.defaultLogo}>
                {getDefaultLogo(title)}
              </Typography>
            </div>
          )}
        </div>
        <Tooltip
          position="right"
          text={
            <>
              <div className={styles?.name}>{title}</div>
              <div className={styles.secondName}>{subTitle}</div>
            </>
          }
        >
          <div>
            <div className={styles?.name}>{title}</div>
            <div className={styles.secondName}>{subTitle}</div>
          </div>
        </Tooltip>
      </div>
      <div className={styles.dataContainer}>
        {childrenComponent}
        <div className={styles.userContainer}>
          <Protected permissions="subscriptions:place-new:perform">
            <span
              ref={reminderBtnRef}
              className={cx({
                [styles.iconWrapper]: reminderStore.hasUnreadReminders,
              })}
            >
              <RemindersIcon
                className={styles.iconContainer}
                aria-label="reminder"
                tabIndex={0}
                onClick={() => reminderStore.toggleQuickView()}
              />
            </span>
          </Protected>
          <HelpIcon className={styles.iconContainer} aria-label="help" tabIndex={1} />
          {unit && domainType === 'businessUnit' ? (
            <Link
              to={pathToUrl(RouteModules.BusinessUnitConfiguration, {
                businessUnit: unit.id,
                businessLine: undefined,
              })}
              aria-label="settings"
            >
              <SettingsIcon className={styles.iconContainer} />
            </Link>
          ) : null}

          <CollapsibleBar
            label={
              <Layouts.Flex direction="column">
                <Typography variant="headerFive" color="white">
                  {languageName}
                </Typography>
              </Layouts.Flex>
            }
            absolute
            containerClassName={styles.languageBar}
            openedClassName={styles.languageContainerBack}
            duration={0}
            shouldCloseOnClickOut
          >
            <li role="menuitem">
              <Layouts.Padding top="0" left="2" right="2" className={styles.languageContainerBack}>
                <Divider className={styles.menuDivider} />
                {i18nStore.languagesList.map(({ id, name }) => (
                  <Layouts.Flex
                    as={Layouts.Hover}
                    color="white"
                    justifyContent="space-between"
                    role="button"
                    tabIndex={0}
                    className={styles.userDropdownItem}
                    onClick={handleLanguageSelect(id)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLOrSVGElement>) =>
                      handleLanguageSelectOnKeyDown(e, id)
                    }
                    key={id}
                  >
                    <Typography color="grey">{name}</Typography>
                  </Layouts.Flex>
                ))}
              </Layouts.Padding>
            </li>
          </CollapsibleBar>

          <CollapsibleBar
            beforeIcon={UserIcon}
            label={collapsibleBarHeader}
            absolute
            beforeIconClassName={styles.userIcon}
            containerClassName={styles.bar}
            openedClassName={styles.languageContainerBack}
            duration={0}
            shouldCloseOnClickOut
          >
            <li role="menuitem">
              <Layouts.Padding top="2" left="2" right="2" className={styles.menuBody}>
                <Divider className={styles.menuDivider} />
                {currentClockInOut ? (
                  <>
                    <Layouts.Flex
                      justifyContent="space-between"
                      className={styles.userDropdownItem}
                    >
                      <Typography color="grey">{t(`${I18N_PATH}ClockIn`)}:</Typography>
                      <Typography color="grey">{formattedTime}</Typography>
                    </Layouts.Flex>
                    <Divider className={styles.menuDivider} />
                    <Layouts.Flex
                      as={Layouts.Hover}
                      color="white"
                      tabIndex={0}
                      justifyContent="space-between"
                      className={styles.userDropdownItem}
                      onClick={handleClockOut}
                      onKeyDown={handleClockOutKeyDown}
                      role="button"
                    >
                      <Typography color="grey">{t(`${I18N_PATH}ClockOut`)}</Typography>
                      <ClockOutIcon />
                    </Layouts.Flex>
                  </>
                ) : (
                  <Layouts.Flex
                    as={Layouts.Hover}
                    color="white"
                    tabIndex={0}
                    justifyContent="space-between"
                    className={styles.userDropdownItem}
                    onClick={clockIn}
                    onKeyDown={handleClockInKeyDown}
                    role="button"
                  >
                    <Typography color="grey">{t(`${I18N_PATH}ClockIn`)}</Typography>
                    <ClockInIcon />
                  </Layouts.Flex>
                )}

                <Layouts.Flex
                  justifyContent="space-between"
                  className={styles.userDropdownItem}
                  onClick={
                    !!currentUser?.company?.clockIn && !!currentClockInOut
                      ? showClockOutModal
                      : logOut
                  }
                  onKeyDown={handleLogOutKeyDown}
                  tabIndex={0}
                  role="button"
                >
                  <Typography color="alert" shade="light">
                    {t(`${I18N_PATH}LogOut`)}
                  </Typography>
                  <LogOutIcon className={styles.redOnHover} />
                </Layouts.Flex>
              </Layouts.Padding>
            </li>
          </CollapsibleBar>
        </div>
      </div>
    </Styles.NavBar>
  );
};

export default observer(PageHeader);
