import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import {
  Table,
  TableInfiniteScroll,
  TablePageContainer,
  TableTools,
} from '@root/common/TableTools';
import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useCleanup, useStores } from '@root/hooks';
import { LandfillOperationsEditQuickView } from '@root/quickViews';
import { LandfillOperation } from '@root/stores/entities';

import { LandfillOperationsTableHeader } from './LandfillOperationsTable/Header/Header';
import LandfillOperationsTable from './LandfillOperationsTable/LandfillOperationsTable';
import { useLandfillOperationParams } from './hooks';
import { LandfillOperationsFilters } from './LandfillOperationsFilters';

const I18N_PATH = 'pages.LandfillOperations.Text.';

const LandfillOperationsPage: React.FC = () => {
  const { landfillOperationStore, materialStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const [filterState, setFilterState] = useState<AppliedFilterState>({});
  const [search, setSearch] = useState<string>();
  const { landfillId } = useLandfillOperationParams();

  const selectedLandfillOperation = landfillOperationStore.selectedEntity;

  const { t } = useTranslation();

  useCleanup(landfillOperationStore, 'id', 'desc');

  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  const requestParams = useMemo(
    () => ({
      businessUnitId: +businessUnitId,
      filterData: filterState,
      query: search,
    }),
    [businessUnitId, filterState, search],
  );

  const loadMore = useCallback(() => {
    landfillOperationStore.request(requestParams);
  }, [landfillOperationStore, requestParams]);

  const handleChangeSort = useCallback(() => {
    landfillOperationStore.cleanup();
    loadMore();
  }, [landfillOperationStore, loadMore]);

  useEffect(() => {
    landfillOperationStore.cleanup();
    landfillOperationStore.request(requestParams);
    landfillOperationStore.requestCount(requestParams);
  }, [landfillOperationStore, requestParams]);

  useEffect(() => {
    materialStore.request({ activeOnly: true }, true);
  }, [materialStore]);

  useEffect(() => {
    if (landfillId && !selectedLandfillOperation) {
      const query = async () => {
        const maybeEntity = await landfillOperationStore.requestById(landfillId);

        if (maybeEntity) {
          landfillOperationStore.selectEntity(maybeEntity);
        }
      };

      query();
    }
  }, [landfillId, landfillOperationStore, selectedLandfillOperation]);

  const handleSelectLandfillOperation = useCallback(
    (landfill: LandfillOperation) => {
      landfillOperationStore.selectEntity(landfill);
    },
    [landfillOperationStore],
  );

  return (
    <>
      <LandfillOperationsEditQuickView
        isOpen={landfillOperationStore.isOpenQuickView}
        clickOutContainers={tableBodyRef}
        openUrl={pathToUrl(Paths.LandfillOperationsModule.LandfillOperations, {
          businessUnit: businessUnitId,
          id: selectedLandfillOperation?.id,
        })}
        closeUrl={pathToUrl(Paths.LandfillOperationsModule.LandfillOperations, {
          businessUnit: businessUnitId,
        })}
      />
      <TablePageContainer>
        <Layouts.Margin bottom="2">
          <Layouts.Flex alignItems="center">
            <Typography as="h1" variant="headerTwo">
              {t(`${I18N_PATH}LandfillOperations`)}
            </Typography>
            <Layouts.Margin left="2">
              <Typography variant="bodyMedium">
                {landfillOperationStore.values.length} of{' '}
                {landfillOperationStore?.counts?.filteredTotal ?? 0}
              </Typography>
            </Layouts.Margin>
          </Layouts.Flex>
        </Layouts.Margin>

        <TableTools.ScrollContainer
          tableNavigation={
            <TableTools.HeaderNavigation
              onSearch={setSearch}
              placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
              filterable
              routes={[]}
            >
              <LandfillOperationsFilters onApply={setFilterState} />
            </TableTools.HeaderNavigation>
          }
        >
          <Table>
            <Helmet title={t('Titles.AllLandfillOperations')} />
            <LandfillOperationsTableHeader onSort={handleChangeSort} />
            <LandfillOperationsTable ref={tableBodyRef} onSelect={handleSelectLandfillOperation} />
          </Table>
          <TableInfiniteScroll
            onLoaderReached={loadMore}
            loaded={landfillOperationStore.loaded}
            loading={landfillOperationStore.loading}
            initialRequest={false}
          >
            {t(`${I18N_PATH}LoadingLandfillOperations`)}
          </TableInfiniteScroll>
        </TableTools.ScrollContainer>
      </TablePageContainer>
    </>
  );
};

export default observer(LandfillOperationsPage);
