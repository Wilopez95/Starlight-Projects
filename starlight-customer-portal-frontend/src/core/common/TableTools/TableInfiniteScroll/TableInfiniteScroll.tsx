import React, { memo, useRef } from 'react';

import { Loader } from '@root/core/common';
import { useInfiniteLoader } from '@root/core/hooks';

import { ITableInfiniteScroll } from './types';

import styles from './css/styles.scss';

export const TableInfiniteScroll: React.FC<ITableInfiniteScroll> = memo(
  ({ loading, onLoaderReached, loaded, children }) => {
    const footerRef = useRef<HTMLDivElement>(null);

    useInfiniteLoader({
      loaded,
      loading,
      observableRef: footerRef,
      onRequest: onLoaderReached,
      initialRequest: true,
    });

    if (loaded) {
      return null;
    }

    return (
      <div ref={footerRef} className={styles.footer} onClick={onLoaderReached}>
        <Loader className={styles.loader} active={loading} />
        {children}
      </div>
    );
  },
);
