import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { isNumber } from 'lodash';
import { TextInput, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';
import { getIn, useFormikContext } from 'formik';
import { useBusinessContext, useStores } from '@root/hooks';
import { RouteColorPreview } from '@root/common';
import { getStoredFiltering } from '@root/helpers/storedFiltering';

import {
  Table,
  TableBody,
  TableCell,
  TableInfiniteScroll,
  TableRow,
  TableScrollContainer,
} from '@root/common/TableTools';

import { DAYS_LIST } from '@root/consts/serviceDays';

import { IMasterRouteGridItem } from '@root/stores/masterRoutes/types';
import { IHaulingServiceItemsParams } from '@root/api/haulingServiceItems/types';
import { MasterRoutesGridTableHeader } from './TableHeader';
import { StyledSelect } from './styles';
import { IMasterRouteOption, IRouteServiceDays } from './types';
interface IServiceFormikData {
  services: IMasterRouteGridItem[];
}

const I18N_PATH = 'pages.Dispatcher.components.MasterRoutesGrid.Table.Text.';

export const MasterRoutesGridTable: React.FC = observer(() => {
  const { values, setFieldValue, setFieldTouched, touched, errors } =
    useFormikContext<IServiceFormikData>();

  const { t } = useTranslation();
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const { businessUnitId } = useBusinessContext();

  const { masterRoutesStore } = useStores();

  const request = useCallback(async () => {
    await masterRoutesStore.getMasterRoutesGrid(
      businessUnitId,
      getStoredFiltering() as IHaulingServiceItemsParams,
    );
    await masterRoutesStore.getMasterRoutesList(businessUnitId);
  }, [masterRoutesStore.getMasterRoutesGrid]);

  const handleWeekDayChange = useCallback(
    (_: string, value: number, index: number, serviceId: number) => {
      const service = { ...values.services[index] };
      service.newServiceDate = value;
      setFieldTouched(`services[${index}].newServiceDate`, true);
      setFieldValue(`services[${index}]`, service);
      masterRoutesStore.setNewServiceDay(serviceId, service.newServiceDate);
    },
    [setFieldValue, setFieldTouched, values],
  );

  const loadMore = useCallback(async () => {
    await request();
  }, [request]);

  const serviceDaysOptions: IRouteServiceDays[] = useMemo(() => {
    const serviceDays: IRouteServiceDays[] = [];

    masterRoutesStore.values.forEach(route => {
      const newServiceDaysList = route.serviceDaysList.map((day: number) => {
        return {
          label: DAYS_LIST.find(dayItem => dayItem.value === day)?.label ?? '',
          value: day,
        };
      });

      const service = {
        id: route.id,
        serviceDaysList: newServiceDaysList,
      };

      serviceDays.push(service);
    });

    return serviceDays;
  }, [masterRoutesStore.values]);

  const getServiceDaysOptions = (serviceItem: IMasterRouteGridItem) => {
    let serviceRouteId = serviceItem.routeId;
    if (serviceItem.newRoute) {
      serviceRouteId = serviceItem.newRoute;
    }

    const serviceDays = serviceDaysOptions.find(route => route.id === serviceRouteId);

    return serviceDays?.serviceDaysList ?? [];
  };

  const masterRouteOptions: IMasterRouteOption[] = useMemo(() => {
    const routes = masterRoutesStore.values;

    const newRoutes: IMasterRouteOption[] = routes.map(route => {
      // TODO MAKE THIS A CONST
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const daysList = route.serviceDaysList.map(dayNumber => days[dayNumber]);

      return {
        value: route.id,
        label: `${route.name} - ( ${daysList.concat()} )`,
        serviceDaysList: route.serviceDaysList,
      };
    });

    return newRoutes;
  }, [masterRoutesStore.values]);

  const reorder = useCallback(
    (value, service) => {
      const up = value < (service.currentSequence ?? -1);
      const currentRouteId = service.newRoute ? service.newRoute : service.routeId;
      const currentServiceDay = isNumber(service.newServiceDate)
        ? service.newServiceDate
        : service.currentServiceDay;
      values.services.map((serviceItem, index) => {
        const curretService = { ...values.services[index] };
        const routeId = serviceItem.newRoute ? serviceItem.newRoute : serviceItem.routeId;
        const serviceDay = isNumber(serviceItem.newServiceDate)
          ? serviceItem.newServiceDate
          : serviceItem.currentServiceDay;
        if (routeId === currentRouteId && serviceDay === currentServiceDay) {
          if (
            isNumber(serviceItem.currentSequence) &&
            ((serviceItem.currentSequence >= service.currentSequence &&
              serviceItem.currentSequence <= value) ||
              (serviceItem.currentSequence <= service.currentSequence &&
                serviceItem.currentSequence >= value))
          ) {
            if (service.subscriptionId === serviceItem.subscriptionId) {
              curretService.currentSequence = value;
            } else if (up) {
              isNumber(curretService.currentSequence) && curretService.currentSequence++;
            } else {
              isNumber(curretService.currentSequence) && curretService.currentSequence--;
            }
            setFieldTouched(`services[${index}].newSequence`, true);
          }
          setFieldValue(`services[${index}]`, curretService);
        }
        return service;
      });
    },
    [values, setFieldValue, setFieldTouched],
  );

  const handleRouteChange = useCallback(
    (_: string, value: number, index: number, serviceId: number) => {
      const service = { ...values.services[index] };
      const newRouteId: number = value;

      // Sets the new route
      service.newRoute = newRouteId;

      // Sets the service "serviceDay" to the 1st "serviceDay" of the new route
      const routeOption: IMasterRouteOption | undefined = masterRouteOptions.find(
        route => route.value === newRouteId,
      );
      const newServiceDay: number = routeOption ? routeOption.serviceDaysList[0] : 0;

      service.newServiceDate = newServiceDay;
      const lengthSequence = values.services.filter(
        item => item.routeId === newRouteId && item.currentServiceDay === newServiceDay,
      ).length;
      const lengthSequenceOriginal = values.services.filter(
        item =>
          item.routeId === service.routeId && item.currentServiceDay === service.currentServiceDay,
      ).length;

      let valueSequence = 0;
      let newSequence = 0;
      if (routeOption) {
        service.currentSequence = lengthSequence;
        valueSequence = lengthSequenceOriginal;
        newSequence = isNumber(service.originalSequence) ? service.originalSequence : 0;
      } else {
        service.currentSequence = isNumber(service.originalSequence) ? service.originalSequence : 0;
        valueSequence = isNumber(service.originalSequence) ? service.originalSequence : 0;
        newSequence = lengthSequenceOriginal;
      }

      reorder(valueSequence, {
        ...service,
        currentSequence: newSequence,
        newRoute: undefined,
        newServiceDate: undefined,
      });

      setFieldTouched(`services[${index}].newRoute`, true);
      setFieldValue(`services[${index}]`, service);
      masterRoutesStore.setNewRoute(serviceId, service.newRoute);
    },
    [setFieldValue, setFieldTouched, values, touched],
  );

  const handleSequenceChange = useCallback(
    (value: number, indexCurrentItem, serviceId: number) => {
      if (value > 0 && !isNaN(value)) {
        const service = { ...values.services[indexCurrentItem] };
        const top = values.services.filter(
          item =>
            item.routeId === service.routeId &&
            item.currentServiceDay === service.currentServiceDay,
        ).length;
        setFieldValue(`services[${indexCurrentItem}].top`, top);
        if (value <= top) {
          reorder(value - 1, service);
        }
        setFieldValue(`services[${indexCurrentItem}].newSequence`, value);
      } else {
        setFieldValue(`services[${indexCurrentItem}].newSequence`, '');
      }

      masterRoutesStore.setNewSequence(serviceId, value);
    },
    [setFieldValue, reorder, values],
  );

  const handleBlurSequence = (value: number, indexCurrentItem: number) => {
    if (isNaN(value)) {
      setFieldValue(`services[${indexCurrentItem}].newSequence`, '');
      setFieldTouched(`services[${indexCurrentItem}].newSequence`, false);
    }
  };

  return (
    <TableScrollContainer ref={tableContainerRef}>
      <Table>
        <MasterRoutesGridTableHeader tableContainerRef={tableContainerRef} />
        <TableBody
          loading={masterRoutesStore.masterRoutesGridLoading}
          noResult={masterRoutesStore.isGridEmpty}
          cells={7}
        >
          {values.services.map((serviceItem, index) => (
            <TableRow key={`${serviceItem.id}-${serviceItem.currentServiceDay}-${index}`}>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {serviceItem.customerName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {serviceItem.subscriptionId}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {serviceItem.jobSiteName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {serviceItem.serviceName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {serviceItem.serviceFrequencyName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {serviceItem.materialName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {serviceItem.equipmentSize}
                </Typography>
              </TableCell>
              <TableCell>
                {masterRoutesStore.values.find(route => route.id === serviceItem.routeId)?.color ? (
                  <RouteColorPreview
                    color={
                      masterRoutesStore.values.find(route => route.id === serviceItem.routeId)
                        ?.color ?? ''
                    }
                  />
                ) : null}

                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  &nbsp; {serviceItem.currentRoute}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  <StyledSelect
                    name={`services[${index}].route`}
                    options={masterRouteOptions}
                    value={serviceItem.newRoute}
                    onSelectChange={(_, value: number) =>
                      handleRouteChange(_, value, index, serviceItem.id)
                    }
                    size="medium"
                    searchable={true}
                  />
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {serviceItem.currentSequence === null ? '-' : serviceItem.currentSequence + 1}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  <TextInput
                    name={`services[${index}].newSequence`}
                    type="number"
                    value={serviceItem.newSequence}
                    onChange={e =>
                      handleSequenceChange(parseInt(e.target.value, 10), index, serviceItem.id)
                    }
                    onBlur={e => handleBlurSequence(parseInt(e.target.value, 10), index)}
                    error={getIn(errors, `services[${index}].newSequence`)}
                  />
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  {
                    DAYS_LIST.find(dayItem => dayItem.value === serviceItem.currentServiceDay)
                      ?.label
                  }
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="bodyMedium" color="secondary" shade="dark">
                  <StyledSelect
                    name={`services[${index}].weekDate`}
                    options={getServiceDaysOptions(serviceItem)}
                    value={serviceItem.newServiceDate}
                    onSelectChange={(_, value: number) =>
                      handleWeekDayChange(_, value, index, serviceItem.id)
                    }
                    size="medium"
                  />
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TableInfiniteScroll
        loaded={masterRoutesStore.masterRoutesGridLoaded}
        loading={masterRoutesStore.masterRoutesGridLoading}
        onLoaderReached={loadMore}
        initialRequest={true}
      >
        {t(`${I18N_PATH}LoadMore`)}
      </TableInfiniteScroll>
    </TableScrollContainer>
  );
});
