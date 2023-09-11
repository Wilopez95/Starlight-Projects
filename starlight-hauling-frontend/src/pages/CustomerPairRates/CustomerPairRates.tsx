import React, { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { GlobalService } from '@root/api';
import { Typography } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TableInfiniteScroll,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { CustomerJobSiteNavigation } from '@root/components/PageLayouts/CustomerJobSiteLayout';
import { Paths } from '@root/consts';
import { convertDates, pathToUrl } from '@root/helpers';
import { useBusinessContext, useCleanup, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { PriceGroupQuickView, PriceGroupRatesQuickView } from '@root/quickViews';
import { type PriceGroup } from '@root/stores/entities';
import { ICustomerJobSitePair } from '@root/types';

import { ICustomerJobSiteSubPage } from '../CustomerJobSites/types';
import { PriceGroupsTab } from '../SystemConfiguration/tables/PriceGroups/types';

const I18N_PATH = 'pages.CustomerPairRates.Text.';

const CustomerPairRates: React.FC<ICustomerJobSiteSubPage> = () => {
  const { businessLineStore, jobSiteStore, priceGroupStore, customerStore } = useStores();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();
  const [customerJobsitePair, setCustomerJobSitePair] = useState<
    ICustomerJobSitePair | undefined
  >();

  const history = useHistory();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { businessUnitId } = useBusinessContext();
  const { id } = useParams<{ id?: string }>();

  const currentJobSite = jobSiteStore.selectedEntity;
  const currentCustomer = customerStore.selectedEntity;
  const currentPriceGroup = priceGroupStore.selectedEntity;

  useCleanup(priceGroupStore, 'startDate', 'desc');

  useEffect(() => {
    businessLineStore.request();
  }, [businessLineStore]);

  useEffect(() => {
    if (!currentCustomer?.id || !currentJobSite?.id) {
      return;
    }

    priceGroupStore.cleanup();
    setCustomerJobSitePair(undefined);
    const query = async () => {
      const pair = convertDates(
        await GlobalService.getJobSiteCustomerPair(currentJobSite.id, currentCustomer.id),
      );

      setCustomerJobSitePair(pair);
    };

    query();
  }, [currentCustomer?.id, currentJobSite?.id, priceGroupStore]);

  const handleRequest = useCallback(() => {
    if (!customerJobsitePair) {
      return;
    }
    priceGroupStore.requestSpecific({
      customerJobSiteId: customerJobsitePair.id,
      businessUnitId,
    });
  }, [businessUnitId, customerJobsitePair, priceGroupStore]);

  useEffect(() => {
    if (id) {
      priceGroupStore.requestById(+id);
    } else {
      priceGroupStore.unSelectEntity();
    }
  }, [id, priceGroupStore]);

  const handlePriceGroupLinkClick = useCallback(
    (e: MouseEvent, group: PriceGroup) => {
      e.stopPropagation();

      const url = pathToUrl(Paths.BusinessUnitConfigurationModule.PriceGroups, {
        businessUnit: group.businessUnitId,
        businessLine: group.businessLineId,
      });

      history.push(url, { id: group.id, tab: PriceGroupsTab.customerJobSites });
    },
    [history],
  );

  const handleQuickViewClose = useCallback(() => {
    priceGroupStore.toggleRatesQuickView(false);
  }, [priceGroupStore]);

  const openPriceGroupUrl = pathToUrl(Paths.CustomerJobSiteModule.Rates, {
    businessUnit: businessUnitId,
    customerId: currentCustomer?.id,
    jobSiteId: currentJobSite?.id,
    id: currentPriceGroup?.id,
  });

  const closePriceGroupUrl = pathToUrl(Paths.CustomerJobSiteModule.Rates, {
    businessUnit: businessUnitId,
    customerId: currentCustomer?.id,
    jobSiteId: currentJobSite?.id,
  });

  return (
    <>
      <CustomerJobSiteNavigation />
      <PriceGroupQuickView
        isOpen={priceGroupStore.isOpenQuickView}
        clickOutContainers={tableContainerRef}
        shouldDeselect={!priceGroupStore.isOpenRatesQuickView}
        openUrl={openPriceGroupUrl}
        closeUrl={closePriceGroupUrl}
      />
      <PriceGroupRatesQuickView
        isOpen={priceGroupStore.isOpenRatesQuickView}
        shouldDeselect={!priceGroupStore.isOpenQuickView}
        onClose={handleQuickViewClose}
        clickOutContainers={tableContainerRef}
      />
      <TableTools.ScrollContainer>
        <Table>
          <TableTools.Header>
            <TableTools.SortableHeaderCell
              sortKey="status"
              store={priceGroupStore}
              onSort={handleRequest}
            >
              {t(`${I18N_PATH}Status`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              sortKey="startDate"
              store={priceGroupStore}
              onSort={handleRequest}
            >
              {t(`${I18N_PATH}StartDate`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              sortKey="endDate"
              store={priceGroupStore}
              onSort={handleRequest}
            >
              {t(`${I18N_PATH}EndDate`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              sortKey="description"
              store={priceGroupStore}
              onSort={handleRequest}
            >
              {t(`${I18N_PATH}Description`)}
            </TableTools.SortableHeaderCell>
          </TableTools.Header>
          <TableBody
            loading={priceGroupStore.loading}
            cells={4}
            noResult={priceGroupStore.noResult ? !!customerJobsitePair : undefined}
          >
            {priceGroupStore.values.map(priceGroup => (
              <TableRow
                selected={priceGroup.id === currentPriceGroup?.id}
                key={priceGroup.id}
                onClick={() => priceGroupStore.selectEntity(priceGroup)}
              >
                <TableCell>
                  <Typography>
                    <StatusBadge active={priceGroup.active} />
                  </Typography>
                </TableCell>
                <TableCell>
                  {priceGroup?.startDate ? formatDateTime(priceGroup.startDate).date : null}
                </TableCell>
                <TableCell>
                  {priceGroup?.endDate ? formatDateTime(priceGroup.endDate).date : null}
                </TableCell>
                <TableCell onClick={(e: MouseEvent) => handlePriceGroupLinkClick(e, priceGroup)}>
                  <Typography color="information">{priceGroup.description}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {customerJobsitePair ? (
          <TableInfiniteScroll
            onLoaderReached={handleRequest}
            loaded={priceGroupStore.loaded}
            loading={priceGroupStore.loading}
          >
            Loading Price Groups
          </TableInfiniteScroll>
        ) : null}
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(CustomerPairRates);
