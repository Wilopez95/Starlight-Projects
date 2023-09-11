import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Layouts,
  Navigation,
  NavigationConfigItem,
  TextInput,
  TextInputElement,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { get } from 'lodash-es';

import { SearchIcon } from '@root/assets';
import { RoutingNavigation } from '@root/common';
import { Typography } from '@root/common/Typography/Typography';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useToggle } from '@root/hooks';

import { FilterContext } from '../TableFilter/context';
import { ITableFilterContext } from '../TableFilter/types';
import { useTableScrollContext } from '../TableScrollContainer/context';

import * as Styles from './styles';
import { type TableNavigationHeaderProps } from './types';

import styles from './css/styles.scss';

export const TableNavigationHeader: React.FC<TableNavigationHeaderProps> = ({
  placeholder,
  numericOnly,
  children,
  onSearch,
  filterable,
  showFilterIcon = true,
  initialSearchValue = '',
  navigationRef = null,
  ...props
}) => {
  const [value, setValue] = useState(initialSearchValue);
  const [isFilterOpen, toggleFilter, setToggleValue] = useToggle(false);
  const [isFilterApplied, setFilterApply] = useState(false);

  const { scrollContainerRef } = useTableScrollContext();

  const { t } = useTranslation();

  const filterContextValue = useMemo<ITableFilterContext>(
    () => ({
      isFilterOpen,
      onChangeAppliedState: setFilterApply,
    }),
    [isFilterOpen],
  );

  const handleTabChange = useCallback(
    (newTab: NavigationConfigItem) => {
      setValue('');
      setToggleValue(false);
      if ('tabs' in props && newTab.key !== props.selectedTab?.key) {
        if (scrollContainerRef?.current) {
          scrollContainerRef.current.scrollTop = 0;
        }

        props.onChangeTab(newTab);
      }
    },
    [props, setToggleValue, scrollContainerRef],
  );

  const handleRouteChange = useCallback(() => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [scrollContainerRef]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<TextInputElement>) => {
      setValue(e.target.value);

      if (e.target.value === '') {
        onSearch?.('');
      }
    },
    [onSearch],
  );

  const handleKeyUp = (e: React.KeyboardEvent<TextInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        toggleFilter();
      }
    },
    [toggleFilter],
  );

  const filterIcon = (
    <Typography cursor="pointer">
      <Layouts.Flex
        tabIndex={0}
        aria-label={t('Text.Filter')}
        onClick={toggleFilter}
        onKeyDown={handleKeyDown}
      >
        <Styles.FilterIcon $active={isFilterApplied} />
        <Layouts.Margin left="1">
          <Styles.ArrowIcon $active={isFilterOpen} />
        </Layouts.Margin>
      </Layouts.Flex>
    </Typography>
  );

  return (
    <div ref={navigationRef}>
      <Layouts.Flex direction="column" flexGrow={1} as={Layouts.Box} height="100%">
        <Layouts.Flex as={Layouts.Box} height="100%" minHeight="60px">
          {'tabs' in props && props.tabs.length > 0 ? (
            <div className={styles.itemsContainer}>
              <Navigation
                configs={props.tabs ?? []}
                border
                withEmpty
                activeTab={props.shouldDeselect && value ? undefined : props.selectedTab}
                onChange={handleTabChange}
              />
            </div>
          ) : null}
          {'routes' in props && props.routes.length > 0 ? (
            <div className={styles.itemsContainer}>
              <RoutingNavigation
                routes={props.routes ?? []}
                onRouteChange={handleRouteChange}
                withEmpty
              />
            </div>
          ) : null}

          {onSearch ? (
            <div
              className={cx(styles.input, {
                [styles.fullSize]:
                  get(props, 'routes.length', 0) === 0 && get(props, 'tabs.length', 0) === 0,
              })}
            >
              <TextInput
                name="tableNavigationSearch"
                type={numericOnly ? 'number' : 'text'}
                icon={SearchIcon}
                rightIcon={children && filterable ? () => filterIcon : undefined}
                placeholder={placeholder}
                ariaLabel={placeholder}
                value={value}
                inputContainerClassName={styles.searchContainer}
                onChange={handleChange}
                onKeyUp={handleKeyUp}
                noError
              />
            </div>
          ) : null}
          {!onSearch && filterable && showFilterIcon ? (
            <Layouts.Flex alignItems="center">
              <Layouts.Margin right="1">{filterIcon}</Layouts.Margin>
            </Layouts.Flex>
          ) : null}
        </Layouts.Flex>
        {children && filterable ? (
          <FilterContext.Provider value={filterContextValue}>{children}</FilterContext.Provider>
        ) : null}
      </Layouts.Flex>
    </div>
  );
};
