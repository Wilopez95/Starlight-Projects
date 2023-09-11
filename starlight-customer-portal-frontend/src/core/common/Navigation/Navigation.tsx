import React, { forwardRef } from 'react';
import { Carousel } from '@starlightpro/shared-components';
import cx from 'classnames';

import { Loadable } from '../Loadable/Loadable';

import { INavigation } from './types';

import styles from './css/styles.scss';

export const Navigation = forwardRef<HTMLDivElement | null, INavigation>(
  (
    {
      configs,
      onChange,
      className,
      activeTab,
      progressBar,
      border,
      withEmpty,
      carousel,
      loading: navigationLoading,
      direction = 'row',
    },
    ref,
  ) => {
    const directionClass = styles[direction];

    const Wrapper = carousel ? Carousel : React.Fragment;

    return (
      <div className={cx(styles.tabGroup, directionClass, className)} ref={ref}>
        <Wrapper>
          {configs.map((config) => {
            const { label, disabled, key, index, loading: itemLoading, width = 100 } = config;

            const loading = navigationLoading || itemLoading;

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
                  loading || disabled || activeTab?.key === config.key
                    ? undefined
                    : () => {
                        onChange(config);
                      }
                }
                tabIndex={0}
              >
                {loading ? <Loadable width={width} /> : label}
              </div>
            );
          })}
        </Wrapper>
        {withEmpty && (
          <div
            className={cx(styles.tabGroupItem, directionClass, styles.empty, {
              [styles.border]: border,
            })}
          />
        )}
      </div>
    );
  },
);
