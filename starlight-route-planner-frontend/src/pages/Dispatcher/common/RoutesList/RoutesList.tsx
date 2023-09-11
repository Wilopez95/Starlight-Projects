import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { useScrollHeight } from '@root/hooks';

import * as Styles from './styled';

interface IRoutesList {
  count: number;
  hasMore: boolean;
  loadMore(): void;
}

const I18N_PATH_ROUTE_LIST = 'quickViews.RoutesList.Text.';

export const RoutesList: React.FC<IRoutesList> = ({ children, count, hasMore, loadMore }) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerHeight = useScrollHeight(scrollRef);

  return (
    <>
      <Layouts.Box height="100%">
        <Layouts.Box>
          <Layouts.Padding left="3" top="3" right="3">
            <Styles.Header alignItems="center">
              <Styles.RoutesIcon />
              <Typography color="default" as="label" shade="standard" variant="headerThree">
                <>
                  {t(`${I18N_PATH_ROUTE_LIST}Title`)}
                  <Styles.RoutesCountText>{count}</Styles.RoutesCountText>
                </>
              </Typography>
            </Styles.Header>
          </Layouts.Padding>
        </Layouts.Box>
        <Layouts.Scroll id="scrollableDiv" height={scrollContainerHeight} ref={scrollRef}>
          <Layouts.Padding left="3" right="3">
            <InfiniteScroll
              dataLength={count}
              next={loadMore}
              loader={null}
              hasMore={hasMore}
              scrollableTarget="scrollableDiv"
            >
              {children}
            </InfiniteScroll>
          </Layouts.Padding>
        </Layouts.Scroll>
      </Layouts.Box>
    </>
  );
};
