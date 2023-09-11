import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { BusinessUnitLayout } from '@root/pages/layouts/BusinessUnitLayout';
import { TableNavigationHeader, TablePageContainer } from '@root/common/TableTools';
import { Button, Layouts, Typography } from '@starlightpro/shared-components';
import { useBusinessContext, useStores } from '@root/hooks';
import { Helmet } from 'react-helmet';
import { IHaulingServiceItemsParams } from '@root/api/haulingServiceItems/types';
import { useFormik } from 'formik';
import { setStoredFiltering, getStoredFiltering } from '@root/helpers/storedFiltering';
import { IMasterRouteGridUpdateItems } from '@root/stores/masterRoutes/types';
import { isEmpty } from 'lodash';
import { MasterRoutesGridTable } from '../Table';
import FiltersQuickView from '../FiltersQuickView';
import { generateValidationSchema } from '../Table/formikData';
import { StyledFormContainer } from './styles';

const I18N_PATH = 'pages.MasterRoutes.components.Text.';
const GridSection: React.FC = () => {
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const { haulingServiceItemStore, masterRoutesStore } = useStores();
  const tableNavigationRef = useRef<HTMLDivElement | null>(null);
  const [sharedFiltering, setSharedFiltering] = useState<IHaulingServiceItemsParams | null>(null);

  const formik = useFormik({
    initialValues: { services: masterRoutesStore.masterRoutesGrid },
    enableReinitialize: true,
    onSubmit: () => {},
    validationSchema: generateValidationSchema(),
    validateOnChange: true,
  });

  useEffect(() => {
    formik.setValues({ services: masterRoutesStore.masterRoutesGrid });
  }, [masterRoutesStore.masterRoutesGrid]);

  const { values, touched } = formik;
  const toggleFilterHandler = useCallback(() => {
    masterRoutesStore.toggleFiltersRouteQuickView();
  }, [masterRoutesStore]);

  const isAdditionalFilterActive = useMemo(() => {
    return masterRoutesStore.isFiltersModalOpen;
  }, [masterRoutesStore.isFiltersModalOpen]);

  const onFilterModalClose = useCallback(() => {
    masterRoutesStore.toggleFiltersRouteQuickView();
  }, [masterRoutesStore]);

  window.onfocus = () => {
    const storedFiltering: IHaulingServiceItemsParams | null = getStoredFiltering();
    if (storedFiltering) {
      setSharedFiltering(storedFiltering);
    }
  };

  const requestServiceItems = useCallback(
    async (filterOptions: IHaulingServiceItemsParams) => {
      setStoredFiltering(filterOptions);
      const { routeId, resetOffset, ...filters } = filterOptions;
      await haulingServiceItemStore.getHaulingServiceItems(businessUnitId, filters);
      await masterRoutesStore.getMasterRoutesList(businessUnitId, { input: filters });
      await masterRoutesStore.getMasterRoutesGrid(businessUnitId, {
        ...filters,
        routeId,
        resetOffset: true,
      });

      if (masterRoutesStore.isFiltersModalOpen) {
        onFilterModalClose();
      }
    },
    [businessUnitId, haulingServiceItemStore, masterRoutesStore, onFilterModalClose],
  );

  useEffect(() => {
    if (sharedFiltering) {
      requestServiceItems(sharedFiltering);
    }
  }, [sharedFiltering]);

  const handleUpdate = useCallback(async () => {
    const itemsUpdated: IMasterRouteGridUpdateItems[] = [];
    values.services.map((service, index) => {
      const data: IMasterRouteGridUpdateItems = {
        id: service.id,
        serviceItemMasterRouteId: service.serviceItemMasterRouteId,
      };
      if (
        touched.services?.[index]?.newRoute ||
        touched.services?.[index]?.newServiceDate ||
        touched.services?.[index]?.newSequence
      ) {
        service.newRoute ? (data.newRoute = service.newRoute) : null;
        service.newServiceDate ? (data.newServiceDay = service.newServiceDate) : null;
        service.currentSequence !== null && service.currentSequence >= 0
          ? (data.newSequence = service.currentSequence)
          : null;
        itemsUpdated.push(data);
      }
      return data;
    });
    if (!isEmpty(itemsUpdated)) {
      await masterRoutesStore.updateMasterRoutesGrid({ data: itemsUpdated });
      requestServiceItems(sharedFiltering ?? {});
    }
  }, [touched, values, sharedFiltering]);

  return (
    <>
      <Helmet title={t(`${I18N_PATH}Title`)} />
      <BusinessUnitLayout>
        <TablePageContainer>
          <StyledFormContainer formik={formik}>
            <Layouts.Margin bottom="3">
              <Layouts.Flex justifyContent="space-between" alignItems="center">
                <Layouts.Flex>
                  <Typography variant="headerTwo">{t(`${I18N_PATH}Title`)}</Typography>
                </Layouts.Flex>
                <Button variant="primary" onClick={handleUpdate}>
                  {t(`${I18N_PATH}UpdateRoutes`)}
                </Button>
              </Layouts.Flex>
            </Layouts.Margin>
            <TableNavigationHeader
              routes={[]}
              placeholder={t(`${I18N_PATH}InputPlaceholder`)}
              filterable
              navigationRef={tableNavigationRef}
              additionalFilterActive={isAdditionalFilterActive}
              additionalFilterHandler={toggleFilterHandler}
              fullSizeFilter={false}
            />
            <MasterRoutesGridTable />
          </StyledFormContainer>
        </TablePageContainer>
        <FiltersQuickView
          onClose={onFilterModalClose}
          onSubmitFiltersOptions={requestServiceItems}
          mainContainerRef={tableNavigationRef}
        />
      </BusinessUnitLayout>
    </>
  );
};

export default observer(GridSection);
