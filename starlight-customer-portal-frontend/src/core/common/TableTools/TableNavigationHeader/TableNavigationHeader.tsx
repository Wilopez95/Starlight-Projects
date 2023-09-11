import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import {
  Layouts,
  SearchIcon,
  TextInput,
  TextInputElement,
  Typography,
  useToggle,
} from '@starlightpro/shared-components';
import cx from 'classnames';

import { Navigation, RoutingNavigation } from '@root/core/common';
import type { NavigationConfigItem } from '@root/core/common/Navigation/types';

import { FilterContext } from '../TableFilter/context';
import { ITableFilterContext } from '../TableFilter/types';

import * as Styles from './styles';
import type { ITableNavigationHeaderHandle, TableNavigationHeaderProps } from './types';

import styles from './css/styles.scss';

const TableNavigationHeader: React.ForwardRefRenderFunction<
  ITableNavigationHeaderHandle,
  TableNavigationHeaderProps
> = (
  {
    placeholder,
    numericOnly,
    className,
    children,
    onSearch,
    filterable,
    showFilterIcon = true,
    initialSearchValue = '',
    navigationRef = null,
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
      if ('tabs' in props) {
        if (newTab.key !== props.selectedTab?.key) {
          if (props.tableRef.current) {
            props.tableRef.current.scrollTop = 0;
          }

          props.onChangeTab(newTab);
        }
      }
    },
    [props],
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
    <Typography cursor='pointer'>
      <Layouts.Flex onClick={toggleFilter}>
        <Styles.FilterIcon active={isFilterApplied} />
        <Layouts.Margin left='1'>
          <Styles.ArrowIcon active={isFilterOpen} />
        </Layouts.Margin>
      </Layouts.Flex>
    </Typography>
  );

  return (
    <div ref={navigationRef} className={cx(styles.tableHeader, className)}>
      <Layouts.Flex direction='column' flexGrow={1}>
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
            <div className={styles.input}>
              <TextInput
                name='tableNavigationSearch'
                type={numericOnly ? 'number' : 'text'}
                icon={SearchIcon}
                rightIcon={children && filterable ? () => filterIcon : undefined}
                placeholder={placeholder}
                value={value}
                inputContainerClassName={styles.searchContainer}
                onChange={handleChange}
                onKeyUp={handleKeyUp}
                noError
              />
            </div>
          )}
          {!onSearch && filterable && showFilterIcon && (
            <Layouts.Flex alignItems='center'>
              <Layouts.Margin right='1'>{filterIcon}</Layouts.Margin>
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
