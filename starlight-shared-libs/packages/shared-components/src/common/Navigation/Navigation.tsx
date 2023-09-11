import React, { forwardRef } from 'react';
import cx from 'classnames';

import { handleEnterOrSpaceKeyDown } from '../../helpers';
import { Carousel } from '../Carousel/Carousel';
import { Loadable } from '../Loadable/Loadable';

import { INavigation, NavigationConfigItem } from './types';

import styles from './css/styles.scss';

export const Navigation = forwardRef<HTMLDivElement | null, INavigation>(
  (
    {
      configs,
      className,
      activeTab,
      progressBar,
      border,
      withEmpty,
      carousel,
      loading: navigationLoading,
      onChange,
      direction = 'row',
    },
    ref,
  ) => {
    const directionClass = styles[direction];

    const Wrapper = carousel ? Carousel : React.Fragment;

    const handleKeyPress = (e: React.KeyboardEvent, config: NavigationConfigItem) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onChange(config);
      }
    };

    return (
      <div className={cx(styles.tabGroup, directionClass, className)} ref={ref}>
        <Wrapper>
          {configs.map((config: NavigationConfigItem) => {
            const { label, disabled, key, index, loading: itemLoading, width = 100 } = config;

            const loading = navigationLoading || itemLoading;
            const isSwitchTabsDisallowed = loading || disabled || activeTab?.key === config.key;

            return (
              <div
                key={key}
                className={cx(styles.tabGroupItem, directionClass, {
                  [styles.border]: border,
                  [styles.disabled]: disabled,
                  [styles.selected]: progressBar
                    ? index <= activeTab!.index
                    : activeTab?.key === key,
                })}
                onClick={
                  isSwitchTabsDisallowed
                    ? undefined
                    : () => {
                        onChange(config);
                      }
                }
                onKeyUp={
                  isSwitchTabsDisallowed
                    ? undefined
                    : (e: React.KeyboardEvent) => handleKeyPress(e, config)
                }
                tabIndex={0}
              >
                {loading ? <Loadable width={width} /> : label}

                {config.warning ? (
                  <div
                    className={cx(styles.warning, {
                      [styles.rowWarning]: direction === 'row',
                      [styles.columnWarning]: direction === 'column',
                    })}
                  />
                ) : null}
              </div>
            );
          })}
        </Wrapper>
        {withEmpty && !carousel ? (
          <div
            className={cx(styles.tabGroupItem, directionClass, styles.empty, {
              [styles.border]: border,
            })}
          />
        ) : null}
      </div>
    );
  },
);
