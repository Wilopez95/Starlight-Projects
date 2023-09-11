import React, { memo, useRef } from 'react';
import { Loader } from '@starlightpro/shared-components';

import { useInfiniteLoader } from '@hooks';

import { ITableInfiniteScroll } from './types';

import styles from './css/styles.scss';

export const TableInfiniteScroll: React.FC<ITableInfiniteScroll> = memo(
  ({ loading, onLoaderReached, loaded, children, initialRequest = true }) => {
    const footerRef = useRef<HTMLDivElement>(null);

    useInfiniteLoader({
      loaded,
      loading,
      observableRef: footerRef,
      onRequest: onLoaderReached,
      initialRequest,
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
