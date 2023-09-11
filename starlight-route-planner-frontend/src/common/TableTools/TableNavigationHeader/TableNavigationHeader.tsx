import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import {
  Layouts,
  Navigation,
  NavigationConfigItem,
  RoutingNavigation,
  SearchIcon,
  TextInput,
  TextInputElement,
  Typography,
  useToggle,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { get } from 'lodash-es';

import { FilterContext } from '../TableFilter/context';
import { ITableFilterContext } from '../TableFilter/types';

import * as Styles from './styles';
import { ITableNavigationHeaderHandle, TableNavigationHeaderProps } from './types';

import styles from './css/styles.scss';

const TableNavigationHeader: React.ForwardRefRenderFunction<
  ITableNavigationHeaderHandle,
  TableNavigationHeaderProps
> = (
  {
    placeholder,
    numericOnly,
    className,
    additionalFilterHandler,
    additionalFilterActive,
    children,
    onSearch,
    filterable,
    tableRef,
    showFilterIcon = true,
    initialSearchValue = '',
    navigationRef = null,
    fullSizeFilter = true,
    ...props
  },
  ref,
) => {
  const [value, setValue] = useState(initialSearchValue);
  const [isFilterOpen, toggleFilter] = useToggle(false);
  const [isFilterApplied, setFilterApply] = useState(false);

  const filterContextValue = useMemo<ITableFilterContext>(
    () => ({
      isFilterOpen,
      onChangeAppliedState: setFilterApply,
    }),
    [isFilterOpen],
  );

  useImperativeHandle(
    ref,
    () => ({
      resetSearch: () => {
        setValue('');
      },
    }),
    [],
  );

  const handleTabChange = useCallback(
    (newTab: NavigationConfigItem) => {
      setValue('');
      if ('tabs' in props && newTab.key !== props.selectedTab?.key) {
        if (tableRef?.current) {
          tableRef.current.scrollTop = 0;
        }

        props.onChangeTab(newTab);
      }
    },
    [props, tableRef],
  );

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

  const filterIcon = (
    <Typography cursor="pointer" id="navigation-typography">
      <Layouts.Flex onClick={additionalFilterHandler ?? toggleFilter}>
        <Styles.FilterIcon $active={additionalFilterActive ?? isFilterApplied} />
        <Layouts.Margin left="1">
          <Styles.ArrowIcon $active={additionalFilterActive ?? isFilterOpen} />
        </Layouts.Margin>
      </Layouts.Flex>
    </Typography>
  );

  return (
    <div ref={navigationRef} className={cx(styles.tableHeader, className)}>
      <Layouts.Flex direction="column" flexGrow={1}>
        <Layouts.Flex>
          <div className={styles.itemsContainer}>
            {'tabs' in props ? (
              <Navigation
                configs={props.tabs}
                border
                withEmpty
                activeTab={props.shouldDeselect && value ? undefined : props.selectedTab}
                onChange={handleTabChange}
              />
            ) : (
              <RoutingNavigation routes={props.routes} withEmpty />
            )}
          </div>
          {onSearch && (
            <div
              className={cx(styles.input, {
                [styles.fullSize]:
                  get(props, 'routes.length', 0) === 0 &&
                  get(props, 'tabs.length', 0) === 0 &&
                  fullSizeFilter,
              })}
            >
              <TextInput
                name="tableNavigationSearch"
                type={numericOnly ? 'number' : 'text'}
                icon={SearchIcon}
                rightIcon={children || additionalFilterHandler ? () => filterIcon : undefined}
                placeholder={placeholder}
                ariaLabel={placeholder}
                value={value}
                inputContainerClassName={styles.searchContainer}
                onChange={handleChange}
                onKeyUp={handleKeyUp}
                noError
              />
            </div>
          )}
          {!onSearch && filterable && showFilterIcon && (
            <Layouts.Flex alignItems="center">
              <Layouts.Margin right="1">{filterIcon}</Layouts.Margin>
            </Layouts.Flex>
          )}
        </Layouts.Flex>
        {children && filterable && (
          <FilterContext.Provider value={filterContextValue}>{children}</FilterContext.Provider>
        )}
      </Layouts.Flex>
    </div>
  );
};

export default forwardRef(TableNavigationHeader);
